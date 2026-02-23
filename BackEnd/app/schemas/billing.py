from uuid import UUID
from datetime import date
from pydantic import BaseModel
from app.schemas.base import ORMBase


class PlanCreate(BaseModel):
    name: str
    price: float = 0.0
    period_months: int
    max_users: int | None = None
    max_roles: int | None = None
    max_rooms: int | None = None


class PlanUpdate(BaseModel):
    name: str | None = None
    price: float | None = None
    period_months: int | None = None
    max_users: int | None = None
    max_roles: int | None = None
    max_rooms: int | None = None


class PlanRead(ORMBase):
    id: UUID
    name: str
    price: float = 0.0
    period_months: int
    max_users: int | None
    max_roles: int | None
    max_rooms: int | None


class SubscriptionRead(ORMBase):
    id: UUID
    tenant_id: UUID
    start_date: date
    end_date: date
    status: str
