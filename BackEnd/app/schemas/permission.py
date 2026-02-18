from uuid import UUID
from typing import List

from pydantic import BaseModel


class PermissionOut(BaseModel):
    id: UUID
    permission_key: str
    description: str | None = None

    class Config:
        from_attributes = True


class RolePermissionsOut(BaseModel):
    role_id: UUID
    role_name: str
    permissions: List[str]


class RolePermissionsIn(BaseModel):
    permissions: List[str]
