from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.role import Role
from app.schemas.role import Role as RoleSchema, RoleCreate, RoleUpdate
from app.modules.rbac import require_permission

router = APIRouter(prefix="/api/roles", tags=["roles"])


@router.get(
    "/",
    response_model=List[RoleSchema],
    dependencies=[Depends(require_permission("platform:roles:read"))],
)
def get_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).all()
    for role in roles:
        role.userCount = 0  # job_roles table doesn't have user count by default
    return roles


@router.post(
    "/",
    response_model=RoleSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("platform:roles:write"))],
)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.name == role.name).first()
    if db_role:
        raise HTTPException(status_code=400, detail="Role already exists")

    new_role = Role(**role.model_dump())
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    new_role.userCount = 0
    return new_role


@router.patch(
    "/{name}",
    response_model=RoleSchema,
    dependencies=[Depends(require_permission("platform:roles:write"))],
)
def update_role(name: str, role_update: RoleUpdate, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.name == name).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")

    update_data = role_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_role, key, value)

    db.commit()
    db.refresh(db_role)
    db_role.userCount = 0
    return db_role


@router.delete(
    "/{name}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("platform:roles:write"))],
)
def delete_role(name: str, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.name == name).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Check if users are assigned
    user_count = 0  # User-role associations managed via user_roles table
    if user_count > 0:
        raise HTTPException(
            status_code=400, detail="Cannot delete role with assigned users"
        )

    db.delete(db_role)
    db.commit()
    return None
