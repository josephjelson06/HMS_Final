"""
Kiosk Service
=============
Business logic for the slug-scoped kiosk public API.
"""

from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.tenant import Tenant
from app.models.room import RoomType
from app.models.booking import Booking
from app.schemas.kiosk import KioskBookingCreate


# ─────────────────────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────────────────────


def _get_tenant_by_slug(slug: str, db: Session) -> Tenant:
    tenant = db.query(Tenant).filter(Tenant.slug == slug).first()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Hotel '{slug}' not found",
        )
    if not tenant.status:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This hotel is currently suspended. Online bookings are disabled.",
        )
    return tenant


# ─────────────────────────────────────────────────────────────────────────────
# Kiosk Service
# ─────────────────────────────────────────────────────────────────────────────


class KioskService:
    def __init__(self, db: Session):
        self.db = db

    # ── Tenant public info ────────────────────────────────────────────

    def get_tenant(self, slug: str) -> Tenant:
        return _get_tenant_by_slug(slug, self.db)

    # ── Room types ────────────────────────────────────────────────────

    def get_room_types(self, slug: str) -> list[RoomType]:
        tenant = _get_tenant_by_slug(slug, self.db)
        return (
            self.db.query(RoomType)
            .filter(RoomType.tenant_id == tenant.id)
            .order_by(RoomType.name)
            .all()
        )

    # ── Bookings ──────────────────────────────────────────────────────

    def create_booking(self, slug: str, payload: KioskBookingCreate) -> Booking:
        tenant = _get_tenant_by_slug(slug, self.db)

        # Validate room type belongs to this tenant
        room_type = (
            self.db.query(RoomType)
            .filter(
                RoomType.id == payload.room_type_id,
                RoomType.tenant_id == tenant.id,
            )
            .first()
        )
        if not room_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room type not found or unavailable",
            )

        # Idempotency — return existing booking if key already used
        if payload.idempotency_key:
            existing = (
                self.db.query(Booking)
                .filter(Booking.idempotency_key == payload.idempotency_key)
                .first()
            )
            if existing:
                return existing

        # Calculate nights + price
        nights = (payload.check_out_date - payload.check_in_date).days
        if nights < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="check_out_date must be after check_in_date",
            )
        total_price = room_type.price * nights

        # Create booking (single table, no guest relations anymore)
        booking = Booking(
            tenant_id=tenant.id,
            room_type_id=room_type.id,
            guest_name=payload.guest_name,
            check_in_date=payload.check_in_date,
            check_out_date=payload.check_out_date,
            adults=payload.adults,
            children=payload.children,
            nights=nights,
            total_price=total_price,
            status="CONFIRMED",
            idempotency_key=payload.idempotency_key,
            payment_ref=payload.payment_ref,
        )

        self.db.add(booking)
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def get_booking(self, slug: str, booking_id: UUID) -> Booking:
        tenant = _get_tenant_by_slug(slug, self.db)
        booking = (
            self.db.query(Booking)
            .filter(
                Booking.id == booking_id,
                Booking.tenant_id == tenant.id,
            )
            .first()
        )
        if not booking:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Booking not found",
            )
        return booking
