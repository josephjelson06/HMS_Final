from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate, RoleSchema
from app.modules.rbac import require_permission
from app.core.auth.security import get_password_hash

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get(
    "/",
    response_model=List[UserSchema],
    dependencies=[Depends(require_permission("platform:users:read"))],
)
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.post(
    "/",
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("platform:users:write"))],
)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generate Employee ID
    user_count = db.query(User).count()
    employee_id = f"ATC-EMP-{(user_count + 1):03d}"

    user_data = user.model_dump()
    # In the new model, we use password_hash
    if "password" in user_data:
        password = user_data.pop("password")
        user_data["password_hash"] = get_password_hash(password)

    new_user = User(**user_data, employee_id=employee_id, last_login="Never")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch(
    "/{user_id}",
    response_model=UserSchema,
    dependencies=[Depends(require_permission("platform:users:write"))],
)
def update_user(user_id: UUID, user_update: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.model_dump(exclude_unset=True)

    if "password" in update_data:
        password = update_data.pop("password")
        update_data["password_hash"] = get_password_hash(password)

    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("platform:users:write"))],
)
def delete_user(user_id: UUID, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return None


@router.get("/roles/summary", response_model=List[RoleSchema])
def get_roles_summary(db: Session = Depends(get_db)):
    # This is for the UI dashboard - simplified since roles are now in user_roles table
    return [
        {
            "name": "Super Admin",
            "desc": "Full platform administrative access.",
            "color": "purple",
            "userCount": 0,
            "status": "Active",
        },
        {
            "name": "Finance",
            "desc": "Access to invoices, billing, and subscription management.",
            "color": "blue",
            "userCount": 0,
            "status": "Active",
        },
        {
            "name": "Operations",
            "desc": "Manage hotels, kiosks, and support requests.",
            "color": "emerald",
            "userCount": 0,
            "status": "Active",
        },
        {
            "name": "Support",
            "desc": "L1/L2 technical support and ticketing system.",
            "color": "amber",
            "userCount": 0,
            "status": "Active",
        },
    ]
