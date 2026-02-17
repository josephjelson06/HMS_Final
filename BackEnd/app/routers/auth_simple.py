from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.auth.security import (
    verify_password,
    create_access_token,
)
from app.core.auth.dependencies import get_current_user

# Define Pydantic models inline for simplicity or import from schemas
from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str | None = None
    role: str | None = None
    user_type: str
    tenant_id: UUID | None = None
    tenant_type: str
    access_token: str | None = None


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=UserResponse)
def login(response: Response, login_data: LoginRequest, db: Session = Depends(get_db)):
    # 1. Find User
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 2. Verify Password
    password_valid = False
    try:
        # Check if hash_password is used (AuthModule style) or old password field
        # In our unified model, we use password_hash
        pwd_field = getattr(user, "password_hash", None) or getattr(
            user, "password", None
        )
        if pwd_field and verify_password(login_data.password, pwd_field):
            password_valid = True
    except Exception:
        # Fallback for plain text
        pwd_field = getattr(user, "password_hash", None) or getattr(
            user, "password", None
        )
        if pwd_field == login_data.password:
            password_valid = True

    if not password_valid:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # 3. Determine Tenant Context
    tenant_id = user.tenant_id
    tenant_type = user.user_type  # and mapping user_type to tenant_type if needed

    # 4. Get Roles
    # For now, we'll map user_type to platform:admin or hotel:admin
    if user.user_type == "platform":
        roles = ["platform:admin"]
    else:
        role_name = getattr(user, "role", "admin")
        roles = [f"hotel:{role_name.lower() or 'admin'}"]

    # 5. Create Token
    access_token = create_access_token(
        subject=user.id,
        tenant_id=tenant_id,
        tenant_type=tenant_type,
        user_type=user.user_type,
        roles=roles,
    )

    # 6. Set Cookie
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
        role=roles[0],
        user_type=user.user_type,
        tenant_id=tenant_id,
        tenant_type=tenant_type,
        access_token=access_token,
    )


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=getattr(current_user, "role", "Admin"),
        user_type=current_user.user_type,
        tenant_id=current_user.tenant_id,
        tenant_type=current_user.user_type,
    )
