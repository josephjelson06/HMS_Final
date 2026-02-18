from __future__ import annotations

import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.auth.security import get_password_hash
from app.models.hotel import Hotel
from app.models.plan import Plan
from app.models.role import Role, UserRole
from app.models.user import User
from app.modules.limits import check_user_limit
from app.schemas.user import UserCreate, UserUpdate


logger = logging.getLogger(__name__)


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def _attach_role_names(self, users: list[User], tenant_id: UUID | None = None) -> list[User]:
        for user in users:
            query = (
                self.db.query(Role.name)
                .join(UserRole, UserRole.role_id == Role.id)
                .filter(UserRole.user_id == user.id)
            )
            if tenant_id is not None:
                query = query.filter(UserRole.tenant_id == tenant_id)
            role_entry = query.first()
            user.role = role_entry[0] if role_entry else "No Role"
        return users

    def _resolve_role(self, role_value: str, tenant_id: UUID | None) -> Role | None:
        role_obj = None
        try:
            role_id = UUID(role_value)
            role_obj = self.db.query(Role).filter(Role.id == role_id).first()
        except (ValueError, TypeError):
            role_query = self.db.query(Role).filter(Role.name == role_value)
            if tenant_id is None:
                role_query = role_query.filter(Role.tenant_id.is_(None))
            else:
                role_query = role_query.filter(Role.tenant_id == tenant_id)
            role_obj = role_query.first()
        return role_obj

    def _ensure_platform_tenant(self) -> Hotel:
        platform_tenant = self.db.query(Hotel).filter(Hotel.tenant_type == "platform").first()
        if platform_tenant:
            return platform_tenant

        enterprise_plan = self.db.query(Plan).filter(Plan.name == "Enterprise").first()
        if not enterprise_plan:
            enterprise_plan = self.db.query(Plan).first()
        if not enterprise_plan:
            raise HTTPException(status_code=500, detail="No plans available to create Platform Tenant")

        platform_tenant = Hotel(
            name="Platform Admin",
            tenant_type="platform",
            tenant_key="platform_admin",
            plan_id=enterprise_plan.id,
        )
        self.db.add(platform_tenant)
        self.db.flush()
        return platform_tenant

    def get_platform_users(self) -> list[User]:
        users = self.db.query(User).filter(User.user_type == "platform").all()
        return self._attach_role_names(users)

    def create_platform_user(self, payload: UserCreate) -> User:
        try:
            db_user = self.db.query(User).filter(User.email == payload.email).first()
            if db_user:
                raise HTTPException(status_code=400, detail="Email already registered")

            platform_tenant = self._ensure_platform_tenant()
            user_count = self.db.query(User).count()
            employee_id = f"ATC-EMP-{(user_count + 1):03d}"

            user_data = payload.model_dump(exclude={"password", "role", "hotel_id"})
            raw_password = payload.password or "Temppass@123"
            user_data["password_hash"] = get_password_hash(raw_password)
            if not user_data.get("username"):
                user_data["username"] = payload.email.split("@")[0]

            new_user = User(
                **user_data,
                employee_id=employee_id,
                user_type="platform",
                tenant_id=platform_tenant.id,
            )
            self.db.add(new_user)
            self.db.flush()

            if payload.role:
                role_obj = self._resolve_role(payload.role, tenant_id=None)
                if role_obj:
                    self.db.add(
                        UserRole(
                            tenant_id=platform_tenant.id,
                            user_id=new_user.id,
                            role_id=role_obj.id,
                        )
                    )
                else:
                    logger.warning(
                        "Role '%s' not found; user created without role assignment",
                        payload.role,
                    )

            self.db.commit()
            self.db.refresh(new_user)
            return new_user
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            logger.exception("Failed to create platform user")
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"User creation failed: {exc}") from exc

    def update_platform_user(self, user_id: UUID, payload: UserUpdate) -> User:
        db_user = self.db.query(User).filter(User.id == user_id, User.user_type == "platform").first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")

        update_data = payload.model_dump(exclude_unset=True)
        if "password" in update_data:
            password = update_data.pop("password")
            update_data["password_hash"] = get_password_hash(password)
        if "status" in update_data:
            status_value = update_data.pop("status")
            update_data["is_active"] = status_value == "Active"
        role_to_assign = update_data.pop("role", None)

        for key, value in update_data.items():
            setattr(db_user, key, value)

        if role_to_assign:
            role_obj = self._resolve_role(role_to_assign, tenant_id=None)
            if role_obj:
                self.db.query(UserRole).filter(
                    UserRole.user_id == db_user.id,
                    UserRole.tenant_id == db_user.tenant_id,
                ).delete()
                self.db.add(
                    UserRole(
                        tenant_id=db_user.tenant_id,
                        user_id=db_user.id,
                        role_id=role_obj.id,
                    )
                )
            else:
                logger.warning("Role '%s' not found; role not updated", role_to_assign)

        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def delete_platform_user(self, user_id: UUID) -> None:
        db_user = self.db.query(User).filter(User.id == user_id, User.user_type == "platform").first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        self.db.delete(db_user)
        self.db.commit()

    def get_hotel_users(self, hotel_id: UUID) -> list[User]:
        users = self.db.query(User).filter(User.tenant_id == hotel_id).all()
        return self._attach_role_names(users, tenant_id=hotel_id)

    def create_hotel_user(self, hotel_id: UUID, payload: UserCreate) -> User:
        check_user_limit(self.db, hotel_id)

        db_user = self.db.query(User).filter(User.email == payload.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        user_count = self.db.query(User).filter(User.tenant_id == hotel_id).count()
        employee_id = f"EMP-{(user_count + 1):03d}"

        user_data = payload.model_dump(exclude={"password", "role", "hotel_id"})
        if payload.password:
            user_data["password_hash"] = get_password_hash(payload.password)

        new_user = User(
            **user_data,
            employee_id=employee_id,
            tenant_id=hotel_id,
            user_type="hotel",
        )
        self.db.add(new_user)
        self.db.flush()

        if payload.role:
            role_obj = self._resolve_role(payload.role, tenant_id=hotel_id)
            if role_obj:
                self.db.add(UserRole(tenant_id=hotel_id, user_id=new_user.id, role_id=role_obj.id))
            else:
                logger.warning("Role '%s' not found for hotel %s", payload.role, hotel_id)

        self.db.commit()
        self.db.refresh(new_user)
        return new_user

    def update_hotel_user(self, hotel_id: UUID, user_id: UUID, payload: UserUpdate) -> User:
        db_user = self.db.query(User).filter(User.id == user_id, User.tenant_id == hotel_id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found in this hotel")

        update_data = payload.model_dump(exclude_unset=True)
        if "password" in update_data:
            password = update_data.pop("password")
            update_data["password_hash"] = get_password_hash(password)
        if "status" in update_data:
            status_value = update_data.pop("status")
            update_data["is_active"] = status_value == "Active"
        role_to_assign = update_data.pop("role", None)

        for key, value in update_data.items():
            setattr(db_user, key, value)

        if role_to_assign:
            role_obj = self._resolve_role(role_to_assign, tenant_id=hotel_id)
            if role_obj:
                self.db.query(UserRole).filter(
                    UserRole.user_id == db_user.id,
                    UserRole.tenant_id == hotel_id,
                ).delete()
                self.db.add(UserRole(tenant_id=hotel_id, user_id=db_user.id, role_id=role_obj.id))
            else:
                logger.warning(
                    "Role '%s' not found for hotel %s; role not updated",
                    role_to_assign,
                    hotel_id,
                )

        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def delete_hotel_user(self, hotel_id: UUID, user_id: UUID) -> None:
        db_user = self.db.query(User).filter(User.id == user_id, User.tenant_id == hotel_id).first()
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found in this hotel")
        self.db.delete(db_user)
        self.db.commit()
