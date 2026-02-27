"""
SEED 02 — Room Types
=====================
Run AFTER seed_01_hotel.py

Creates room types for the demo hotel (Grand Bay Hotel).
The kiosk module reads these to present booking options to guests.

Room types are the catalog of what the hotel offers.
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
        "description": "A comfortable standard room with all essentials. Perfect for solo travellers or couples.",
        "base_price": Decimal("2500.00"),
        "currency": "INR",
        "max_adults": 2,
        "max_children": 1,
        "max_occupancy": 3,
        "amenities": ["WiFi", "AC", "TV", "Hot Water", "Room Service"],
        "images": [],
        "is_active": True,
        "display_order": 1,
    },
    {
        "name": "Deluxe Room",
        "code": "DLX",
        "description": "Upgraded furnishings with a sea-facing view and premium amenities.",
        "base_price": Decimal("4500.00"),
        "currency": "INR",
        "max_adults": 2,
        "max_children": 2,
        "max_occupancy": 4,
        "amenities": [
            "WiFi",
            "AC",
            "Smart TV",
            "Mini Bar",
            "Hot Water",
            "Room Service",
            "Safe",
        ],
        "images": [],
        "is_active": True,
        "display_order": 2,
    },
    {
        "name": "Suite",
        "code": "SUITE",
        "description": "Luxury suite with separate living area, kitchenette, and panoramic views.",
        "base_price": Decimal("9000.00"),
        "currency": "INR",
        "max_adults": 3,
        "max_children": 2,
        "max_occupancy": 5,
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
        "images": [],
        "is_active": True,
        "display_order": 3,
    },
    {
        "name": "Family Room",
        "code": "FAM",
        "description": "Spacious room designed for families with extra beds and child-friendly amenities.",
        "base_price": Decimal("6000.00"),
        "currency": "INR",
        "max_adults": 2,
        "max_children": 3,
        "max_occupancy": 6,
        "amenities": [
            "WiFi",
            "AC",
            "TV",
            "Hot Water",
            "Room Service",
            "Extra Beds",
            "Kids Kit",
        ],
        "images": [],
        "is_active": True,
        "display_order": 4,
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
                f"  ✓ Created: {rt_data['name']} ({rt_data['code']}) — ₹{rt_data['base_price']}/night"
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
