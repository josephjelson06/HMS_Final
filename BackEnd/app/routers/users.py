from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user import User
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from app.modules.rbac import require_permission
from app.modules.limits import check_user_limit
from app.core.auth.security import get_password_hash

router = APIRouter(prefix="/api", tags=["users"])


# ── Platform-scoped: admin sees only platform users ───────────────


@router.get(
    "/users/",
    response_model=List[UserSchema],
    dependencies=[Depends(require_permission("platform:users:read"))],
)
def get_platform_users(db: Session = Depends(get_db)):
    """Platform admin: returns only platform-type users."""
    return db.query(User).filter(User.user_type == "platform").all()


@router.post(
    "/users/",
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("platform:users:write"))],
)
def create_platform_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_count = db.query(User).count()
    employee_id = f"ATC-EMP-{(user_count + 1):03d}"

    user_data = user.model_dump(exclude={"password", "role", "hotel_id"})
    if user.password:
        user_data["password_hash"] = get_password_hash(user.password)

    new_user = User(**user_data, employee_id=employee_id, user_type="platform")
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ── Hotel-scoped: each hotel manages its own users ────────────────


@router.get(
    "/hotels/{hotel_id}/users",
    response_model=List[UserSchema],
    dependencies=[Depends(require_permission("hotel:users:read"))],
)
def get_hotel_users(hotel_id: UUID, db: Session = Depends(get_db)):
    """Hotel admin: returns only users belonging to this hotel."""
    return db.query(User).filter(User.tenant_id == hotel_id).all()


@router.post(
    "/hotels/{hotel_id}/users",
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def create_hotel_user(hotel_id: UUID, user: UserCreate, db: Session = Depends(get_db)):
    # ── Plan limit enforcement ──
    check_user_limit(db, hotel_id)

    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_count = db.query(User).filter(User.tenant_id == hotel_id).count()
    employee_id = f"EMP-{(user_count + 1):03d}"

    user_data = user.model_dump(exclude={"password", "role", "hotel_id"})
    if user.password:
        user_data["password_hash"] = get_password_hash(user.password)

    new_user = User(
        **user_data,
        employee_id=employee_id,
        tenant_id=hotel_id,
        user_type="hotel",
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.patch(
    "/hotels/{hotel_id}/users/{user_id}",
    response_model=UserSchema,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def update_hotel_user(
    hotel_id: UUID,
    user_id: UUID,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
):
    db_user = (
        db.query(User).filter(User.id == user_id, User.tenant_id == hotel_id).first()
    )
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found in this hotel")

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
    "/hotels/{hotel_id}/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def delete_hotel_user(hotel_id: UUID, user_id: UUID, db: Session = Depends(get_db)):
    db_user = (
        db.query(User).filter(User.id == user_id, User.tenant_id == hotel_id).first()
    )
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found in this hotel")

    db.delete(db_user)
    db.commit()
    return None
