from uuid import UUID
from pydantic import BaseModel
from typing import Optional


class InvoiceBase(BaseModel):
    amount: float
    status: Optional[str] = "Pending"
    period_start: str
    period_end: str
    generated_on: Optional[str] = None
    due_date: str


class InvoiceCreate(InvoiceBase):
    hotel_id: UUID


class InvoiceUpdate(BaseModel):
    status: Optional[str] = None
    amount: Optional[float] = None
    due_date: Optional[str] = None


class Invoice(InvoiceBase):
    id: UUID
    hotel_id: UUID
    hotel_name: Optional[str] = None
    invoice_number: Optional[str] = None

    class Config:
        from_attributes = True
