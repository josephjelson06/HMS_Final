from uuid import UUID
from pydantic import BaseModel, Field
from typing import Optional


class IncidentBase(BaseModel):
    subject: str
    description: str
    room: str
    priority: str
    status: str = "Open"
    category: str
    guest_name: Optional[str] = None
    reported_by: Optional[str] = None
    assigned_to: Optional[str] = None
    created_at: str
    updated_at: str
    sla_breached: bool = False


class IncidentCreate(IncidentBase):
    pass


class IncidentUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    room: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    category: Optional[str] = None
    guest_name: Optional[str] = None
    reported_by: Optional[str] = None
    assigned_to: Optional[str] = None
    updated_at: Optional[str] = None
    sla_breached: Optional[bool] = None


class IncidentResponse(IncidentBase):
    id: int
    hotel_id: UUID = Field(validation_alias="tenant_id")

    class Config:
        from_attributes = True


class AdminIncidentResponse(IncidentResponse):
    hotel_name: Optional[str] = None
