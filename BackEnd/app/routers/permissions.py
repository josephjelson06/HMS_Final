"""Permissions matrix CRUD.

- GET  /api/permissions/                           → all available permission keys
- GET  /api/hotels/{hotel_id}/roles/{role_id}/permissions  → keys assigned to a role
- PUT  /api/hotels/{hotel_id}/roles/{role_id}/permissions  → replace role's permission set
"""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
from app.database import get_db
from app.models.auth import Permission, Role, RolePermission
from app.modules.rbac import require_permission

router = APIRouter(prefix="/api", tags=["permissions"])


# ── Schemas ───────────────────────────────────────────────────────


class PermissionOut(BaseModel):
    id: UUID
    permission_key: str
    description: str | None = None

    class Config:
        from_attributes = True


class RolePermissionsOut(BaseModel):
    role_id: UUID
    role_name: str
    permissions: List[str]  # list of permission_key strings


class RolePermissionsIn(BaseModel):
    permissions: List[str]  # list of permission_key strings to assign


# ── Routes ────────────────────────────────────────────────────────


@router.get(
    "/permissions/",
    response_model=List[PermissionOut],
    dependencies=[Depends(require_permission("platform:roles:read"))],
)
def list_all_permissions(db: Session = Depends(get_db)):
    """Return every permission key in the system (auto-discovers new ones)."""
    return db.query(Permission).order_by(Permission.permission_key).all()


@router.get(
    "/hotels/{hotel_id}/permissions/",
    response_model=List[PermissionOut],
)
def list_hotel_permissions(hotel_id: UUID, db: Session = Depends(get_db)):
    """Return permission keys relevant to hotel scope (hotel:*)."""
    return (
        db.query(Permission)
        .filter(Permission.permission_key.startswith("hotel:"))
        .order_by(Permission.permission_key)
        .all()
    )


@router.get(
    "/hotels/{hotel_id}/roles/{role_id}/permissions",
    response_model=RolePermissionsOut,
)
def get_role_permissions(hotel_id: UUID, role_id: UUID, db: Session = Depends(get_db)):
    """Return permission keys assigned to a specific job role."""
    # Verify the role belongs to this hotel
    job_role = (
        db.query(Role).filter(Role.id == role_id, Role.tenant_id == hotel_id).first()
    )
    if not job_role:
        raise HTTPException(status_code=404, detail="Role not found in this hotel")

    # Get assigned permission keys via role_permissions
    # We link job_roles to role_permissions by matching job_role.id → role_permissions.role_id
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
    "/hotels/{hotel_id}/roles/{role_id}/permissions",
    response_model=RolePermissionsOut,
)
def set_role_permissions(
    hotel_id: UUID,
    role_id: UUID,
    body: RolePermissionsIn,
    db: Session = Depends(get_db),
):
    """Replace all permissions for a role (batch save from the matrix UI)."""
    # Verify the role belongs to this hotel
    job_role = (
        db.query(Role).filter(Role.id == role_id, Role.tenant_id == hotel_id).first()
    )
    if not job_role:
        raise HTTPException(status_code=404, detail="Role not found in this hotel")

    # Resolve permission keys → permission IDs
    perms = (
        db.query(Permission)
        .filter(Permission.permission_key.in_(body.permissions))
        .all()
    )
    perm_id_map = {p.permission_key: p.id for p in perms}

    # Validate all requested keys exist
    missing = set(body.permissions) - set(perm_id_map.keys())
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown permission keys: {', '.join(sorted(missing))}",
        )

    # Delete existing assignments
    db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()

    # Insert new assignments
    for perm_key in body.permissions:
        db.add(RolePermission(role_id=role_id, permission_id=perm_id_map[perm_key]))

    db.commit()

    return RolePermissionsOut(
        role_id=role_id,
        role_name=job_role.name,
        permissions=body.permissions,
    )
