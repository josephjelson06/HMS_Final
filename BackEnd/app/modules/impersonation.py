from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC
from datetime import datetime
from uuid import UUID

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.auth import ImpersonationSession
from app.modules.auth.refresh_tokens import issue_new_refresh_token_family
from app.modules.auth.refresh_tokens import revoke_refresh_token_family
from app.modules.auth.service import UserServiceError
from app.modules.auth.service import issue_access_token_for_user
from app.modules.auth.service import issue_impersonation_access_token_for_user
from app.modules.tenant.context import AuthContext


def _coerce_uuid(value: UUID | str) -> UUID:
    return value if isinstance(value, UUID) else UUID(str(value))


class ImpersonationError(UserServiceError):
    status_code = 403


@dataclass(frozen=True)
class ImpersonationStartResult:
    impersonation_session_id: UUID
    actor_user_id: UUID
    acting_as_user_id: UUID
    tenant_id: UUID
    access_token: str
    refresh_token: str
    jti: UUID
    expires_at: datetime
    roles: list[str]
    refresh_family_id: UUID


@dataclass(frozen=True)
class ImpersonationStopResult:
    actor_user_id: UUID
    actor_tenant_id: UUID
    access_token: str
    refresh_token: str
    jti: UUID
    expires_at: datetime
    roles: list[str]
    revoked_token_count: int
    ended_session_id: UUID | None


def start_impersonation(
    db: Session,
    *,
    auth_context: AuthContext,
    target_user_id: UUID,
    reason: str | None,
    jwt_secret: str,
    access_token_minutes: int,
    refresh_token_days: int,
) -> ImpersonationStartResult:
    if auth_context.tenant_type.value != "platform":
        raise ImpersonationError("Only platform admins can start impersonation.")

    if "platform:admin" not in auth_context.roles:
        raise ImpersonationError("Only platform admins can start impersonation.")

    if (
        auth_context.actor_user_id is not None
        or auth_context.acting_as_user_id is not None
    ):
        raise ImpersonationError("Nested impersonation is not allowed.")

    actor_user_id = auth_context.user_id
    if actor_user_id is None:
        raise ImpersonationError("Authenticated actor user is required.")

    actor_record = _lookup_user_in_tenant(
        db,
        tenant_id=auth_context.tenant_id,
        user_id=actor_user_id,
    )
    if actor_record is None or actor_record["user_type"] != "platform":
        raise ImpersonationError("Actor must be a platform user.")

    target = _find_user_across_tenant_type(
        db,
        user_id=target_user_id,
        tenant_type="hotel",
    )
    if target is None:
        raise ImpersonationError("Target user not found or not a hotel user.")

    target_tenant_id = _coerce_uuid(target["tenant_id"])
    target_user_type = target["user_type"]
    if target_user_type != "hotel":
        raise ImpersonationError("Platform users cannot be impersonated.")

    access_token, claims = issue_impersonation_access_token_for_user(
        db,
        actor_user_id=actor_user_id,
        acting_as_user_id=target_user_id,
        tenant_id=target_tenant_id,
        tenant_type="hotel",
        jwt_secret=jwt_secret,
        access_token_minutes=access_token_minutes,
    )

    refresh_issue = issue_new_refresh_token_family(
        db,
        tenant_id=target_tenant_id,
        user_id=target_user_id,
        refresh_token_days=refresh_token_days,
        created_by_user_id=actor_user_id,
    )

    session_row = ImpersonationSession(
        tenant_id=target_tenant_id,
        actor_user_id=actor_user_id,
        acting_as_user_id=target_user_id,
        refresh_token_family_id=refresh_issue.family_id,
        reason=reason,
    )
    db.add(session_row)
    db.flush()

    return ImpersonationStartResult(
        impersonation_session_id=session_row.id,
        actor_user_id=actor_user_id,
        acting_as_user_id=target_user_id,
        tenant_id=target_tenant_id,
        access_token=access_token,
        refresh_token=refresh_issue.raw_token,
        jti=claims.jti,
        expires_at=claims.expires_at,
        roles=list(claims.roles),
        refresh_family_id=refresh_issue.family_id,
    )


def stop_impersonation(
    db: Session,
    *,
    auth_context: AuthContext,
    jwt_secret: str,
    access_token_minutes: int,
    refresh_token_days: int,
) -> ImpersonationStopResult:
    if auth_context.actor_user_id is None or auth_context.acting_as_user_id is None:
        raise ImpersonationError("Current session is not impersonating.")

    actor_user_id = auth_context.actor_user_id
    acting_as_user_id = auth_context.acting_as_user_id

    ended_session_id = None
    revoked_count = 0

    row = (
        db.execute(
            text(
                """
            SELECT id, refresh_token_family_id
            FROM impersonation_sessions
            WHERE actor_user_id = :actor_user_id
              AND acting_as_user_id = :acting_as_user_id
              AND ended_at IS NULL
            ORDER BY started_at DESC
            LIMIT 1
            """
            ),
            {
                "actor_user_id": str(actor_user_id),
                "acting_as_user_id": str(acting_as_user_id),
            },
        )
        .mappings()
        .first()
    )

    if row is not None:
        ended_session_id = _coerce_uuid(row["id"])
        db.execute(
            text(
                """
                UPDATE impersonation_sessions
                SET ended_at = :ended_at
                WHERE id = :session_id
                """
            ),
            {
                "ended_at": datetime.now(UTC),
                "session_id": str(ended_session_id),
            },
        )

        family_id = row.get("refresh_token_family_id")
        if family_id:
            revoked_count = revoke_refresh_token_family(
                db,
                family_id=_coerce_uuid(family_id),
                reason="impersonation_stop",
            )

    # Flush tenant-scoped revocations before switching tenant scope to actor platform tenant.
    db.flush()

    actor_context = _find_user_across_tenant_type(
        db,
        user_id=actor_user_id,
        tenant_type="platform",
    )
    if actor_context is None:
        raise ImpersonationError("Actor platform user context was not found.")

    actor_tenant_id = _coerce_uuid(actor_context["tenant_id"])
    access_token, claims = issue_access_token_for_user(
        db,
        user_id=actor_user_id,
        tenant_id=actor_tenant_id,
        tenant_type="platform",
        jwt_secret=jwt_secret,
        access_token_minutes=access_token_minutes,
    )
    refresh_issue = issue_new_refresh_token_family(
        db,
        tenant_id=actor_tenant_id,
        user_id=actor_user_id,
        refresh_token_days=refresh_token_days,
        created_by_user_id=actor_user_id,
    )

    return ImpersonationStopResult(
        actor_user_id=actor_user_id,
        actor_tenant_id=actor_tenant_id,
        access_token=access_token,
        refresh_token=refresh_issue.raw_token,
        jti=claims.jti,
        expires_at=claims.expires_at,
        roles=list(claims.roles),
        revoked_token_count=revoked_count,
        ended_session_id=ended_session_id,
    )


def _find_user_across_tenant_type(
    db: Session,
    *,
    user_id: UUID,
    tenant_type: str,
) -> dict[str, str] | None:
    tenant_rows = (
        db.execute(
            text(
                """
            SELECT id
            FROM tenants
            WHERE tenant_type = :tenant_type
            ORDER BY id
            """
            ),
            {"tenant_type": tenant_type},
        )
        .mappings()
        .all()
    )

    for tenant_row in tenant_rows:
        tenant_id = _coerce_uuid(tenant_row["id"])
        candidate = _lookup_user_in_tenant(
            db,
            tenant_id=tenant_id,
            user_id=user_id,
        )
        if candidate is not None:
            return candidate
    return None


def _lookup_user_in_tenant(
    db: Session,
    *,
    tenant_id: UUID,
    user_id: UUID,
) -> dict[str, str] | None:
    db.execute(
        text("SELECT set_config('app.tenant_id', :tenant_id, true);"),
        {"tenant_id": str(tenant_id)},
    )

    row = (
        db.execute(
            text(
                """
            SELECT id, tenant_id, user_type
            FROM users
            WHERE id = :user_id
            LIMIT 1
            """
            ),
            {"user_id": str(user_id)},
        )
        .mappings()
        .first()
    )

    if row is None:
        return None

    return {
        "id": row["id"],
        "tenant_id": row["tenant_id"],
        "user_type": row["user_type"],
    }


def find_active_impersonation_for_refresh_family(
    db: Session,
    *,
    refresh_token_family_id: UUID,
) -> tuple[UUID, UUID] | None:
    row = (
        db.execute(
            text(
                """
            SELECT actor_user_id, acting_as_user_id
            FROM impersonation_sessions
            WHERE refresh_token_family_id = :refresh_token_family_id
              AND ended_at IS NULL
            ORDER BY started_at DESC
            LIMIT 1
            """
            ),
            {"refresh_token_family_id": str(refresh_token_family_id)},
        )
        .mappings()
        .first()
    )

    if row is None:
        return None

    return _coerce_uuid(row["actor_user_id"]), _coerce_uuid(row["acting_as_user_id"])
