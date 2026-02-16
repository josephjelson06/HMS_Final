from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate, RoleSchema

router = APIRouter()


@router.get("/", response_model=List[UserSchema])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


@router.post("/", response_model=UserSchema)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if email exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Generate Employee ID: ATC-EMP-XXXX
    # Simpler approach: count existing users and increment
    user_count = db.query(User).count()
    employee_id = f"ATC-EMP-{(user_count + 1):03d}"

    new_user = User(**user.dict(), employee_id=employee_id, last_login="Never")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch("/{user_id}", response_model=UserSchema)
def update_user(user_id: int, user_update: UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()
    return {"detail": "User deleted"}


@router.get("/roles", response_model=List[RoleSchema])
def get_roles(db: Session = Depends(get_db)):
    # Mock roles for now as requested (only user management CRUD was prioritized)
    return [
        {
            "name": "Super Admin",
            "desc": "Full platform administrative access.",
            "color": "purple",
            "userCount": db.query(User).filter(User.role == "Super Admin").count(),
            "status": "Active",
        },
        {
            "name": "Finance",
            "desc": "Access to invoices, billing, and subscription management.",
            "color": "blue",
            "userCount": db.query(User).filter(User.role == "Finance").count(),
            "status": "Active",
        },
        {
            "name": "Operations",
            "desc": "Manage hotels, kiosks, and support requests.",
            "color": "emerald",
            "userCount": db.query(User).filter(User.role == "Operations").count(),
            "status": "Active",
        },
        {
            "name": "Support",
            "desc": "L1/L2 technical support and ticketing system.",
            "color": "amber",
            "userCount": db.query(User).filter(User.role == "Support").count(),
            "status": "Active",
        },
    ]
