"""
SEED 03 — Kiosk Bookings
========================
Run AFTER seed_02_rooms.py

Creates a sample booking for the demo hotel (Grand Bay Hotel)
to demonstrate the new Kiosk API schema.
"""

import logging
import sys
import os
from datetime import date, timedelta
from decimal import Decimal

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.tenant import Tenant
from app.models.room import RoomType
from app.models.booking import Booking

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

HOTEL_SLUG = "grand-bay-hotel"


def run():
    db = SessionLocal()
    try:
        # ── Verify prerequisites ──────────────────────────────────────
        tenant = db.query(Tenant).filter(Tenant.slug == HOTEL_SLUG).first()
        if not tenant:
            raise RuntimeError(
                f"Hotel '{HOTEL_SLUG}' not found. Run seed_01_hotel first."
            )

        # Get the first room type (Standard Room)
        room_type = (
            db.query(RoomType)
            .filter(RoomType.tenant_id == tenant.id, RoomType.code == "STD")
            .first()
        )
        if not room_type:
            raise RuntimeError(
                f"Room Type 'STD' not found for hotel '{HOTEL_SLUG}'. Run seed_02_rooms first."
            )

        # ── Create Demo Booking ─────────────────────────────────────────
        logger.info(f"Seeding demo booking for: {tenant.hotel_name}")

        check_in = date.today() + timedelta(days=5)
        check_out = check_in + timedelta(days=3)
        nights = (check_out - check_in).days
        total_price = room_type.price * nights
        idempotency_key = "demo-booking-001"

        existing = (
            db.query(Booking)
            .filter(
                Booking.tenant_id == tenant.id,
                Booking.idempotency_key == idempotency_key,
            )
            .first()
        )

        if existing:
            logger.info("  → Demo booking already exists")
        else:
            g_name = "John Doe"
            booking = Booking(
                tenant_id=tenant.id,
                room_type_id=room_type.id,
                guest_name=g_name,
                check_in_date=check_in,
                check_out_date=check_out,
                adults=2,
                children=0,
                nights=nights,
                total_price=total_price,
                status="CONFIRMED",
                idempotency_key=idempotency_key,
            )
            db.add(booking)
            db.commit()
            logger.info(
                f"  ✓ Created booking: {g_name} from {check_in} to {check_out} — ₹{total_price}"
            )

        logger.info(f"\n✅ seed_03_bookings complete.")

    except Exception as e:
        logger.error(f"❌ Failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
