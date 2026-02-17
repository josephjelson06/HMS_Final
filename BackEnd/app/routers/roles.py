from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.role import Role
from app.models.auth import UserRole
from app.schemas.role import Role as RoleSchema, RoleCreate, RoleUpdate
from app.modules.rbac import require_permission
from app.modules.limits import check_role_limit

router = APIRouter(prefix="/api", tags=["roles"])


def _count_users_for_role(db: Session, role_id: UUID) -> int:
    """Count users assigned to a specific role via user_roles table."""
    return (
        db.query(func.count(UserRole.user_id))
        .filter(UserRole.role_id == role_id)
        .scalar()
        or 0
    )


# ── Platform-scoped: roles with no tenant (system-wide) ──────────


@router.get(
    "/roles/",
    response_model=List[RoleSchema],
    dependencies=[Depends(require_permission("platform:roles:read"))],
)
def get_platform_roles(db: Session = Depends(get_db)):
    """Platform admin: returns only platform-scoped roles (tenant_id IS NULL)."""
    roles = db.query(Role).filter(Role.tenant_id.is_(None)).all()
    for role in roles:
        role.userCount = _count_users_for_role(db, role.id)
    return roles


@router.post(
    "/roles/",
    response_model=RoleSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("platform:roles:write"))],
)
def create_platform_role(role: RoleCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(Role).filter(Role.name == role.name, Role.tenant_id.is_(None)).first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Role already exists")

    new_role = Role(**role.model_dump(), tenant_id=None)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    new_role.userCount = 0
    return new_role


@router.patch(
    "/roles/{role_id}",
    response_model=RoleSchema,
    dependencies=[Depends(require_permission("platform:roles:write"))],
)
def update_platform_role(
    role_id: UUID,
    role_update: RoleUpdate,
    db: Session = Depends(get_db),
):
    db_role = (
        db.query(Role).filter(Role.id == role_id, Role.tenant_id.is_(None)).first()
    )
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")

    for key, value in role_update.model_dump(exclude_unset=True).items():
        setattr(db_role, key, value)

    db.commit()
    db.refresh(db_role)
    db_role.userCount = _count_users_for_role(db, db_role.id)
    return db_role


@router.delete(
    "/roles/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("platform:roles:write"))],
)
def delete_platform_role(role_id: UUID, db: Session = Depends(get_db)):
    db_role = (
        db.query(Role).filter(Role.id == role_id, Role.tenant_id.is_(None)).first()
    )
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")

    user_count = _count_users_for_role(db, db_role.id)
    if user_count > 0:
        raise HTTPException(
            status_code=400, detail="Cannot delete role with assigned users"
        )

    db.delete(db_role)
    db.commit()
    return None


# ── Platform Permissions ──────────────────────────────────────────


class RolePermissionsOut(BaseModel):
    role_id: UUID
    role_name: str
    permissions: List[str]


class RolePermissionsIn(BaseModel):
    permissions: List[str]


@router.get(
    "/roles/{role_id}/permissions",
    response_model=RolePermissionsOut,
    dependencies=[Depends(require_permission("platform:roles:read"))],
)
def get_platform_role_permissions(role_id: UUID, db: Session = Depends(get_db)):
    """Return permission keys assigned to a platform role."""
    # Import here to avoid circular dependencies if any, though top-level is fine usually
    from app.models.auth import Permission, RolePermission

    job_role = (
        db.query(Role).filter(Role.id == role_id, Role.tenant_id.is_(None)).first()
    )
    if not job_role:
        print(f"DEBUG: Role {role_id} not found in platform scope.")

        # Try finding it in hotel scope for debug
        any_role = db.query(Role).filter(Role.id == role_id).first()
        if any_role:
            print(f"DEBUG: Found role {role_id} but tenant_id is {any_role.tenant_id}")

        raise HTTPException(status_code=404, detail="Role not found")

    perm_keys = (
        db.query(Permission.permission_key)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .filter(RolePermission.role_id == role_id)
        .all()
    )

    return RolePermissionsOut(
        role_id=role_id,
        role_name=job_role.name,
        permissions=[p[0] for p in perm_keys],
    )


@router.put(
    "/roles/{role_id}/permissions",
    response_model=RolePermissionsOut,
    dependencies=[Depends(require_permission("platform:roles:write"))],
)
def set_platform_role_permissions(
    role_id: UUID,
    body: RolePermissionsIn,
    db: Session = Depends(get_db),
):
    from app.models.auth import Permission, RolePermission

    job_role = (
        db.query(Role).filter(Role.id == role_id, Role.tenant_id.is_(None)).first()
    )
    if not job_role:
        raise HTTPException(status_code=404, detail="Role not found")

    perms = (
        db.query(Permission)
        .filter(Permission.permission_key.in_(body.permissions))
        .all()
    )
    perm_id_map = {p.permission_key: p.id for p in perms}

    missing = set(body.permissions) - set(perm_id_map.keys())
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown permission keys: {', '.join(sorted(missing))}",
        )

    db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()

    for perm_key in body.permissions:
        db.add(RolePermission(role_id=role_id, permission_id=perm_id_map[perm_key]))

    db.commit()

    return RolePermissionsOut(
        role_id=role_id,
        role_name=job_role.name,
        permissions=body.permissions,
    )


# ── Hotel-scoped: each hotel manages its own roles ────────────────


@router.get(
    "/hotels/{hotel_id}/roles",
    response_model=List[RoleSchema],
    dependencies=[Depends(require_permission("hotel:users:read"))],
)
def get_hotel_roles(hotel_id: UUID, db: Session = Depends(get_db)):
    """Hotel admin: returns only roles belonging to this hotel."""
    roles = db.query(Role).filter(Role.tenant_id == hotel_id).all()
    for role in roles:
        role.userCount = _count_users_for_role(db, role.id)
    return roles


@router.post(
    "/hotels/{hotel_id}/roles",
    response_model=RoleSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def create_hotel_role(hotel_id: UUID, role: RoleCreate, db: Session = Depends(get_db)):
    # ── Plan limit enforcement ──
    check_role_limit(db, hotel_id)

    existing = (
        db.query(Role)
        .filter(Role.name == role.name, Role.tenant_id == hotel_id)
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=400, detail="Role already exists for this hotel"
        )

    new_role = Role(**role.model_dump(), tenant_id=hotel_id)
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    new_role.userCount = 0
    return new_role


@router.patch(
    "/hotels/{hotel_id}/roles/{role_name}",
    response_model=RoleSchema,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def update_hotel_role(
    hotel_id: UUID,
    role_name: str,
    role_update: RoleUpdate,
    db: Session = Depends(get_db),
):
    db_role = (
        db.query(Role)
        .filter(Role.name == role_name, Role.tenant_id == hotel_id)
        .first()
    )
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found in this hotel")

    for key, value in role_update.model_dump(exclude_unset=True).items():
        setattr(db_role, key, value)

    db.commit()
    db.refresh(db_role)
    db_role.userCount = _count_users_for_role(db, db_role.id)
    return db_role


@router.delete(
    "/hotels/{hotel_id}/roles/{role_name}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def delete_hotel_role(hotel_id: UUID, role_name: str, db: Session = Depends(get_db)):
    db_role = (
        db.query(Role)
        .filter(Role.name == role_name, Role.tenant_id == hotel_id)
        .first()
    )
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found in this hotel")

    user_count = _count_users_for_role(db, db_role.id)
    if user_count > 0:
        raise HTTPException(
            status_code=400, detail="Cannot delete role with assigned users"
        )

    db.delete(db_role)
    db.commit()
    return None
