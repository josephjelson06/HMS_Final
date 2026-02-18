from __future__ import annotations

from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth.dependencies import get_current_user
from app.database import get_db
from app.models.role import Permission, Role, RolePermission, UserRole
from app.models.user import User


SUPER_ADMIN_ROLE = "super admin"
GENERAL_MANAGER_ROLE = "general manager"


def _normalized_role_name(role_name: str | None) -> str:
    return (role_name or "").strip().lower()


def _get_user_roles(db: Session, user: User) -> list[Role]:
    query = (
        db.query(Role)
        .join(UserRole, UserRole.role_id == Role.id)
        .filter(UserRole.user_id == user.id)
    )
    if user.tenant_id is not None:
        query = query.filter(UserRole.tenant_id == user.tenant_id)
    return query.all()


def _has_super_admin_role(roles: list[Role]) -> bool:
    for role in roles:
        if role.tenant_id is None and _normalized_role_name(role.name) == SUPER_ADMIN_ROLE:
            return True
    return False


def _has_gm_role_for_tenant(roles: list[Role], hotel_id: UUID | None = None) -> bool:
    for role in roles:
        if (
            role.tenant_id is not None
            and _normalized_role_name(role.name) == GENERAL_MANAGER_ROLE
            and (hotel_id is None or role.tenant_id == hotel_id)
        ):
            return True
    return False


def _get_user_permissions(db: Session, user: User, role_ids: list[UUID]) -> set[str]:
    if not role_ids:
        return set()

    perm_rows = (
        db.query(Permission.permission_key)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .filter(RolePermission.role_id.in_(role_ids))
        .all()
    )
    return {row[0] for row in perm_rows}


def require_permission(permission: str):
    """Permission + tenant-boundary authorization gate."""

    required_scope = permission.split(":", 1)[0].lower() if ":" in permission else ""

    def dependency(
        hotel_id: UUID | None = None,
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        user_type = (current_user.user_type or "").lower()
        roles = _get_user_roles(db, current_user)
        role_ids = [role.id for role in roles]
        permissions = _get_user_permissions(db, current_user, role_ids)

        if required_scope == "platform" and user_type != "platform":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Platform scope required",
            )

        if required_scope == "hotel" and user_type not in {"hotel", "platform"}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Hotel scope required",
            )

        if (
            permission
            and permission not in permissions
            and "*" not in permissions
            and "*:*:*" not in permissions
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing permission: {permission}",
            )

        # Hotel users cannot access other hotels' resources even if they have matching keys.
        if (
            required_scope == "hotel"
            and hotel_id is not None
            and user_type == "hotel"
            and current_user.tenant_id != hotel_id
        ):
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
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> User:
        roles = _get_user_roles(db, current_user)
        has_sa = _has_super_admin_role(roles)
        has_gm = _has_gm_role_for_tenant(roles, hotel_id)

        if normalized_scope == "platform":
            if not has_sa:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Super Admin role required",
                )
            return current_user

        if normalized_scope == "hotel":
            if (current_user.user_type or "").lower() == "hotel":
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
