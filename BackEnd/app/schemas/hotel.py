from pydantic import BaseModel, Field, EmailStr
from enum import Enum
from typing import Optional, List
from app.schemas.kiosk import KioskCreate, Kiosk


class HotelStatus(str, Enum):
    ACTIVE = "Active"
    SUSPENDED = "Suspended"
    ONBOARDING = "Onboarding"
    PAST_DUE = "Past Due"


class HotelPlan(str, Enum):
    STARTER = "Starter"
    PROFESSIONAL = "Professional"
    ENTERPRISE = "Enterprise"


class HotelBase(BaseModel):
    name: str = Field(..., min_length=1)
    gstin: str
    owner: str = Field(..., min_length=1)
    email: EmailStr
    mobile: str = Field(..., min_length=10)
    pan: Optional[str] = None
    legal_name: Optional[str] = None
    logo: Optional[str] = None
    plan: str = "Starter"
    kiosks: int = Field(default=0, ge=0)
    status: str = "Onboarding"
    mrr: float = Field(default=0.0, ge=0.0)
    address: str


class HotelCreate(HotelBase):
    kiosks_details: Optional[List[KioskCreate]] = None


class HotelUpdate(BaseModel):
    name: Optional[str] = None
    gstin: Optional[str] = None
    owner: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    pan: Optional[str] = None
    legal_name: Optional[str] = None
    logo: Optional[str] = None
    plan: Optional[str] = None
    kiosks: Optional[int] = None
    status: Optional[str] = None
    mrr: Optional[float] = None
    address: Optional[str] = None


class Hotel(HotelBase):
    id: int
    kiosk_list: List[Kiosk] = []

    class Config:
        from_attributes = True
