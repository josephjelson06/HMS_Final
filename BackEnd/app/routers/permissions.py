"""Permissions matrix CRUD.

- GET  /api/permissions/                           -> all available permission keys
- GET  /api/hotels/{hotel_id}/roles/{role_id}/permissions  -> keys assigned to a role
- PUT  /api/hotels/{hotel_id}/roles/{role_id}/permissions  -> replace role permission set
"""

from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.modules.rbac import require_admin_role, require_permission
from app.schemas.permission import PermissionOut, RolePermissionsIn, RolePermissionsOut
from app.services.permission_service import PermissionService

router = APIRouter(prefix="/api", tags=["permissions"])


@router.get(
    "/permissions/",
    response_model=List[PermissionOut],
    dependencies=[Depends(require_permission("platform:roles:read"))],
)
def list_all_permissions(db: Session = Depends(get_db)):
    return PermissionService(db).list_all_permissions()


@router.get(
    "/hotels/{hotel_id}/permissions/",
    response_model=List[PermissionOut],
    dependencies=[Depends(require_permission("hotel:users:read"))],
)
def list_hotel_permissions(hotel_id: UUID, db: Session = Depends(get_db)):
    return PermissionService(db).list_hotel_permissions(hotel_id=hotel_id)


@router.get(
    "/hotels/{hotel_id}/roles/{role_id}/permissions",
    response_model=RolePermissionsOut,
    dependencies=[Depends(require_permission("hotel:users:read"))],
)
def get_role_permissions(hotel_id: UUID, role_id: UUID, db: Session = Depends(get_db)):
    role_name, permissions = PermissionService(db).get_role_permissions(hotel_id=hotel_id, role_id=role_id)
    return RolePermissionsOut(role_id=role_id, role_name=role_name, permissions=permissions)


@router.put(
    "/hotels/{hotel_id}/roles/{role_id}/permissions",
    response_model=RolePermissionsOut,
    dependencies=[Depends(require_admin_role("hotel"))],
)
def set_role_permissions(hotel_id: UUID, role_id: UUID, body: RolePermissionsIn, db: Session = Depends(get_db)):
    role_name = PermissionService(db).set_role_permissions(
        hotel_id=hotel_id,
        role_id=role_id,
        permissions=body.permissions,
    )
    return RolePermissionsOut(role_id=role_id, role_name=role_name, permissions=body.permissions)
