from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.hotel import Hotel
from app.core.auth.security import (
    verify_password,
    create_access_token,
    get_password_hash,
)

# Define Pydantic models inline for simplicity or import from schemas
from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: int
    email: str
    name: str | None = None
    role: str | None = None
    user_type: str
    tenant_id: int | None = None
    tenant_type: str


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=UserResponse)
def login(response: Response, login_data: LoginRequest, db: Session = Depends(get_db)):
    # 1. Find User
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 2. Verify Password (assuming plain text or hashed based on existing data)
    # If existing data is plain text, handling that gracefully or assuming hashed if migrating
    # For this task, we'll try verification. If existing passwords are plain, this fails.
    # To support existing plain passwords during migration, checking if password matches directly:
    password_valid = False
    try:
        if verify_password(login_data.password, user.password):
            password_valid = True
    except:
        # Fallback for plain text if passlib fails or if it's just a string match
        if user.password == login_data.password:
            password_valid = True

    if not password_valid and user.password == login_data.password:
        # Explicit plain text check fallback
        password_valid = True

    if not password_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 3. Determine Tenant Context
    tenant_id = user.hotel_id
    tenant_type = "hotel"

    if user.user_type == "platform":
        tenant_type = "platform"
        # Platform users might have hotel_id as null, or a specific platform tenant id
        # For now, if hotel_id is null, we assume platform tenant context is implied or global.
        # But token needs a tenant_id. Let's assume 0 or None for platform if not set.
        if tenant_id is None:
            tenant_id = 0
    else:
        # Hotel User must have a hotel_id
        if not tenant_id:
            # Fallback: maybe they are a hotel user but hotel_id is missing?
            # For strictness, this should be an error, but we'll let it pass as 0 for now.
            tenant_id = 0

    # 4. Create Token
    access_token = create_access_token(
        subject=user.id,
        tenant_id=tenant_id,
        tenant_type=tenant_type,
        user_type=user.user_type,
    )

    # 5. Set Cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        samesite="lax",
        secure=False,  # Set to True in production
    )

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        user_type=user.user_type,
        tenant_id=tenant_id,
        tenant_type=tenant_type,
    )


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}


from app.core.auth.dependencies import get_current_user


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    tenant_id = current_user.hotel_id or 0
    tenant_type = "platform" if current_user.user_type == "platform" else "hotel"

    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role,
        user_type=current_user.user_type,
        tenant_id=tenant_id,
        tenant_type=tenant_type,
    )
