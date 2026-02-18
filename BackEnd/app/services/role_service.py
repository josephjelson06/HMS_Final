from __future__ import annotations

import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.role import Permission, Role, RolePermission, UserRole
from app.modules.limits import check_role_limit
from app.schemas.role import RoleCreate, RoleUpdate


logger = logging.getLogger(__name__)


class RoleService:
    def __init__(self, db: Session):
        self.db = db

    def _count_users_for_role(self, role_id: UUID) -> int:
        return self.db.query(func.count(UserRole.user_id)).filter(UserRole.role_id == role_id).scalar() or 0

    def get_platform_roles(self) -> list[Role]:
        roles = self.db.query(Role).filter(Role.tenant_id.is_(None)).all()
        for role in roles:
            role.userCount = self._count_users_for_role(role.id)
        return roles

    def create_platform_role(self, payload: RoleCreate) -> Role:
        existing = (
            self.db.query(Role).filter(Role.name == payload.name, Role.tenant_id.is_(None)).first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Role already exists")

        new_role = Role(**payload.model_dump(), tenant_id=None)
        self.db.add(new_role)
        self.db.commit()
        self.db.refresh(new_role)
        new_role.userCount = 0
        return new_role

    def update_platform_role(self, role_id: UUID, payload: RoleUpdate) -> Role:
        db_role = (
            self.db.query(Role).filter(Role.id == role_id, Role.tenant_id.is_(None)).first()
        )
        if not db_role:
            raise HTTPException(status_code=404, detail="Role not found")

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(db_role, key, value)
        self.db.commit()
        self.db.refresh(db_role)
        db_role.userCount = self._count_users_for_role(db_role.id)
        return db_role

    def delete_platform_role(self, role_id: UUID) -> None:
        db_role = (
            self.db.query(Role).filter(Role.id == role_id, Role.tenant_id.is_(None)).first()
        )
        if not db_role:
            raise HTTPException(status_code=404, detail="Role not found")

        user_count = self._count_users_for_role(db_role.id)
        if user_count > 0:
            raise HTTPException(status_code=400, detail="Cannot delete role with assigned users")

        self.db.delete(db_role)
        self.db.commit()

    def get_platform_role_permissions(self, role_id: UUID) -> tuple[str, list[str]]:
        job_role = (
            self.db.query(Role).filter(Role.id == role_id, Role.tenant_id.is_(None)).first()
        )
        if not job_role:
            logger.debug("Role %s not found in platform scope", role_id)
            any_role = self.db.query(Role).filter(Role.id == role_id).first()
            if any_role:
                logger.debug(
                    "Role %s exists in hotel scope with tenant_id=%s",
                    role_id,
                    any_role.tenant_id,
                )
            raise HTTPException(status_code=404, detail="Role not found")

        perm_keys = (
            self.db.query(Permission.permission_key)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .filter(RolePermission.role_id == role_id)
            .all()
        )
        return job_role.name, [p[0] for p in perm_keys]

    def set_platform_role_permissions(self, role_id: UUID, permissions: list[str]) -> str:
        job_role = (
            self.db.query(Role).filter(Role.id == role_id, Role.tenant_id.is_(None)).first()
        )
        if not job_role:
            raise HTTPException(status_code=404, detail="Role not found")

        perms = self.db.query(Permission).filter(Permission.permission_key.in_(permissions)).all()
        perm_id_map = {p.permission_key: p.id for p in perms}
        missing = set(permissions) - set(perm_id_map.keys())
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown permission keys: {', '.join(sorted(missing))}",
            )

        self.db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()
        for perm_key in permissions:
            self.db.add(RolePermission(role_id=role_id, permission_id=perm_id_map[perm_key]))
        self.db.commit()
        return job_role.name

    def get_hotel_roles(self, hotel_id: UUID) -> list[Role]:
        roles = self.db.query(Role).filter(Role.tenant_id == hotel_id).all()
        for role in roles:
            role.userCount = self._count_users_for_role(role.id)
        return roles

    def create_hotel_role(self, hotel_id: UUID, payload: RoleCreate) -> Role:
        check_role_limit(self.db, hotel_id)

        existing = (
            self.db.query(Role).filter(Role.name == payload.name, Role.tenant_id == hotel_id).first()
        )
        if existing:
            raise HTTPException(status_code=400, detail="Role already exists for this hotel")

        new_role = Role(**payload.model_dump(), tenant_id=hotel_id)
        self.db.add(new_role)
        self.db.commit()
        self.db.refresh(new_role)
        new_role.userCount = 0
        return new_role

    def update_hotel_role(self, hotel_id: UUID, role_name: str, payload: RoleUpdate) -> Role:
        db_role = (
            self.db.query(Role).filter(Role.name == role_name, Role.tenant_id == hotel_id).first()
        )
        if not db_role:
            raise HTTPException(status_code=404, detail="Role not found in this hotel")

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(db_role, key, value)
        self.db.commit()
        self.db.refresh(db_role)
        db_role.userCount = self._count_users_for_role(db_role.id)
        return db_role

    def delete_hotel_role(self, hotel_id: UUID, role_name: str) -> None:
        db_role = (
            self.db.query(Role).filter(Role.name == role_name, Role.tenant_id == hotel_id).first()
        )
        if not db_role:
            raise HTTPException(status_code=404, detail="Role not found in this hotel")

        user_count = self._count_users_for_role(db_role.id)
        if user_count > 0:
            raise HTTPException(status_code=400, detail="Cannot delete role with assigned users")

        self.db.delete(db_role)
        self.db.commit()
