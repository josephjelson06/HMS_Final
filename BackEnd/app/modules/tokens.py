from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC
from datetime import datetime
from datetime import timedelta
from uuid import UUID
from uuid import uuid4

import jwt
from jwt import InvalidTokenError
from starlette.responses import Response

from app.core.config import Settings


JWT_ALGORITHM = "HS256"


class AccessTokenError(ValueError):
    pass


@dataclass(frozen=True)
class AccessTokenClaims:
    user_id: UUID
    tenant_id: UUID
    tenant_type: str
    roles: tuple[str, ...]
    jti: UUID
    issued_at: datetime
    expires_at: datetime
    actor_user_id: UUID | None = None
    acting_as_user_id: UUID | None = None

    @property
    def effective_user_id(self) -> UUID:
        return self.acting_as_user_id or self.user_id


def create_access_token(
    *,
    user_id: UUID,
    tenant_id: UUID,
    tenant_type: str,
    roles: list[str],
    jwt_secret: str,
    access_token_minutes: int,
    actor_user_id: UUID | None = None,
    acting_as_user_id: UUID | None = None,
) -> tuple[str, AccessTokenClaims]:
    issued_at = datetime.now(UTC)
    expires_at = issued_at + timedelta(minutes=access_token_minutes)
    jti = uuid4()

    payload: dict[str, object] = {
        "user_id": str(user_id),
        "tenant_id": str(tenant_id),
        "tenant_type": tenant_type,
        "roles": roles,
        "jti": str(jti),
        "iat": int(issued_at.timestamp()),
        "exp": int(expires_at.timestamp()),
    }

    if actor_user_id is not None or acting_as_user_id is not None:
        payload["impersonation"] = {
            "actor_user_id": str(actor_user_id) if actor_user_id is not None else None,
            "acting_as_user_id": str(acting_as_user_id)
            if acting_as_user_id is not None
            else None,
        }

    encoded = jwt.encode(payload, jwt_secret, algorithm=JWT_ALGORITHM)

    claims = AccessTokenClaims(
        user_id=user_id,
        tenant_id=tenant_id,
        tenant_type=tenant_type,
        roles=tuple(roles),
        jti=jti,
        issued_at=issued_at,
        expires_at=expires_at,
        actor_user_id=actor_user_id,
        acting_as_user_id=acting_as_user_id,
    )
    return encoded, claims


def decode_access_token(token: str, *, jwt_secret: str) -> AccessTokenClaims:
    try:
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=[JWT_ALGORITHM],
            options={
                "require": [
                    "user_id",
                    "tenant_id",
                    "tenant_type",
                    "roles",
                    "jti",
                    "iat",
                    "exp",
                ]
            },
        )
    except InvalidTokenError as exc:
        raise AccessTokenError("Invalid or expired access token.") from exc

    try:
        user_id = UUID(str(payload["user_id"]))
        tenant_id = UUID(str(payload["tenant_id"]))
        tenant_type = str(payload["tenant_type"])
        roles_raw = payload["roles"]
        if not isinstance(roles_raw, list) or not all(
            isinstance(role, str) for role in roles_raw
        ):
            raise ValueError("roles must be a list of strings.")
        jti = UUID(str(payload["jti"]))
        issued_at = datetime.fromtimestamp(int(payload["iat"]), UTC)
        expires_at = datetime.fromtimestamp(int(payload["exp"]), UTC)
    except (KeyError, ValueError, TypeError) as exc:
        raise AccessTokenError("Access token payload is malformed.") from exc

    actor_user_id = None
    acting_as_user_id = None

    impersonation = payload.get("impersonation")
    if impersonation is not None:
        if not isinstance(impersonation, dict):
            raise AccessTokenError("Access token impersonation payload is malformed.")
        actor_raw = impersonation.get("actor_user_id")
        acting_raw = impersonation.get("acting_as_user_id")
        try:
            actor_user_id = UUID(actor_raw) if actor_raw else None
            acting_as_user_id = UUID(acting_raw) if acting_raw else None
        except (ValueError, TypeError) as exc:
            raise AccessTokenError(
                "Access token impersonation IDs are malformed."
            ) from exc

    return AccessTokenClaims(
        user_id=user_id,
        tenant_id=tenant_id,
        tenant_type=tenant_type,
        roles=tuple(roles_raw),
        jti=jti,
        issued_at=issued_at,
        expires_at=expires_at,
        actor_user_id=actor_user_id,
        acting_as_user_id=acting_as_user_id,
    )


def set_access_token_cookie(
    response: Response, *, token: str, settings: Settings
) -> None:
    max_age = settings.access_token_minutes * 60
    response.set_cookie(
        key=settings.access_token_cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.access_token_cookie_samesite,
        max_age=max_age,
        path=settings.access_token_cookie_path,
        domain=settings.access_token_cookie_domain,
    )


def set_refresh_token_cookie(
    response: Response, *, token: str, settings: Settings
) -> None:
    max_age = settings.refresh_token_days * 24 * 60 * 60
    response.set_cookie(
        key=settings.refresh_token_cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.refresh_token_cookie_samesite,
        max_age=max_age,
        path=settings.refresh_token_cookie_path,
        domain=settings.refresh_token_cookie_domain,
    )


def clear_auth_cookies(response: Response, *, settings: Settings) -> None:
    response.delete_cookie(
        key=settings.access_token_cookie_name,
        path=settings.access_token_cookie_path,
        domain=settings.access_token_cookie_domain,
    )
    response.delete_cookie(
        key=settings.refresh_token_cookie_name,
        path=settings.refresh_token_cookie_path,
        domain=settings.refresh_token_cookie_domain,
    )
