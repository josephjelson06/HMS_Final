from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TicketBase(BaseModel):
    subject: str
    description: str
    priority: str
    category: str
    status: Optional[str] = "Open"


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    subject: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None


class TicketResponse(TicketBase):
    id: int
    hotel_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminTicketResponse(TicketResponse):
    hotel_name: Optional[str] = None
