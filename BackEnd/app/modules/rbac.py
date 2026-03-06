from __future__ import annotations

from uuid import UUID
from typing import Union

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth.dependencies import get_current_user
from app.database import get_db
from app.models.platform import PlatformUser
from app.models.tenant import TenantUser


SUPER_ADMIN_ROLE = "super admin"
GENERAL_MANAGER_ROLE = "general manager"


def _normalized_role_name(role_name: str | None) -> str:
    return (role_name or "").strip().lower()


def require_permission(permission: str | list[str]):
    """Permission + tenant-boundary authorization gate.
    Supports either a single string or a list of permissions (OR logic).
    """
    perms_to_check = [permission] if isinstance(permission, str) else permission

    def dependency(
        hotel_id: UUID | None = None,
        current_user: Union[PlatformUser, TenantUser] = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> Union[PlatformUser, TenantUser]:

        # Determine user type and role
        is_platform = isinstance(current_user, PlatformUser)

        # Get role and permissions via relationship
        role = current_user.role
        if not role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User has no role assigned",
            )

        # Gather permission keys
        user_permissions = {p.key for p in role.permissions}

        # Check if ANY of the required permissions are met
        met = False
        for p_key in perms_to_check:
            required_scope = p_key.split(":", 1)[0].lower() if ":" in p_key else ""

            # 1. Scope Check: platform scope strictly requires platform user
            if required_scope == "platform" and not is_platform:
                continue

            # 2. Key Check
            if (
                p_key in user_permissions
                or "*" in user_permissions
                or "*:*:*" in user_permissions
            ):
                met = True
                break

        if not met:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission(s): {perms_to_check}",
            )

        # Tenant boundary check (only if hotel scope and hotel_id provided)
        # Note: If multiple hotel permissions were provided, this check applies to the context,
        # not the specific permission that matched.
        if hotel_id is not None:
            # If ANY of the requested perms were in 'hotel' scope, we must check tenant
            has_hotel_req = any(
                (p.split(":", 1)[0].lower() if ":" in p else "") == "hotel"
                for p in perms_to_check
            )
            if has_hotel_req and not is_platform:
                if current_user.tenant_id != hotel_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Cross-tenant access denied",
                    )

        return current_user

    return dependency


def require_admin_role(scope: str):
    """Role-identity gate for privileged actions.

    - `platform`: Super Admin only.
    - `hotel`: Super Admin or General Manager (within tenant).
    """

    normalized_scope = (scope or "").strip().lower()

    def dependency(
        hotel_id: UUID | None = None,
        current_user: Union[PlatformUser, TenantUser] = Depends(get_current_user),
    ) -> Union[PlatformUser, TenantUser]:

        is_platform = isinstance(current_user, PlatformUser)
        role_name = _normalized_role_name(current_user.role.name)

        has_sa = is_platform and role_name == SUPER_ADMIN_ROLE
        has_gm = not is_platform and role_name == GENERAL_MANAGER_ROLE

        if normalized_scope == "platform":
            if not has_sa:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Super Admin role required",
                )
            return current_user

        if normalized_scope == "hotel":
            if not is_platform:
                if hotel_id is not None and current_user.tenant_id != hotel_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Cross-tenant admin access denied",
                    )

            if not (has_sa or has_gm):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Hotel admin role required",
                )
            return current_user

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Invalid admin scope '{scope}'",
        )

    return dependency
