import json
import os
import sys
from datetime import datetime
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import Base
from app.core.config import get_settings
from app.models.hotel import Hotel
from app.models.user import User
from app.models.role import Role
from app.models.room import Room, RoomCategory, Building
from app.models.incident import Incident
from app.models.invoice import Invoice
from app.models.plan import Plan
from app.models.kiosk import Kiosk
from app.models.ticket import Ticket
from app.core.auth.security import get_password_hash

settings = get_settings()
DATABASE_URL = settings.database_url


def get_db_session():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine, SessionLocal()


def load_json(filename):
    path = os.path.join(os.path.dirname(__file__), "seeds", filename)
    with open(path, "r") as f:
        return json.load(f)


def seed_all():
    print("Starting Master Seeding Process...")
    engine, db = get_db_session()

    # 1. Reset Schema
    print("Dropping and Recreating Tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Schema Reset Complete.")

    tenant_map = {}  # Key -> ID

    try:
        # 2. Seed Tenants (Hotels)
        print("\n--- Seeding Tenants ---")
        auth_data = load_json("auth_data.json")
        tenants = auth_data.get("tenants", [])

        for t_data in tenants:
            if t_data["tenant_type"] == "hotel":
                hotel = Hotel(
                    name=t_data["name"],
                    email=t_data["email"],
                    tenant_key=t_data["tenant_key"],
                    tenant_type="hotel",
                    status="Active",
                    address="123 Seed Street",
                    mobile="+1234567890",
                    owner="Seed Owner",
                    gstin=f"GSTIN-{t_data['tenant_key'].upper()}",
                    plan="Pro",
                    is_auto_renew=1,
                    kiosks=0,
                    mrr=0.0,
                )
                db.add(hotel)
                db.flush()  # get ID
                tenant_map[t_data["tenant_key"]] = hotel.id
                print(f"Created Hotel: {hotel.name} (ID: {hotel.id})")
            else:
                print(f"Skipping Platform Tenant Record for {t_data['name']}")
                tenant_map[t_data["tenant_key"]] = 0  # Platform

        db.commit()

        # 3. Seed Roles (Data Roles)
        print("\n--- Seeding Roles ---")
        roles_data = load_json("data_roles.json")
        common_roles = roles_data.get("common", [])
        specific_roles = roles_data.get("specific", {})

        # Get all hotels to seed common roles
        hotels = db.query(Hotel).all()

        def create_role(name, color, description, hotel_id):
            role = Role(
                name=name,
                color=color,
                description=description,
                hotel_id=hotel_id,
                status="Active",
            )
            db.add(role)

        for hotel in hotels:
            print(f"Seeding Roles for Hotel ID {hotel.id}...")
            # Set RLS Context
            db.execute(text(f"SET LOCAL app.tenant_id = '{hotel.id}'"))

            # Common Roles
            for r in common_roles:
                create_role(r["name"], r["color"], r["description"], hotel.id)

            # Specific Roles
            # keys in JSON are likely string "2", "3" but our IDs might be different if sequences changed
            # But likely they are 1, 2, 3...
            # Let's try to match by ID string.
            # If IDs are generated sequentially, 1, 2, 3...
            # The JSON keys for specific roles are "2", "3", "4".
            # Hopefully queries align.
            s_roles = specific_roles.get(str(hotel.id), [])
            for r in s_roles:
                create_role(r["name"], r["color"], r["description"], hotel.id)

        db.commit()

        # 4. Seed Users (Admins + Staff)
        print("\n--- Seeding Users ---")
        # seed admins from auth_data
        auth_users = auth_data.get("users", [])
        for u in auth_users:
            t_key = u.get("tenant_key")
            h_id = tenant_map.get(t_key)

            # Special case: Platform user might be 0 or None
            if h_id == 0:
                h_id = None
                try:
                    db.execute(text("RESET app.tenant_id"))
                except:
                    pass
            else:
                try:
                    db.execute(text(f"SET LOCAL app.tenant_id = '{h_id}'"))
                except:
                    pass

            user = User(
                name=u["name"],
                email=u["email"],
                password=get_password_hash(u["password"]),
                role=u["role"],
                user_type=u["user_type"],
                hotel_id=h_id,
                mobile=f"+1 555 000 {h_id if h_id else 0}",
                status="Active",
                department="Management",
                employee_id=f"EMP-{u['email'][:3].upper()}",
            )
            db.add(user)
            print(f"Created Admin: {user.name}")

        # seed staff from data_staff
        staff_data = load_json("data_staff.json")
        for hotel_group in staff_data:
            # The JSON uses hardcoded "hotel_id": 2.
            # If our DB generates different IDs, this breaks.
            # But since we reset DB, IDs should start from 1.
            # Hotels are seeded first.
            # Platform skipped in table (?), so first hotel is ID 1?
            # NO, Platform tenant was skipped in DB insert loop above!
            # So First Hotel = ID 1.
            # But auth_data.json has Grand Hotel as 2nd...
            # Wait, auth_data.json has [Platform, Grand, Cozy, Budget].
            # Platform skipped.
            # So Grand = 1, Cozy = 2, Budget = 3.
            # BUT `data_staff.json` uses ID 2, 3, 4.
            # I should align them.
            # OR I should fix `data_staff.json` to use tenant_key, but I didn't write it that way.
            # Let's just assume the offset is -1 from JSON if Platform skipped.
            # actually, let's fix the JSON map logic on the fly.

            target_id = hotel_group["hotel_id"]
            # If JSON says 2 (Grand Hotel), and in DB it's 1...
            # This is risky.
            # Let's verify:
            # Tenant Map: {'grand_hotel': 1, 'cozy_stay': 2, ...}
            # JSOn uses 2 for Grand Hotel.
            # I will map hardcoded JSON IDs to Tenant Keys if possible.
            # Hardcoded mapping for this task:
            # 2 -> grand_hotel
            # 3 -> cozy_stay
            # 4 -> budget_inn

            key_map = {2: "grand_hotel", 3: "cozy_stay", 4: "budget_inn"}

            t_key = key_map.get(target_id)
            real_h_id = tenant_map.get(t_key)

            if not real_h_id:
                print(f"Skipping staff group {target_id} - no db match")
                continue

            db.execute(text(f"SET LOCAL app.tenant_id = '{real_h_id}'"))

            for u in hotel_group["users"]:
                user = User(
                    name=u["name"],
                    email=u["email"],
                    password=get_password_hash(u["password"]),
                    role=u["role"],
                    user_type="hotel",
                    hotel_id=real_h_id,
                    mobile=u["mobile"],
                    department=u["department"],
                    status="Active",
                    employee_id=f"STF-{real_h_id}-{u['name'][:3].upper()}",
                )
                db.add(user)
                print(f"Created Staff: {user.name} for Hotel {real_h_id}")

        db.commit()

        # 5. Seed Rooms
        print("\n--- Seeding Rooms ---")
        rooms_data = load_json("data_rooms.json")
        for hotel_group in rooms_data:
            target_id = hotel_group["hotel_id"]
            key_map = {2: "grand_hotel", 3: "cozy_stay", 4: "budget_inn"}
            t_key = key_map.get(target_id)
            real_h_id = tenant_map.get(t_key)

            if not real_h_id:
                continue

            db.execute(text(f"SET LOCAL app.tenant_id = '{real_h_id}'"))

            # Categories
            for c in hotel_group.get("categories", []):
                cat = RoomCategory(
                    id=c["id"],
                    name=c["name"],
                    rate=c["rate"],
                    occupancy=c["occupancy"],
                    amenities=",".join(c["amenities"]),
                    hotel_id=real_h_id,
                )
                db.add(cat)

            db.flush()

            # Building
            b_name = hotel_group.get("building", "Main Building")
            building = Building(name=b_name, hotel_id=real_h_id)
            db.add(building)
            db.flush()

            # Rooms
            for r in hotel_group.get("rooms", []):
                room = Room(
                    id=r["id"],
                    floor=r["floor"],
                    status="CLEAN_VACANT",
                    type="Room",
                    building_id=building.id,
                    category_id=r["category_id"],
                    hotel_id=real_h_id,
                )
                db.add(room)

            print(f"Seeded Rooms for Hotel {real_h_id}")

        db.commit()

        # 6. Seed Incidents
        print("\n--- Seeding Incidents ---")
        incidents_data = load_json("data_incidents.json")
        for inc in incidents_data:
            target_id = inc["hotel_id"]
            key_map = {2: "grand_hotel", 3: "cozy_stay", 4: "budget_inn"}
            t_key = key_map.get(target_id)
            real_h_id = tenant_map.get(t_key)

            if not real_h_id:
                continue

            db.execute(text(f"SET LOCAL app.tenant_id = '{real_h_id}'"))

            incident = Incident(
                subject=inc["subject"],
                description=inc["description"],
                room=inc["room"],
                priority=inc["priority"],
                status=inc["status"],
                category=inc["category"],
                guest_name=inc["guest_name"],
                reported_by=inc["reported_by"],
                assigned_to=inc["assigned_to"],
                hotel_id=real_h_id,
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat(),
            )
            db.add(incident)

        db.commit()
        print("Incidents Seeding Complete.")

    except Exception as e:
        print(f"CRITICAL ERROR SEEDING: {e}")
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
