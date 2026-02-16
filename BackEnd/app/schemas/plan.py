from pydantic import BaseModel
from typing import List, Optional


class PlanBase(BaseModel):
    name: str
    price: float
    rooms: int
    kiosks: int
    subscribers: int
    support: str
    included: List[str]
    theme: str
    is_archived: bool = False


class PlanCreate(PlanBase):
    pass


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    rooms: Optional[int] = None
    kiosks: Optional[int] = None
    subscribers: Optional[int] = None
    support: Optional[str] = None
    included: Optional[List[str]] = None
    theme: Optional[str] = None
    is_archived: Optional[bool] = None


class Plan(PlanBase):
    id: int

    class Config:
        from_attributes = True
