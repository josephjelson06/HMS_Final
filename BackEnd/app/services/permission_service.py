from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.role import Permission, Role, RolePermission


class PermissionService:
    def __init__(self, db: Session):
        self.db = db

    def list_all_permissions(self) -> list[Permission]:
        return self.db.query(Permission).order_by(Permission.permission_key).all()

    def list_hotel_permissions(self) -> list[Permission]:
        return (
            self.db.query(Permission)
            .filter(Permission.permission_key.startswith("hotel:"))
            .order_by(Permission.permission_key)
            .all()
        )

    def get_role_permissions(self, hotel_id: UUID, role_id: UUID) -> tuple[str, list[str]]:
        job_role = (
            self.db.query(Role).filter(Role.id == role_id, Role.tenant_id == hotel_id).first()
        )
        if not job_role:
            raise HTTPException(status_code=404, detail="Role not found in this hotel")

        perm_keys = (
            self.db.query(Permission.permission_key)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .filter(RolePermission.role_id == role_id)
            .all()
        )
        return job_role.name, [p[0] for p in perm_keys]

    def set_role_permissions(self, hotel_id: UUID, role_id: UUID, permissions: list[str]) -> str:
        job_role = (
            self.db.query(Role).filter(Role.id == role_id, Role.tenant_id == hotel_id).first()
        )
        if not job_role:
            raise HTTPException(status_code=404, detail="Role not found in this hotel")

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
