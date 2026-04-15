"""
SEED 02 — Room Types
=====================
Run AFTER seed_01_hotel.py

Creates room types for the demo hotel (Grand Bay Hotel).
The kiosk module reads these to present booking options to guests.
"""

import logging
import sys
import os
from decimal import Decimal

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.tenant import Tenant
from app.models.room import RoomType

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

HOTEL_SLUG = "grand-bay-hotel"

ROOM_TYPES = [
    {
        "name": "Standard Room",
        "code": "STD",
        "price": Decimal("2500.00"),
        "amenities": ["WiFi", "AC", "TV", "Hot Water", "Room Service"],
    },
    {
        "name": "Deluxe Room",
        "code": "DLX",
        "price": Decimal("4500.00"),
        "amenities": [
            "WiFi",
            "AC",
            "Smart TV",
            "Mini Bar",
            "Hot Water",
            "Room Service",
            "Safe",
        ],
    },
    {
        "name": "Suite",
        "code": "SUITE",
        "price": Decimal("9000.00"),
        "amenities": [
            "WiFi",
            "AC",
            "Smart TV",
            "Mini Bar",
            "Hot Water",
            "Room Service",
            "Safe",
            "Bathtub",
            "Kitchenette",
            "Butler Service",
        ],
    },
    {
        "name": "Family Room",
        "code": "FAM",
        "price": Decimal("6000.00"),
        "amenities": [
            "WiFi",
            "AC",
            "TV",
            "Hot Water",
            "Room Service",
            "Extra Beds",
            "Kids Kit",
        ],
    },
]


def run():
    db = SessionLocal()
    try:
        # ── Verify prerequisites ──────────────────────────────────────
        tenant = db.query(Tenant).filter(Tenant.slug == HOTEL_SLUG).first()
        if not tenant:
            raise RuntimeError(
                f"Hotel '{HOTEL_SLUG}' not found. Run seed_01_hotel first."
            )

        # ── Create Room Types ─────────────────────────────────────────
        logger.info(f"Seeding room types for: {tenant.hotel_name}")
        created = 0
        for rt_data in ROOM_TYPES:
            existing = (
                db.query(RoomType)
                .filter(
                    RoomType.tenant_id == tenant.id,
                    RoomType.code == rt_data["code"],
                )
                .first()
            )
            if existing:
                logger.info(f"  → {rt_data['name']} ({rt_data['code']}) already exists")
                continue

            db.add(RoomType(tenant_id=tenant.id, **rt_data))
            created += 1
            logger.info(
                f"  ✓ Created: {rt_data['name']} ({rt_data['code']}) — ₹{rt_data['price']}/night"
            )

        db.commit()
        logger.info(f"\n✅ seed_02_rooms complete. {created} room type(s) created.")

    except Exception as e:
        logger.error(f"❌ Failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
