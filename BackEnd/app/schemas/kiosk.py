"""
Kiosk API Schemas
=================
Pydantic models for the slug-scoped kiosk public API.
"""

from uuid import UUID
from decimal import Decimal
from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, field_validator

from app.schemas.base import ORMBase
from app.schemas.room import RoomCategoryRead


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


class RoomImageRead(ORMBase):
    id: UUID
    url: str
    display_order: int
    caption: Optional[str] = None
    tags: List[str] = []
    category: Optional[str] = None
    is_primary: bool = False


class KioskRoomTypeRead(ORMBase):
    id: UUID
    name: str
    code: str
    category_id: Optional[UUID] = None
    category: Optional[RoomCategoryRead] = None
    price: Decimal
    max_adults: int = 2
    max_children: int = 0
    # Back-compat for older DBs / typos (kept in sync by service layer).
    max_childeren: int = 0
    amenities: List[str] = []
    image_urls: List[str] = []
    images: List[RoomImageRead] = []


# ─────────────────────────────────────────────────────────────────────────────
# Booking (create + read)
# ─────────────────────────────────────────────────────────────────────────────


class KioskBookingCreate(BaseModel):
    # Guest identity
    guest_name: str

    # Room selection
    room_type_id: UUID

    # Stay details
    check_in_date: date
    check_out_date: date
    adults: int
    children: Optional[int] = 0

    idempotency_key: Optional[str] = None
    payment_ref: Optional[str] = None

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
    guest_name: str
    status: str
    adults: int
    children: Optional[int] = None
    check_in_date: date
    check_out_date: date
    nights: int
    total_price: Optional[Decimal] = None
    idempotency_key: Optional[str] = None
    payment_ref: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
