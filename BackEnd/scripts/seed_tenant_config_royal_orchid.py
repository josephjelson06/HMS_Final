"""
Seed tenant_configs for Royal Orchid Hotel.

Usage:
  python scripts/seed_tenant_config_royal_orchid.py
"""

import logging
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.tenant import Tenant, TenantConfig

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

HOTEL_NAME = "Royal Orchid Hotel"

CONFIG_PAYLOAD = {
    "timezone": "Asia/Kolkata",
    "check_in_time": "14:00",
    "check_out_time": "11:00",
    "default_lang": "en",
    "welcome_message": "Welcome to Royal Orchid Hotel!",
    "logo_url": None,
    "support_phone": "+91-80-1234-5678",
    "support_email": "support@royalorchidhotel.com",
    "extra": {},
}


def run() -> None:
    db = SessionLocal()
    try:
        tenant = db.query(Tenant).filter(Tenant.hotel_name == HOTEL_NAME).first()
        if not tenant:
            raise RuntimeError(f"Tenant '{HOTEL_NAME}' not found.")

        config = (
            db.query(TenantConfig).filter(TenantConfig.tenant_id == tenant.id).first()
        )
        if config:
            for key, value in CONFIG_PAYLOAD.items():
                setattr(config, key, value)
            action = "updated"
        else:
            config = TenantConfig(tenant_id=tenant.id, **CONFIG_PAYLOAD)
            db.add(config)
            action = "created"

        db.commit()
        db.refresh(config)

        logger.info("✅ tenant_configs %s for '%s'", action, HOTEL_NAME)
        logger.info("   tenant_id: %s", tenant.id)
        logger.info("   config_id: %s", config.id)
    except Exception as exc:
        db.rollback()
        logger.error("❌ Failed to seed tenant config: %s", exc)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()

