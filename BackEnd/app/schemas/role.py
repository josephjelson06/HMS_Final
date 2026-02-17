from uuid import UUID
from pydantic import BaseModel
from typing import Optional


class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "blue"
    status: Optional[str] = "Active"


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    description: Optional[str] = None
    color: Optional[str] = None
    status: Optional[str] = None


class Role(RoleBase):
    id: UUID
    userCount: Optional[int] = 0

    class Config:
        from_attributes = True
