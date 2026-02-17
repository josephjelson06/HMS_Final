import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.auth import Tenant


def find_platform_tenant():
    db = SessionLocal()
    try:
        tenant = db.query(Tenant).filter(Tenant.tenant_type == "platform").first()
        if tenant:
            print(f"Platform Tenant Found: {tenant.name} (ID: {tenant.id})")
        else:
            print("No Platform Tenant Found")
    finally:
        db.close()


if __name__ == "__main__":
    find_platform_tenant()
