from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User
from app.models.auth import UserRole, RolePermission, Permission
from app.core.auth.security import (
    verify_password,
    create_access_token,
    get_password_hash,
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
    permissions: List[str] = []
    mobile: str | None = None
    employee_id: str | None = None
    status: str | None = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    password: Optional[str] = None


router = APIRouter(prefix="/auth", tags=["Authentication"])


def _get_user_permissions(db: Session, user: User) -> List[str]:
    """Resolve all permission_keys for a user via their role assignments."""
    # Get all role_ids assigned to this user in their tenant
    role_ids = (
        db.query(UserRole.role_id)
        .filter(UserRole.user_id == user.id, UserRole.tenant_id == user.tenant_id)
        .all()
    )
    role_ids = [r[0] for r in role_ids]
    if not role_ids:
        # Fallback: platform admin gets full access
        if user.user_type == "platform":
            return ["*:*:*"]
        return []

    # Get all permission_ids for these roles
    perm_ids = (
        db.query(RolePermission.permission_id)
        .filter(RolePermission.role_id.in_(role_ids))
        .all()
    )
    perm_ids = [p[0] for p in perm_ids]
    if not perm_ids:
        return []

    # Get permission keys
    perms = (
        db.query(Permission.permission_key).filter(Permission.id.in_(perm_ids)).all()
    )
    return [p[0] for p in perms]


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

    # 5. Resolve permissions
    permissions = _get_user_permissions(db, user)

    # 6. Create Token
    access_token = create_access_token(
        subject=user.id,
        tenant_id=tenant_id,
        tenant_type=tenant_type,
        user_type=user.user_type,
        roles=roles,
    )

    # 7. Set Cookie
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
        permissions=permissions,
        mobile=user.mobile,
        employee_id=user.employee_id,
        status="Active" if user.is_active else "Inactive",
    )


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("access_token")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
def read_users_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    permissions = _get_user_permissions(db, current_user)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=getattr(current_user, "role", "Admin"),
        user_type=current_user.user_type,
        tenant_id=current_user.tenant_id,
        tenant_type=current_user.user_type,
        permissions=permissions,
        mobile=current_user.mobile,
        employee_id=current_user.employee_id,
        status="Active" if current_user.is_active else "Inactive",
    )


@router.patch("/me", response_model=UserResponse)
def update_my_profile(
    profile: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Self-service profile update — only name, mobile, password allowed."""
    if profile.name is not None:
        current_user.name = profile.name
    if profile.mobile is not None:
        current_user.mobile = profile.mobile
    if profile.password is not None:
        current_user.password_hash = get_password_hash(profile.password)

    db.commit()
    db.refresh(current_user)

    permissions = _get_user_permissions(db, current_user)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=getattr(current_user, "role", "Admin"),
        user_type=current_user.user_type,
        tenant_id=current_user.tenant_id,
        tenant_type=current_user.user_type,
        permissions=permissions,
        mobile=current_user.mobile,
        employee_id=current_user.employee_id,
        status="Active" if current_user.is_active else "Inactive",
    )
