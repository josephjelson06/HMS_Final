from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.permission import RolePermissionsIn, RolePermissionsOut
from app.schemas.role import Role as RoleSchema, RoleCreate, RoleUpdate
from app.services.role_service import RoleService

router = APIRouter(prefix="/api", tags=["roles"])


@router.get(
    "/roles/",
    response_model=List[RoleSchema],
    dependencies=[Depends(require_permission("platform:roles:read"))],
)
def get_platform_roles(db: Session = Depends(get_db)):
    return RoleService(db).get_platform_roles()


@router.post(
    "/roles/",
    response_model=RoleSchema,
    status_code=201,
    dependencies=[Depends(require_permission("platform:roles:write"))],
)
def create_platform_role(role: RoleCreate, db: Session = Depends(get_db)):
    return RoleService(db).create_platform_role(payload=role)


@router.patch(
    "/roles/{role_id}",
    response_model=RoleSchema,
    dependencies=[Depends(require_permission("platform:roles:write"))],
)
def update_platform_role(role_id: UUID, role_update: RoleUpdate, db: Session = Depends(get_db)):
    return RoleService(db).update_platform_role(role_id=role_id, payload=role_update)


@router.delete(
    "/roles/{role_id}",
    status_code=204,
    dependencies=[Depends(require_permission("platform:roles:write"))],
)
def delete_platform_role(role_id: UUID, db: Session = Depends(get_db)):
    RoleService(db).delete_platform_role(role_id=role_id)
    return None


@router.get(
    "/roles/{role_id}/permissions",
    response_model=RolePermissionsOut,
    dependencies=[Depends(require_permission("platform:roles:read"))],
)
def get_platform_role_permissions(role_id: UUID, db: Session = Depends(get_db)):
    role_name, permissions = RoleService(db).get_platform_role_permissions(role_id=role_id)
    return RolePermissionsOut(role_id=role_id, role_name=role_name, permissions=permissions)


@router.put(
    "/roles/{role_id}/permissions",
    response_model=RolePermissionsOut,
    dependencies=[Depends(require_permission("platform:roles:write"))],
)
def set_platform_role_permissions(role_id: UUID, body: RolePermissionsIn, db: Session = Depends(get_db)):
    role_name = RoleService(db).set_platform_role_permissions(role_id=role_id, permissions=body.permissions)
    return RolePermissionsOut(role_id=role_id, role_name=role_name, permissions=body.permissions)


@router.get(
    "/hotels/{hotel_id}/roles",
    response_model=List[RoleSchema],
    dependencies=[Depends(require_permission("hotel:users:read"))],
)
def get_hotel_roles(hotel_id: UUID, db: Session = Depends(get_db)):
    return RoleService(db).get_hotel_roles(hotel_id=hotel_id)


@router.post(
    "/hotels/{hotel_id}/roles",
    response_model=RoleSchema,
    status_code=201,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def create_hotel_role(hotel_id: UUID, role: RoleCreate, db: Session = Depends(get_db)):
    return RoleService(db).create_hotel_role(hotel_id=hotel_id, payload=role)


@router.patch(
    "/hotels/{hotel_id}/roles/{role_name}",
    response_model=RoleSchema,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def update_hotel_role(hotel_id: UUID, role_name: str, role_update: RoleUpdate, db: Session = Depends(get_db)):
    return RoleService(db).update_hotel_role(hotel_id=hotel_id, role_name=role_name, payload=role_update)


@router.delete(
    "/hotels/{hotel_id}/roles/{role_name}",
    status_code=204,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def delete_hotel_role(hotel_id: UUID, role_name: str, db: Session = Depends(get_db)):
    RoleService(db).delete_hotel_role(hotel_id=hotel_id, role_name=role_name)
    return None
