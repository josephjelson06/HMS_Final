"""
Kiosk Router
============
Public API routes for the kiosk device.
No authentication required — tenant is identified by slug.

All routes are under: /api/kiosk/{slug}/...

The kiosk app (Express/Node) uses these routes to:
  - Show hotel info on the welcome screen
  - Show available room types
  - Submit bookings from guests
  - Look up a booking confirmation
"""

from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.kiosk import (
    KioskTenantRead,
    KioskRoomTypeRead,
    KioskBookingCreate,
    KioskBookingRead,
)
from app.services.kiosk_service import KioskService

router = APIRouter(prefix="/api/kiosk", tags=["Kiosk"])


# ─────────────────────────────────────────────────────────────────────────────
# Hotel info
# ─────────────────────────────────────────────────────────────────────────────


@router.get("/{slug}", response_model=KioskTenantRead, summary="Get hotel public info")
def get_hotel_info(slug: str, db: Session = Depends(get_db)):
    """
    Returns basic public hotel information for the kiosk welcome screen.
    Used on kiosk startup after tenant slug is captured.
    """
    service = KioskService(db)
    return service.get_tenant(slug)


# ─────────────────────────────────────────────────────────────────────────────
# Room types
# ─────────────────────────────────────────────────────────────────────────────


@router.get(
    "/{slug}/room-types",
    response_model=List[KioskRoomTypeRead],
    summary="List available room types",
)
def get_room_types(slug: str, db: Session = Depends(get_db)):
    """
    Returns all active room types for the hotel.
    Kiosk uses this to render the room selection screen.
    """
    service = KioskService(db)
    return service.get_room_types(slug)


# ─────────────────────────────────────────────────────────────────────────────
# Bookings
# ─────────────────────────────────────────────────────────────────────────────


@router.post(
    "/{slug}/bookings",
    response_model=KioskBookingRead,
    status_code=201,
    summary="Create a booking",
)
def create_booking(
    slug: str,
    payload: KioskBookingCreate,
    db: Session = Depends(get_db),
):
    """
    Guest submits a booking via the kiosk.

    - Creates or re-uses a guest record (matched by phone/email)
    - Validates the room type belongs to this hotel
    - Validates occupancy limits
    - Calculates nights + total price
    - Supports idempotency_key to prevent duplicate submissions
    - Sets status to 'confirmed' immediately (no manual approval step)
    """
    service = KioskService(db)
    return service.create_booking(slug, payload)


@router.get(
    "/{slug}/bookings/{booking_id}",
    response_model=KioskBookingRead,
    summary="Get booking confirmation",
)
def get_booking(slug: str, booking_id: UUID, db: Session = Depends(get_db)):
    """
    Retrieve a specific booking for the confirmation screen.
    The booking must belong to the hotel identified by slug.
    """
    service = KioskService(db)
    return service.get_booking(slug, booking_id)
