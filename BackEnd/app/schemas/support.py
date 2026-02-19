from uuid import UUID
from pydantic import BaseModel
from app.schemas.base import ORMBase


class SupportTicketCreate(BaseModel):
    title: str
    description: str | None = None
    category: str | None = None
    priority: str | None = None


class SupportTicketRead(ORMBase):
    id: UUID
    title: str
    description: str | None
    category: str | None
    priority: str | None
    status: str | None
