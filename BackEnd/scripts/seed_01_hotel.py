"""
SEED 01 — Hotel Onboarding
===========================
Run AFTER seed_00_platform.py

Creates a demo hotel (tenant) using the full onboarding sequence,
handling the circular dependency between tenants ↔ tenant_users.

Flow:
  1. Create Tenant shell (no owner yet)
  2. Create "Hotel Manager" role for that tenant
  3. Assign all hotel:* permissions to that role
  4. Create Hotel Manager user
  5. Link user back to tenant as owner
  6. Create Subscription (attach a plan)
  7. Create TenantConfig (defaults)
"""

import logging
import sys
import os
from datetime import date, timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import update
from app.database import SessionLocal
from app.models.tenant import Tenant, TenantRole, TenantUser, TenantConfig
from app.models.billing import Plan, Subscription
from app.models.permissions import Permission
from app.models.mappings import tenant_role_permissions
from app.core.auth.security import get_password_hash

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# ── Demo Hotel Config ─────────────────────────────────────────────────────────
HOTEL_NAME = "Grand Bay Hotel"
HOTEL_SLUG = "grand-bay-hotel"
HOTEL_EMAIL = "manager@grandbay.com"
HOTEL_PASS = "manager123"
PLAN_NAME = "Professional"  # Must already exist from seed_00


def run():
    db = SessionLocal()
    try:
        # ── Verify prerequisites ──────────────────────────────────────
        plan = db.query(Plan).filter(Plan.name == PLAN_NAME).first()
        if not plan:
            raise RuntimeError(
                f"Plan '{PLAN_NAME}' not found. Run seed_00_platform first."
            )

        hotel_perms = db.query(Permission).filter(Permission.key.like("hotel:%")).all()
        if not hotel_perms:
            raise RuntimeError(
                "Hotel permissions not found. Run seed_00_platform first."
            )

        # ── Check if already seeded ───────────────────────────────────
        existing = db.query(Tenant).filter(Tenant.slug == HOTEL_SLUG).first()
        if existing:
            logger.info(f"→ Hotel '{HOTEL_NAME}' already exists, skipping.")
            return

        # ── Step 1: Create Tenant shell (owner_user_id = NULL for now) ─
        logger.info(f"Creating tenant: {HOTEL_NAME}...")
        tenant = Tenant(
            hotel_name=HOTEL_NAME,
            slug=HOTEL_SLUG,
            address="123 Ocean Drive, Mumbai, India",
            plan_id=plan.id,
            owner_user_id=None,  # circular — will be set in Step 5
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)
        logger.info(f"  ✓ Tenant created: {tenant.id}")

        # ── Step 2: Create genesis Hotel Manager role ──────────────────
        logger.info("Creating Hotel Manager role...")
        mgr_role = TenantRole(
            tenant_id=tenant.id,
            name="Hotel Manager",
            status=True,
        )
        db.add(mgr_role)
        db.commit()
        db.refresh(mgr_role)
        logger.info(f"  ✓ Role created: {mgr_role.id}")

        # ── Step 3: Assign hotel:* permissions to Hotel Manager ────────
        logger.info("Assigning hotel permissions to Hotel Manager role...")
        for perm in hotel_perms:
            db.execute(
                tenant_role_permissions.insert().values(
                    role_id=mgr_role.id, permission_id=perm.id
                )
            )
        db.commit()
        logger.info(f"  ✓ {len(hotel_perms)} permissions assigned")

        # ── Step 4: Create Hotel Manager user ─────────────────────────
        logger.info(f"Creating Hotel Manager user: {HOTEL_EMAIL}...")
        mgr_user = TenantUser(
            tenant_id=tenant.id,
            email=HOTEL_EMAIL,
            name="Hotel Manager",
            password_hash=get_password_hash(HOTEL_PASS),
            role_id=mgr_role.id,
        )
        db.add(mgr_user)
        db.commit()
        db.refresh(mgr_user)
        logger.info(f"  ✓ User created: {HOTEL_EMAIL} / {HOTEL_PASS}")

        # ── Step 5: Link owner back to tenant ─────────────────────────
        logger.info("Linking owner to tenant...")
        db.execute(
            update(Tenant)
            .where(Tenant.id == tenant.id)
            .values(owner_user_id=mgr_user.id)
        )
        db.commit()
        logger.info("  ✓ owner_user_id set")

        # ── Step 6: Create active subscription ────────────────────────
        logger.info("Creating subscription...")
        today = date.today()
        subscription = Subscription(
            tenant_id=tenant.id,
            plan_id=plan.id,
            start_date=today,
            end_date=today + timedelta(days=30),
            status="active",
        )
        db.add(subscription)
        db.commit()
        logger.info(f"  ✓ Subscription: {PLAN_NAME} active for 30 days")

        # ── Step 7: Create TenantConfig with defaults ──────────────────
        logger.info("Creating tenant config...")
        config = TenantConfig(
            tenant_id=tenant.id,
            timezone="Asia/Kolkata",
            check_in_time="14:00",
            check_out_time="11:00",
            default_lang="en",
            welcome_message=f"Welcome to {HOTEL_NAME}!",
            support_email=HOTEL_EMAIL,
            extra={},
        )
        db.add(config)
        db.commit()
        logger.info("  ✓ TenantConfig created")

        logger.info(f"\n✅ seed_01_hotel complete.")
        logger.info(f"   Hotel:   {HOTEL_NAME} (slug: {HOTEL_SLUG})")
        logger.info(f"   Manager: {HOTEL_EMAIL} / {HOTEL_PASS}")

    except Exception as e:
        logger.error(f"❌ Failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
