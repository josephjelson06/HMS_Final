from __future__ import annotations

import re
from collections.abc import Iterable
from collections.abc import Sequence
from typing import Literal

from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.auth import Permission
from app.models.auth import Role
from app.models.auth import RolePermission
from app.database import get_db
from app.modules.tenant.context import AuthContext
from app.modules.tenant.dependencies import require_auth_context

FIXED_ROLES: tuple[str, ...] = (
    "platform:admin",
    "platform:ops",
    "hotel:admin",
    "hotel:staff",
)
PLATFORM_ROLES = {"platform:admin", "platform:ops"}
HOTEL_ROLES = {"hotel:admin", "hotel:staff"}
PERMISSION_PATTERN = re.compile(r"^[a-z0-9*_-]+:[a-z0-9*_-]+:[a-z0-9*_-]+$")


class AuthorizationError(ValueError):
    status_code = 403

    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


def ensure_user_type_scope(auth_context: AuthContext) -> None:
    if not auth_context.roles:
        return

    for role in auth_context.roles:
        if role not in FIXED_ROLES:
            raise AuthorizationError(f"Unknown role in auth context: {role}.")

        if auth_context.tenant_type.value == "platform" and role not in PLATFORM_ROLES:
            raise AuthorizationError(
                "Platform auth context cannot contain hotel roles."
            )

        if auth_context.tenant_type.value == "hotel" and role not in HOTEL_ROLES:
            raise AuthorizationError(
                "Hotel auth context cannot contain platform roles."
            )


def validate_permission_key(permission: str) -> tuple[str, str, str]:
    if not PERMISSION_PATTERN.fullmatch(permission):
        raise AuthorizationError(
            "Permission format must be service:resource:action with lowercase segments and optional '*' wildcards."
        )
    return tuple(permission.split(":"))  # type: ignore[return-value]


def permission_implies(granted_permission: str, required_permission: str) -> bool:
    granted_parts = validate_permission_key(granted_permission)
    required_parts = validate_permission_key(required_permission)

    for granted_segment, required_segment in zip(granted_parts, required_parts):
        if granted_segment != "*" and granted_segment != required_segment:
            return False
    return True


def has_permission(
    granted_permissions: Sequence[str], required_permission: str
) -> bool:
    validate_permission_key(required_permission)
    for granted_permission in granted_permissions:
        if permission_implies(granted_permission, required_permission):
            return True
    return False


def load_permissions_for_roles(db: Session, *, role_names: Iterable[str]) -> set[str]:
    role_names = tuple(dict.fromkeys(role_names))
    if not role_names:
        return set()

    stmt = (
        select(Permission.permission_key)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .join(Role, Role.id == RolePermission.role_id)
        .where(Role.name.in_(role_names))
    )
    return set(db.execute(stmt).scalars().all())


def get_effective_permissions(
    request: Request,
    db: Session = Depends(get_db),
    auth_context: AuthContext = Depends(require_auth_context),
) -> set[str]:
    ensure_user_type_scope(auth_context)

    cached = getattr(request.state, "effective_permissions", None)
    if isinstance(cached, set):
        return cached

    permissions = load_permissions_for_roles(db, role_names=auth_context.roles)

    # Fallback: platform admins get full access when no DB permissions exist
    if not permissions and "platform:admin" in (auth_context.roles or []):
        permissions = {"*:*:*"}

    request.state.effective_permissions = permissions
    return permissions


def require_permission(
    permission: str,
    *,
    required_tenant_type: Literal["platform", "hotel"] | None = None,
):
    validate_permission_key(permission)

    def dependency(
        auth_context: AuthContext = Depends(require_auth_context),
        effective_permissions: set[str] = Depends(get_effective_permissions),
    ) -> None:
        if (
            required_tenant_type is not None
            and auth_context.tenant_type.value != required_tenant_type
        ):
            raise HTTPException(
                status_code=403, detail="Tenant type is not authorized for this route."
            )

        if not has_permission(tuple(effective_permissions), permission):
            raise HTTPException(
                status_code=403, detail=f"Missing permission: {permission}"
            )

    return dependency


def require_tenant_permission(resource: str, action: str):
    if ":" in resource or ":" in action:
        raise AuthorizationError(
            "Resource and action must be unscoped segments without ':'."
        )

    def dependency(
        auth_context: AuthContext = Depends(require_auth_context),
        effective_permissions: set[str] = Depends(get_effective_permissions),
    ) -> str:
        required = f"{auth_context.tenant_type.value}:{resource}:{action}"
        validate_permission_key(required)
        if not has_permission(tuple(effective_permissions), required):
            raise HTTPException(
                status_code=403, detail=f"Missing permission: {required}"
            )
        return required

    return dependency
