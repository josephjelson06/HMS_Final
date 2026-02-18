from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.user import User as UserSchema, UserCreate, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/api", tags=["users"])


@router.get(
    "/users/",
    response_model=List[UserSchema],
    dependencies=[Depends(require_permission("platform:users:read"))],
)
def get_platform_users(db: Session = Depends(get_db)):
    return UserService(db).get_platform_users()


@router.get(
    "/users/{user_id}",
    response_model=UserSchema,
    dependencies=[Depends(require_permission("platform:users:read"))],
)
def get_platform_user_by_id(user_id: UUID, db: Session = Depends(get_db)):
    return UserService(db).get_platform_user_by_id(user_id=user_id)


@router.post(
    "/users/",
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("platform:users:write"))],
)
def create_platform_user(user: UserCreate, db: Session = Depends(get_db)):
    return UserService(db).create_platform_user(payload=user)


@router.patch(
    "/users/{user_id}",
    response_model=UserSchema,
    dependencies=[Depends(require_permission("platform:users:write"))],
)
def update_platform_user(user_id: UUID, user_update: UserUpdate, db: Session = Depends(get_db)):
    return UserService(db).update_platform_user(user_id=user_id, payload=user_update)


@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("platform:users:write"))],
)
def delete_platform_user(user_id: UUID, db: Session = Depends(get_db)):
    UserService(db).delete_platform_user(user_id=user_id)
    return None


@router.get(
    "/hotels/{hotel_id}/users",
    response_model=List[UserSchema],
    dependencies=[Depends(require_permission("hotel:users:read"))],
)
def get_hotel_users(hotel_id: UUID, db: Session = Depends(get_db)):
    return UserService(db).get_hotel_users(hotel_id=hotel_id)


@router.post(
    "/hotels/{hotel_id}/users",
    response_model=UserSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def create_hotel_user(hotel_id: UUID, user: UserCreate, db: Session = Depends(get_db)):
    return UserService(db).create_hotel_user(hotel_id=hotel_id, payload=user)


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
    return UserService(db).update_hotel_user(hotel_id=hotel_id, user_id=user_id, payload=user_update)


@router.delete(
    "/hotels/{hotel_id}/users/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("hotel:users:write"))],
)
def delete_hotel_user(hotel_id: UUID, user_id: UUID, db: Session = Depends(get_db)):
    UserService(db).delete_hotel_user(hotel_id=hotel_id, user_id=user_id)
    return None
