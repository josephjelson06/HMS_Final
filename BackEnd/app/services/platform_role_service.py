from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.models.platform import PlatformRole, PlatformUser
from app.models.mappings import platform_role_permissions
from app.models.permissions import Permission


class PlatformRoleService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[PlatformRole]:
        return self.db.query(PlatformRole).all()

    def get_by_id(self, role_id: UUID) -> Optional[PlatformRole]:
        return self.db.query(PlatformRole).filter(PlatformRole.id == role_id).first()

    def create(
        self, name: str, description: str | None = None, color: str | None = "blue"
    ) -> PlatformRole:
        role = PlatformRole(name=name, description=description, color=color)
        self.db.add(role)
        self.db.commit()
        self.db.refresh(role)
        return role

    def update(self, role_id: UUID, payload: dict) -> Optional[PlatformRole]:
        role = self.get_by_id(role_id)
        if not role:
            return None

        # Explicitly handle fields to ensure they are updated correctly
        if "name" in payload:
            role.name = payload["name"]
        if "description" in payload:
            role.description = payload["description"]
        if "color" in payload:
            role.color = payload["color"]
        if "status" in payload:
            role.status = payload["status"]

        self.db.commit()
        self.db.refresh(role)
        return role

    def get_permissions(self, role_id: UUID) -> List[str]:
        result = (
            self.db.query(Permission.key)
            .join(
                platform_role_permissions,
                Permission.id == platform_role_permissions.c.permission_id,
            )
            .filter(platform_role_permissions.c.role_id == role_id)
            .all()
        )
        return [row[0] for row in result]

    def update_permissions(self, role_id: UUID, permission_keys: List[str]):
        # Clear existing
        self.db.execute(
            platform_role_permissions.delete().where(
                platform_role_permissions.c.role_id == role_id
            )
        )

        # Add new
        perms = (
            self.db.query(Permission).filter(Permission.key.in_(permission_keys)).all()
        )
        if len(perms) != len(permission_keys):
            found_keys = {p.key for p in perms}
            missing = set(permission_keys) - found_keys
            raise HTTPException(
                status_code=400, detail=f"Invalid permissions: {missing}"
            )

        for p in perms:
            self.db.execute(
                platform_role_permissions.insert().values(
                    role_id=role_id, permission_id=p.id
                )
            )
        self.db.commit()

    def delete(self, role_id: UUID):
        role = self.get_by_id(role_id)
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        # Check for assigned users
        user_count = (
            self.db.query(PlatformUser).filter(PlatformUser.role_id == role_id).count()
        )
        if user_count > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete role: {user_count} platform users are still assigned.",
            )

        self.db.delete(role)
        self.db.commit()
