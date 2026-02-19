from uuid import UUID
from datetime import date
from pydantic import BaseModel
from app.schemas.base import ORMBase


class PlanRead(ORMBase):
    id: UUID
    name: str
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
