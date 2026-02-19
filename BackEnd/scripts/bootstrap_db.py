import os
import sys
import uuid

# Bootstrap import path
here = os.path.abspath(os.path.dirname(__file__))
backend_root = os.path.abspath(os.path.join(here, ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.hotel import Tenant
from app.models.plan import Plan
from app.models.user import User
from app.core.auth.security import get_password_hash


def bootstrap():
    db: Session = SessionLocal()
    try:
        # 1. Ensure a default Plan exists
        plan = db.query(Plan).filter(Plan.name == "Free Plan").first()
        if not plan:
            plan = Plan(
                id=uuid.uuid4(),
                name="Free Plan",
                price=0.0,
                rooms=10,
                kiosks=2,
                support="Email",
                included=[],
                theme="default",
                max_roles=5,
                max_users=10,
            )
            db.add(plan)
            db.flush()
            print(f"Created default plan: {plan.name}")

        # 2. Ensure Platform Tenant exists
        platform_tenant = (
            db.query(Tenant).filter(Tenant.tenant_type == "platform").first()
        )
        if not platform_tenant:
            platform_tenant = Tenant(
                id=uuid.uuid4(),
                name="ATC Platform",
                tenant_key="atc-platform",
                tenant_type="platform",
                email="admin@atc.com",
                plan_id=plan.id,
                status="Active",
            )
            db.add(platform_tenant)
            db.flush()
            print(f"Created platform tenant: {platform_tenant.name}")

        # 3. Ensure Super Admin User exists
        admin_email = "admin@atc.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                id=uuid.uuid4(),
                tenant_id=platform_tenant.id,
                email=admin_email,
                username="admin",
                name="Platform Admin",
                password_hash=get_password_hash("password123"),
                user_type="platform",
                is_active=True,
            )
            db.add(admin_user)
            db.flush()
            print(f"Created super admin user: {admin_email}")

        db.commit()
        print("Bootstrap successful!")
    except Exception as e:
        db.rollback()
        print(f"Bootstrap failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    bootstrap()
