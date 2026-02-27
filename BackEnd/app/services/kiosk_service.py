"""
Kiosk Service
=============
Business logic for the slug-scoped kiosk public API.
Each method resolves the tenant by slug first, then scopes
all queries to that tenant_id.
"""

from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.tenant import Tenant
from app.models.room import RoomType
from app.models.booking import Guest, Booking
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
            .filter(
                RoomType.tenant_id == tenant.id,
                RoomType.is_active,
            )
            .order_by(RoomType.display_order, RoomType.name)
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
                RoomType.is_active,
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

        # Validate occupancy
        total_guests = payload.adults + payload.children
        if total_guests > room_type.max_occupancy:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Total guests ({total_guests}) exceeds max occupancy "
                f"({room_type.max_occupancy}) for this room type",
            )
        if payload.adults > room_type.max_adults:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Adults ({payload.adults}) exceeds max adults "
                f"({room_type.max_adults}) for this room type",
            )

        # Calculate nights + price
        nights = (payload.check_out_date - payload.check_in_date).days
        total_price = room_type.base_price * nights

        # Create or find guest
        guest = self._upsert_guest(tenant.id, payload)

        # Create booking (no session_id or device_id — slug-only flow)
        booking = Booking(
            tenant_id=tenant.id,
            guest_id=guest.id,
            room_type_id=room_type.id,
            status="confirmed",
            adults=payload.adults,
            children=payload.children,
            check_in_date=payload.check_in_date,
            check_out_date=payload.check_out_date,
            nights=nights,
            total_price=total_price,
            currency=room_type.currency,
            guest_name=payload.guest_name,
            special_requests=payload.special_requests,
            idempotency_key=payload.idempotency_key,
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

    # ── Internal helpers ──────────────────────────────────────────────

    def _upsert_guest(self, tenant_id: UUID, payload: KioskBookingCreate) -> Guest:
        """
        Re-use an existing guest record if phone or email matches within this tenant.
        Otherwise create a new guest.
        """
        guest = None

        # Try to find by phone first (most reliable for walk-in guests)
        if payload.guest_phone:
            guest = (
                self.db.query(Guest)
                .filter(
                    Guest.tenant_id == tenant_id,
                    Guest.phone == payload.guest_phone,
                )
                .first()
            )

        # Fallback to email
        if not guest and payload.guest_email:
            guest = (
                self.db.query(Guest)
                .filter(
                    Guest.tenant_id == tenant_id,
                    Guest.email == payload.guest_email,
                )
                .first()
            )

        if not guest:
            guest = Guest(
                tenant_id=tenant_id,
                full_name=payload.guest_name,
                email=payload.guest_email,
                phone=payload.guest_phone,
                id_type=payload.id_type,
                id_number=payload.id_number,
                nationality=payload.nationality,
            )
            self.db.add(guest)
            self.db.flush()  # get guest.id before committing

        return guest
