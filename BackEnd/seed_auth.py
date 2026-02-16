import sys
import os
import json
from sqlalchemy import text
from app.database import get_db, SessionLocal, engine, Base
from app.models.user import User
from app.models.hotel import Hotel

# Import other models to ensure relationships resolve
import app.models.kiosk
import app.models.invoice
import app.models.plan
import app.models.role
import app.models.room
import app.models.incident
import app.models.ticket
from app.core.auth.security import get_password_hash


def seed_data():
    db = SessionLocal()
    try:
        # Load data from JSON
        # Path should be relative to where the script is run (usually BackEnd root)
        # or we can use absolute path relative to this file
        seed_path = os.path.join(os.path.dirname(__file__), "seeds", "auth_data.json")
        with open(seed_path, "r") as f:
            data = json.load(f)

        print("Migrating Schema (Drop/Create Users & Hotels)...")
        # Drop tables to ensure schema update
        try:
            db.execute(text("DROP TABLE IF EXISTS users CASCADE"))
            db.execute(text("DROP TABLE IF EXISTS hotels CASCADE"))
            db.commit()
        except Exception as e:
            print(f"Error dropping tables: {e}")
            db.rollback()

        # Recreate tables
        print("Creating tables...")
        Base.metadata.create_all(bind=engine)

        # 1. Seed Tenants
        print("Seeding Tenants...")
        tenant_map = {}  # Store hotel_id by tenant_key

        for tenant_data in data.get("tenants", []):
            tenant = (
                db.query(Hotel)
                .filter(Hotel.tenant_key == tenant_data["tenant_key"])
                .first()
            )
            if not tenant:
                tenant = Hotel(
                    name=tenant_data["name"],
                    email=tenant_data["email"],
                    tenant_type=tenant_data["tenant_type"],
                    tenant_key=tenant_data["tenant_key"],
                    status=tenant_data["status"],
                )
                db.add(tenant)
                db.commit()
                db.refresh(tenant)
                print(f"Created Tenant: {tenant.name} (ID: {tenant.id})")
            tenant_map[tenant_data["tenant_key"]] = tenant.id

        # 2. Seed Users
        print("Seeding Users...")
        for user_data in data.get("users", []):
            user = db.query(User).filter(User.email == user_data["email"]).first()
            tenant_id = tenant_map.get(user_data["tenant_key"])

            if not user:
                user = User(
                    name=user_data["name"],
                    email=user_data["email"],
                    password=get_password_hash(user_data["password"]),
                    role=user_data["role"],
                    user_type=user_data["user_type"],
                    hotel_id=tenant_id,
                    status="Active",
                )
                db.add(user)
            else:
                user.user_type = user_data["user_type"]
                user.hotel_id = tenant_id
                user.password = get_password_hash(user_data["password"])
                user.role = user_data["role"]

        db.commit()
        print("Seeding Complete!")

    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
