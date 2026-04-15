"""
SEED 00 — Platform Layer
========================
Run this FIRST. Nothing else works without this.

Creates:
  - All platform + hotel permissions
  - SuperAdmin platform role (genesis role)
  - SuperAdmin platform user (genesis user)
  - 3 default plans (Starter, Professional, Enterprise)
"""

import logging
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.platform import PlatformRole, PlatformUser
from app.models.permissions import Permission
from app.models.billing import Plan
from app.models.mappings import platform_role_permissions
from app.core.auth.security import get_password_hash

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

PLATFORM_PERMISSIONS = [
    "platform:tenants:read",
    "platform:tenants:write",
    "platform:users:read",
    "platform:users:write",
    "platform:roles:read",
    "platform:roles:write",
    "platform:plans:read",
    "platform:plans:write",
    "platform:billing:read",
    "platform:billing:write",
    "platform:support:read",
    "platform:support:write",
    "platform:settings:read",
    "platform:settings:write",
]

HOTEL_PERMISSIONS = [
    "hotel:dashboard:read",
    "hotel:users:read",
    "hotel:users:write",
    "hotel:roles:read",
    "hotel:roles:write",
    "hotel:billing:read",
    "hotel:billing:write",
    "hotel:support:read",
    "hotel:support:write",
    "hotel:guests:read",
    "hotel:guests:write",
    "hotel:rooms:read",
    "hotel:rooms:write",
    "hotel:bookings:read",
    "hotel:bookings:write",
    "hotel:config:read",
    "hotel:config:write",
    "hotel:kiosk:read",
    "hotel:kiosk:write",
]

PLANS = [
    {
        "name": "Starter",
        "price": 0.0,
        "period_months": 1,
        "max_users": 5,
        "max_roles": 3,
        "max_rooms": 10,
    },
    {
        "name": "Professional",
        "price": 49.99,
        "period_months": 1,
        "max_users": 20,
        "max_roles": 10,
        "max_rooms": 50,
    },
    {
        "name": "Enterprise",
        "price": 199.99,
        "period_months": 12,
        "max_users": 999,
        "max_roles": 999,
        "max_rooms": 999,
    },
]


def run():
    db = SessionLocal()
    try:
        # ── Step 1: Permissions ───────────────────────────────────────
        logger.info("Seeding permissions...")
        all_perms = PLATFORM_PERMISSIONS + HOTEL_PERMISSIONS
        for key in all_perms:
            if not db.query(Permission).filter(Permission.key == key).first():
                db.add(Permission(key=key, description=f"Permission: {key}"))
        db.commit()
        logger.info(f"  ✓ {len(all_perms)} permissions ready")

        # ── Step 2: Super Admin Role ──────────────────────────────────
        logger.info("Seeding SuperAdmin platform role...")
        sa_role = (
            db.query(PlatformRole).filter(PlatformRole.name == "Super Admin").first()
        )
        if not sa_role:
            sa_role = PlatformRole(name="Super Admin")
            db.add(sa_role)
            db.commit()
            db.refresh(sa_role)
            logger.info("  ✓ Super Admin role created")
        else:
            logger.info("  → Super Admin role already exists")

        # ── Step 3: Assign ALL platform permissions to Super Admin ────
        logger.info("Assigning platform permissions to Super Admin role...")
        db.execute(
            platform_role_permissions.delete().where(
                platform_role_permissions.c.role_id == sa_role.id
            )
        )
        perms = (
            db.query(Permission).filter(Permission.key.in_(PLATFORM_PERMISSIONS)).all()
        )
        for p in perms:
            db.execute(
                platform_role_permissions.insert().values(
                    role_id=sa_role.id, permission_id=p.id
                )
            )
        db.commit()
        logger.info(f"  ✓ {len(perms)} permissions assigned")

        # ── Step 4: Super Admin User ──────────────────────────────────
        logger.info("Seeding SuperAdmin platform user...")
        admin_email = "admin@atc.com"
        admin = db.query(PlatformUser).filter(PlatformUser.email == admin_email).first()
        if not admin:
            db.add(
                PlatformUser(
                    email=admin_email,
                    name="System Administrator",
                    password_hash=get_password_hash("password123"),
                    role_id=sa_role.id,
                )
            )
            db.commit()
            logger.info(f"  ✓ Created: {admin_email} / password123")
        else:
            logger.info("  → Admin user already exists")

        # ── Step 5: Plans ─────────────────────────────────────────────
        logger.info("Seeding plans...")
        for p_data in PLANS:
            if not db.query(Plan).filter(Plan.name == p_data["name"]).first():
                db.add(Plan(**p_data))
        db.commit()
        logger.info(f"  ✓ {len(PLANS)} plans ready")

        logger.info("\n✅ seed_00_platform complete.")

    except Exception as e:
        logger.error(f"❌ Failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
