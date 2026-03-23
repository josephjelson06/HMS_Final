from uuid import UUID
from typing import Optional, List

from pydantic import BaseModel, Field

from app.schemas.base import ORMBase


class RoomCategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    image_urls: List[str] = Field(default_factory=list)
    display_order: int = 0


class RoomCategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = Field(default=None, max_length=1000)
    image_urls: Optional[List[str]] = None
    display_order: Optional[int] = None


class RoomCategoryRead(ORMBase):
    id: UUID
    tenant_id: UUID
    name: str
    description: Optional[str] = None
    image_urls: List[str] = Field(default_factory=list)
    display_order: int = 0
