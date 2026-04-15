import sys
import os

# Add the app directory to sys.path
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.models.platform import PlatformUser
from app.models.tenant import TenantUser


def backfill_users():
    db = SessionLocal()
    try:
        # Platform Users
        p_users = (
            db.query(PlatformUser)
            .filter(PlatformUser.readable_id == None)
            .order_by(PlatformUser.created_at)
            .all()
        )
        print(f"Found {len(p_users)} platform users to backfill")
        for i, user in enumerate(p_users):
            user.readable_id = f"USR-{i + 1:04d}"

        # Tenant Users
        t_users = (
            db.query(TenantUser)
            .filter(TenantUser.readable_id == None)
            .order_by(TenantUser.created_at)
            .all()
        )
        print(f"Found {len(t_users)} tenant users to backfill")
        for i, user in enumerate(t_users):
            user.readable_id = f"USR-{i + 1:04d}"

        db.commit()
        print("Backfill complete!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    backfill_users()
