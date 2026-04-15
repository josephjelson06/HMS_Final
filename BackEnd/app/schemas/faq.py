from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.base import ORMBase


class FAQCreate(BaseModel):
    question: str
    answer: str
    is_active: bool = True


class FAQUpdate(BaseModel):
    question: str | None = None
    answer: str | None = None
    is_active: bool | None = None


class FAQRead(ORMBase):
    id: UUID
    tenant_id: UUID
    question: str
    answer: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
