from uuid import UUID
from pydantic import BaseModel
from app.schemas.base import ORMBase
from app.schemas.permissions import PermissionRead


class TenantRoleCreate(BaseModel):
    name: str


class TenantRoleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    status: bool | None = None


class TenantRoleRead(ORMBase):
    id: UUID
    name: str
    description: str | None = None
    status: bool
    permissions: list[PermissionRead] = []
