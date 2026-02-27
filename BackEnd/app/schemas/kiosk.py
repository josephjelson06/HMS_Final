"""
Kiosk API Schemas
=================
Pydantic models for the slug-scoped kiosk public API.
No auth required — the slug is the tenant identifier.
"""

from uuid import UUID
from decimal import Decimal
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator

from app.schemas.base import ORMBase


# ─────────────────────────────────────────────────────────────────────────────
# Tenant / Hotel public info (what the kiosk shows on the welcome screen)
# ─────────────────────────────────────────────────────────────────────────────


class KioskTenantRead(ORMBase):
    id: UUID
    hotel_name: str
    slug: str
    address: Optional[str] = None
    image_url_1: Optional[str] = None
    image_url_2: Optional[str] = None
    image_url_3: Optional[str] = None


# ─────────────────────────────────────────────────────────────────────────────
# Room Types (catalog shown to guest)
# ─────────────────────────────────────────────────────────────────────────────


class KioskRoomTypeRead(ORMBase):
    id: UUID
    name: str
    code: str
    description: Optional[str] = None
    base_price: Decimal
    currency: str
    max_adults: int
    max_children: int
    max_occupancy: int
    amenities: List[str] = []
    images: List[str] = []
    display_order: int


# ─────────────────────────────────────────────────────────────────────────────
# Booking (create + read)
# ─────────────────────────────────────────────────────────────────────────────


class KioskBookingCreate(BaseModel):
    # Guest identity
    guest_name: str
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None
    id_type: Optional[str] = None  # passport | aadhar | driving_license
    id_number: Optional[str] = None
    nationality: Optional[str] = None

    # Room selection
    room_type_id: UUID

    # Stay details
    check_in_date: date
    check_out_date: date
    adults: int = 1
    children: int = 0

    # Optional
    special_requests: Optional[str] = None
    idempotency_key: Optional[str] = None  # prevent duplicate submissions

    @field_validator("check_out_date")
    @classmethod
    def checkout_after_checkin(cls, v, info):
        if info.data.get("check_in_date") and v <= info.data["check_in_date"]:
            raise ValueError("check_out_date must be after check_in_date")
        return v

    @field_validator("adults")
    @classmethod
    def at_least_one_adult(cls, v):
        if v < 1:
            raise ValueError("At least 1 adult required")
        return v


class KioskBookingRead(ORMBase):
    id: UUID
    tenant_id: UUID
    room_type_id: UUID
    guest_id: Optional[UUID] = None
    guest_name: Optional[str] = None
    status: str
    adults: int
    children: int
    check_in_date: date
    check_out_date: date
    nights: int
    total_price: Optional[Decimal] = None
    currency: str
    special_requests: Optional[str] = None
    confirmed_at: Optional[datetime] = None
    created_at: datetime
