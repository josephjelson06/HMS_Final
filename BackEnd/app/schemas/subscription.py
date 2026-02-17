from uuid import UUID
from pydantic import BaseModel
from typing import Optional


class SubscriptionUpdate(BaseModel):
    plan: Optional[str] = None
    is_auto_renew: Optional[bool] = None
    subscription_end_date: Optional[str] = None
    mrr: Optional[float] = None
    invoice_amount: Optional[float] = None
    invoice_status: Optional[str] = "Pending"


class Subscription(BaseModel):
    id: str  # We might use hotel_id as subscription id conceptually for now
    hotel_id: UUID
    hotel: str
    plan: str
    startDate: Optional[str]
    renewalDate: Optional[str]
    status: str
    autoRenew: bool
    price: float

    class Config:
        from_attributes = True
