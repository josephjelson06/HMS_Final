from __future__ import annotations

from typing import List

from fastapi import HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.auth.security import create_access_token, get_password_hash, verify_password
from app.core.config import get_settings
from app.models.role import Permission, Role, RolePermission, UserRole
from app.models.user import User
from app.schemas.auth import LoginRequest, ProfileUpdate, UserResponse


settings = get_settings()


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def _get_user_roles(self, user: User) -> List[Role]:
        query = (
            self.db.query(Role)
            .join(UserRole, UserRole.role_id == Role.id)
            .filter(UserRole.user_id == user.id)
        )
        if user.tenant_id is not None:
            query = query.filter(UserRole.tenant_id == user.tenant_id)
        return query.all()

    def _is_admin_role(self, roles: List[Role]) -> bool:
        for role in roles:
            role_name = (role.name or "").strip().lower()
            if role.tenant_id is None and role_name == "super admin":
                return True
            if role.tenant_id is not None and role_name == "general manager":
                return True
        return False

    def _get_user_permissions(self, user: User) -> List[str]:
        role_ids = (
            self.db.query(UserRole.role_id)
            .filter(UserRole.user_id == user.id, UserRole.tenant_id == user.tenant_id)
            .all()
        )
        role_ids = [r[0] for r in role_ids]
        if not role_ids:
            return []

        perm_ids = (
            self.db.query(RolePermission.permission_id)
            .filter(RolePermission.role_id.in_(role_ids))
            .all()
        )
        perm_ids = [p[0] for p in perm_ids]
        if not perm_ids:
            return []

        perms = (
            self.db.query(Permission.permission_key).filter(Permission.id.in_(perm_ids)).all()
        )
        return [p[0] for p in perms]

    def login(self, response: Response, login_data: LoginRequest) -> UserResponse:
        user = self.db.query(User).filter(User.email == login_data.email).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        password_valid = False
        try:
            password_field = getattr(user, "password_hash", None) or getattr(user, "password", None)
            if password_field and verify_password(login_data.password, password_field):
                password_valid = True
        except Exception:
            password_field = getattr(user, "password_hash", None) or getattr(user, "password", None)
            if password_field == login_data.password:
                password_valid = True

        if not password_valid:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        tenant_id = user.tenant_id
        tenant_type = user.user_type
        user_roles = self._get_user_roles(user)
        role_name = user_roles[0].name if user_roles else None
        if user.user_type == "platform":
            token_roles = [f"platform:{(role_name or 'admin').lower()}"]
        else:
            token_roles = [f"hotel:{(role_name or 'orphan').lower()}"]

        permissions = self._get_user_permissions(user)
        is_orphan = len(user_roles) == 0
        is_admin = self._is_admin_role(user_roles)
        access_token = create_access_token(
            subject=user.id,
            tenant_id=tenant_id,
            tenant_type=tenant_type,
            user_type=user.user_type,
            roles=token_roles,
        )

        response.set_cookie(
            key=settings.access_token_cookie_name,
            value=f"Bearer {access_token}",
            httponly=True,
            samesite=settings.access_token_cookie_samesite,
            secure=settings.cookie_secure,
        )

        return UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=token_roles[0],
            role_name=role_name,
            user_type=user.user_type,
            tenant_id=tenant_id,
            tenant_type=tenant_type,
            access_token=access_token,
            permissions=permissions,
            is_admin=is_admin,
            is_orphan=is_orphan,
            mobile=user.mobile,
            employee_id=user.employee_id,
            status="Active" if user.is_active else "Inactive",
        )

    def logout(self, response: Response) -> dict[str, str]:
        response.delete_cookie(settings.access_token_cookie_name)
        return {"message": "Logged out successfully"}

    def me(self, current_user: User) -> UserResponse:
        user_roles = self._get_user_roles(current_user)
        role_name = user_roles[0].name if user_roles else None
        permissions = self._get_user_permissions(current_user)
        return UserResponse(
            id=current_user.id,
            email=current_user.email,
            name=current_user.name,
            role=f"{current_user.user_type}:{(role_name or 'orphan').lower()}",
            role_name=role_name,
            user_type=current_user.user_type,
            tenant_id=current_user.tenant_id,
            tenant_type=current_user.user_type,
            permissions=permissions,
            is_admin=self._is_admin_role(user_roles),
            is_orphan=len(user_roles) == 0,
            mobile=current_user.mobile,
            employee_id=current_user.employee_id,
            status="Active" if current_user.is_active else "Inactive",
        )

    def update_my_profile(self, profile: ProfileUpdate, current_user: User) -> UserResponse:
        if profile.name is not None:
            current_user.name = profile.name
        if profile.mobile is not None:
            current_user.mobile = profile.mobile
        if profile.password is not None:
            current_user.password_hash = get_password_hash(profile.password)

        self.db.commit()
        self.db.refresh(current_user)
        return self.me(current_user)
