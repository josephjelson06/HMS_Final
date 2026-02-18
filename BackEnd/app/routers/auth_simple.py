from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.core.auth.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, ProfileUpdate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=UserResponse)
def login(response: Response, login_data: LoginRequest, db: Session = Depends(get_db)):
    return AuthService(db).login(response=response, login_data=login_data)


@router.post("/logout")
def logout(response: Response, db: Session = Depends(get_db)):
    return AuthService(db).logout(response=response)


@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AuthService(db).me(current_user=current_user)


@router.patch("/me", response_model=UserResponse)
def update_my_profile(
    profile: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AuthService(db).update_my_profile(profile=profile, current_user=current_user)
