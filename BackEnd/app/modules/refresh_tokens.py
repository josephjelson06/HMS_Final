from __future__ import annotations

import hashlib
import secrets
from dataclasses import dataclass
from datetime import UTC
from datetime import datetime
from datetime import timedelta
from uuid import UUID
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy import update
from sqlalchemy.orm import Session

from app.models.auth import RefreshToken
from app.models.auth import RefreshTokenFamily


REFRESH_TOKEN_PREFIX = "rt1"
REFRESH_TOKEN_RANDOM_BYTES = 64


class RefreshTokenError(ValueError):
    status_code = 401

    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class RefreshTokenReuseDetectedError(RefreshTokenError):
    status_code = 401


@dataclass(frozen=True)
class RefreshTokenIssueResult:
    raw_token: str
    family_id: UUID
    user_id: UUID
    tenant_id: UUID
    expires_at: datetime


def build_refresh_token(tenant_id: UUID) -> str:
    random_part = secrets.token_urlsafe(REFRESH_TOKEN_RANDOM_BYTES)
    return f"{REFRESH_TOKEN_PREFIX}.{tenant_id}.{random_part}"


def parse_tenant_id_from_refresh_token(raw_token: str) -> UUID:
    parts = raw_token.split(".", 2)
    if len(parts) != 3 or parts[0] != REFRESH_TOKEN_PREFIX:
        raise RefreshTokenError("Malformed refresh token.")
    try:
        return UUID(parts[1])
    except ValueError as exc:
        raise RefreshTokenError("Malformed refresh token tenant segment.") from exc


def hash_refresh_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def issue_new_refresh_token_family(
    db: Session,
    *,
    tenant_id: UUID,
    user_id: UUID,
    refresh_token_days: int,
    created_by_user_id: UUID | None = None,
) -> RefreshTokenIssueResult:
    family = RefreshTokenFamily(
        tenant_id=tenant_id,
        user_id=user_id,
        created_by_user_id=created_by_user_id,
    )
    db.add(family)
    db.flush()

    return issue_refresh_token_in_existing_family(
        db,
        tenant_id=tenant_id,
        user_id=user_id,
        family_id=family.id,
        refresh_token_days=refresh_token_days,
    )


def issue_refresh_token_in_existing_family(
    db: Session,
    *,
    tenant_id: UUID,
    user_id: UUID,
    family_id: UUID,
    refresh_token_days: int,
) -> RefreshTokenIssueResult:
    raw_token = build_refresh_token(tenant_id)
    token_hash = hash_refresh_token(raw_token)
    expires_at = datetime.now(UTC) + timedelta(days=refresh_token_days)

    token_row = RefreshToken(
        id=uuid4(),
        tenant_id=tenant_id,
        user_id=user_id,
        family_id=family_id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(token_row)
    db.flush()

    return RefreshTokenIssueResult(
        raw_token=raw_token,
        family_id=family_id,
        user_id=user_id,
        tenant_id=tenant_id,
        expires_at=expires_at,
    )


def rotate_refresh_token(
    db: Session,
    *,
    raw_token: str,
    refresh_token_days: int,
) -> RefreshTokenIssueResult:
    token_hash = hash_refresh_token(raw_token)
    now = datetime.now(UTC)

    token_row = db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    ).scalar_one_or_none()
    if token_row is None:
        raise RefreshTokenError("Invalid refresh token.")

    family = db.get(RefreshTokenFamily, token_row.family_id)
    if family is None:
        raise RefreshTokenError("Refresh token family not found.")

    if family.revoked_at is not None:
        raise RefreshTokenError("Refresh token family is revoked.")

    token_already_spent = (
        token_row.revoked_at is not None or token_row.rotated_at is not None
    )
    if token_already_spent:
        revoke_refresh_token_family(
            db, family_id=family.id, reason="refresh_reuse_detected"
        )
        raise RefreshTokenReuseDetectedError(
            "Refresh token reuse detected; session family revoked."
        )

    if token_row.expires_at <= now:
        revoke_refresh_token_family(
            db, family_id=family.id, reason="refresh_expired_presented"
        )
        raise RefreshTokenError("Refresh token expired.")

    token_row.rotated_at = now
    db.flush()

    return issue_refresh_token_in_existing_family(
        db,
        tenant_id=token_row.tenant_id,
        user_id=token_row.user_id,
        family_id=token_row.family_id,
        refresh_token_days=refresh_token_days,
    )


def revoke_refresh_token_family(db: Session, *, family_id: UUID, reason: str) -> int:
    family = db.get(RefreshTokenFamily, family_id)
    if family is None:
        return 0

    now = datetime.now(UTC)
    family.revoked_at = now
    family.revoke_reason = reason
    family.updated_at = now

    result = db.execute(
        update(RefreshToken)
        .where(RefreshToken.family_id == family_id)
        .where(RefreshToken.revoked_at.is_(None))
        .values(revoked_at=now)
    )
    return int(result.rowcount or 0)


def revoke_family_by_refresh_token(
    db: Session,
    *,
    raw_token: str,
    reason: str,
) -> tuple[UUID | None, int]:
    token_hash = hash_refresh_token(raw_token)
    token_row = db.execute(
        select(RefreshToken).where(RefreshToken.token_hash == token_hash)
    ).scalar_one_or_none()
    if token_row is None:
        return None, 0

    revoked_tokens = revoke_refresh_token_family(
        db, family_id=token_row.family_id, reason=reason
    )
    return token_row.family_id, revoked_tokens
