from __future__ import annotations

from dataclasses import dataclass
from enum import StrEnum
from typing import Any
from uuid import UUID

from fastapi import Request

from app.core.config import get_settings
from app.modules.auth.tokens import AccessTokenError
from app.modules.auth.tokens import decode_access_token


AUTH_TENANT_ID_HEADER = "x-auth-tenant-id"
AUTH_TENANT_TYPE_HEADER = "x-auth-tenant-type"
AUTH_USER_ID_HEADER = "x-auth-user-id"
AUTH_ROLES_HEADER = "x-auth-roles"


class TenantType(StrEnum):
    PLATFORM = "platform"
    HOTEL = "hotel"


@dataclass(frozen=True)
class AuthContext:
    tenant_id: UUID
    tenant_type: TenantType
    user_id: UUID | None = None
    roles: tuple[str, ...] = ()
    actor_user_id: UUID | None = None
    acting_as_user_id: UUID | None = None
    access_token_jti: UUID | None = None


class TenantContextResolutionError(ValueError):
    def __init__(self, detail: str, status_code: int = 400) -> None:
        super().__init__(detail)
        self.detail = detail
        self.status_code = status_code


def resolve_auth_context(request: Request) -> AuthContext | None:
    """Resolve auth context from request state, access token cookie, or header-based stub."""
    existing = getattr(request.state, "auth_context", None)
    if isinstance(existing, AuthContext):
        return existing

    context = parse_auth_context_from_access_token_cookie(request)
    if context is None:
        context = parse_auth_context_from_headers(request.headers)
    request.state.auth_context = context
    return context


def parse_auth_context_from_access_token_cookie(request: Request) -> AuthContext | None:
    settings = get_settings()
    raw_token = request.cookies.get(settings.access_token_cookie_name)
    if not raw_token:
        return None

    try:
        claims = decode_access_token(raw_token, jwt_secret=settings.jwt_secret)
    except AccessTokenError as exc:
        request.state.access_token_error = str(exc)
        return None

    try:
        tenant_type = TenantType(claims.tenant_type)
    except ValueError as exc:
        raise TenantContextResolutionError("Access token tenant type claim is invalid.", status_code=401) from exc

    request.state.access_token_claims = claims
    return AuthContext(
        tenant_id=claims.tenant_id,
        tenant_type=tenant_type,
        user_id=claims.effective_user_id,
        roles=claims.roles,
        actor_user_id=claims.actor_user_id,
        acting_as_user_id=claims.acting_as_user_id,
        access_token_jti=claims.jti,
    )


def parse_auth_context_from_headers(headers: Any) -> AuthContext | None:
    tenant_id_raw = headers.get(AUTH_TENANT_ID_HEADER)
    tenant_type_raw = headers.get(AUTH_TENANT_TYPE_HEADER)
    user_id_raw = headers.get(AUTH_USER_ID_HEADER)
    roles_raw = headers.get(AUTH_ROLES_HEADER)

    if not tenant_id_raw and not tenant_type_raw and not user_id_raw:
        return None

    if not tenant_id_raw or not tenant_type_raw:
        raise TenantContextResolutionError(
            f"Both {AUTH_TENANT_ID_HEADER} and {AUTH_TENANT_TYPE_HEADER} are required when auth headers are present."
        )

    try:
        tenant_id = UUID(tenant_id_raw)
    except ValueError as exc:
        raise TenantContextResolutionError(f"Invalid {AUTH_TENANT_ID_HEADER} value: {tenant_id_raw}") from exc

    try:
        tenant_type = TenantType(tenant_type_raw)
    except ValueError as exc:
        allowed = ", ".join(member.value for member in TenantType)
        raise TenantContextResolutionError(
            f"Invalid {AUTH_TENANT_TYPE_HEADER} value: {tenant_type_raw}. Allowed values: {allowed}."
        ) from exc

    user_id = None
    if user_id_raw:
        try:
            user_id = UUID(user_id_raw)
        except ValueError as exc:
            raise TenantContextResolutionError(f"Invalid {AUTH_USER_ID_HEADER} value: {user_id_raw}") from exc

    roles: tuple[str, ...] = ()
    if roles_raw:
        roles = tuple(role.strip() for role in roles_raw.split(",") if role.strip())

    return AuthContext(
        tenant_id=tenant_id,
        tenant_type=tenant_type,
        user_id=user_id,
        roles=roles,
    )
