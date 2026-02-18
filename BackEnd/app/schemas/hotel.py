from uuid import UUID
from pydantic import BaseModel, Field, EmailStr
from enum import Enum
from typing import Optional, List


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
    gstin: Optional[str] = None
    owner: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    pan: Optional[str] = None
    legal_name: Optional[str] = None
    logo: Optional[str] = None
    plan: Optional[str] = "Starter"
    kiosks: int = Field(default=0, ge=0)
    status: str = "Onboarding"
    mrr: float = Field(default=0.0, ge=0.0)
    address: Optional[str] = None


class KioskDetails(BaseModel):
    id: Optional[UUID] = None
    serial_number: str
    location: str
    hotel_id: Optional[UUID] = None


class HotelCreate(HotelBase):
    owner: str = Field(..., min_length=1)
    email: EmailStr
    mobile: str = Field(..., min_length=10)
    address: str
    kiosks_details: Optional[List[KioskDetails]] = None


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
    id: UUID
    kiosk_list: Optional[List[KioskDetails]] = None

    class Config:
        from_attributes = True
