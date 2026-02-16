from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.role import Role
from app.models.user import User as UserModel
from app.schemas.role import Role as RoleSchema, RoleCreate, RoleUpdate

router = APIRouter()


@router.get("/", response_model=List[RoleSchema])
def get_roles(db: Session = Depends(get_db)):
    roles = db.query(Role).all()
    # Dynamically calculate userCount
    for role in roles:
        role.userCount = db.query(UserModel).filter(UserModel.role == role.name).count()
    return roles


@router.post("/", response_model=RoleSchema)
def create_role(role: RoleCreate, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.name == role.name).first()
    if db_role:
        raise HTTPException(status_code=400, detail="Role already exists")

    new_role = Role(**role.dict())
    db.add(new_role)
    db.commit()
    db.refresh(new_role)
    new_role.userCount = 0
    return new_role


@router.patch("/{name}", response_model=RoleSchema)
def update_role(name: str, role_update: RoleUpdate, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.name == name).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")

    update_data = role_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_role, key, value)

    db.commit()
    db.refresh(db_role)
    db_role.userCount = (
        db.query(UserModel).filter(UserModel.role == db_role.name).count()
    )
    return db_role


@router.delete("/{name}")
def delete_role(name: str, db: Session = Depends(get_db)):
    db_role = db.query(Role).filter(Role.name == name).first()
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Check if users are assigned
    user_count = db.query(UserModel).filter(UserModel.role == name).count()
    if user_count > 0:
        raise HTTPException(
            status_code=400, detail="Cannot delete role with assigned users"
        )

    db.delete(db_role)
    db.commit()
    return {"detail": "Role deleted"}
