"""
SEED 03 — Kiosk Device Setup
==============================
Run AFTER seed_02_rooms.py

Registers a demo kiosk device for the hotel.
The Kiosk project (Express/Node) will use this device_code
to authenticate itself against the Platform API.

The device_code is the shared secret between:
  - The Platform (this seed registers it)
  - The Kiosk hardware (uses it to authenticate)
"""

import logging
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.tenant import Tenant
from app.models.kiosk import KioskDevice

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

HOTEL_SLUG = "grand-bay-hotel"

KIOSK_DEVICES = [
    {
        "device_code": "KIOSK-LOBBY-01",
        "name": "Main Lobby Kiosk",
        "location": "Hotel Main Lobby — Ground Floor",
        "status": "online",
        "config": {
            "language": "en",
            "theme": "dark",
            "idle_timeout_seconds": 60,
            "show_room_images": True,
        },
    },
    {
        "device_code": "KIOSK-POOL-01",
        "name": "Pool Area Kiosk",
        "location": "Pool Deck — Level 2",
        "status": "online",
        "config": {
            "language": "en",
            "theme": "light",
            "idle_timeout_seconds": 45,
            "show_room_images": True,
        },
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

        # ── Register Kiosk Devices ─────────────────────────────────────
        logger.info(f"Registering kiosk devices for: {tenant.hotel_name}")
        created = 0
        for device_data in KIOSK_DEVICES:
            existing = (
                db.query(KioskDevice)
                .filter(
                    KioskDevice.tenant_id == tenant.id,
                    KioskDevice.device_code == device_data["device_code"],
                )
                .first()
            )
            if existing:
                logger.info(
                    f"  → Device '{device_data['device_code']}' already registered"
                )
                continue

            db.add(KioskDevice(tenant_id=tenant.id, **device_data))
            created += 1
            logger.info(
                f"  ✓ Registered: {device_data['name']}"
                f" (code: {device_data['device_code']}, location: {device_data['location']})"
            )

        db.commit()

        logger.info(f"\n✅ seed_03_kiosk complete. {created} device(s) registered.")
        logger.info("")
        logger.info("  The Kiosk module (Express/Node) should use these device_codes")
        logger.info("  to authenticate against the Platform API.")
        logger.info("  device_codes registered:")
        for d in KIOSK_DEVICES:
            logger.info(f"    - {d['device_code']}  →  {d['location']}")

    except Exception as e:
        logger.error(f"❌ Failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
