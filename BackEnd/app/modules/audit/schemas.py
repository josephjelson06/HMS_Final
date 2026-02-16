from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel
from pydantic import Field


class AuditLogItem(BaseModel):
    id: UUID
    tenant_id: UUID
    actor_user_id: UUID | None
    acting_as_user_id: UUID | None
    action: str
    metadata: dict
    created_at: datetime


class AuditLogListResponse(BaseModel):
    logs: list[AuditLogItem]
    returned_count: int
    limit: int = Field(ge=1, le=200)
