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
from app.models.auth import Tenant, User

# from app.models.hotel import Hotel # Deprecated alias
from app.models.role import Role
from app.models.room import Room, RoomCategory, Building
from app.models.room import Room, RoomCategory, Building
from app.models.incident import Incident
from app.models.plan import Plan
from app.models.kiosk import Kiosk
from app.models.ticket import Ticket
from app.models.invoice import Invoice
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


from sqlalchemy.orm import configure_mappers


def seed_all():
    print("Starting Master Seeding Process (Refactored)...")
    engine, db = get_db_session()

    # Ensure all mappers are configured
    configure_mappers()

    # 1. Reset Schema
    print("Dropping and Recreating Tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Schema Reset Complete.")

    tenant_map = {}  # tenant_key -> hotel_id (UUID)

    try:
        # 2. Seed Tenants (Hotels + Platform)
        print("\n--- Seeding Tenants ---")
        auth_data = load_json("auth_data.json")
        tenants = auth_data.get("tenants", [])

        for t_data in tenants:
            hotel = Tenant(
                name=t_data["name"],
                email=t_data["email"],
                tenant_key=t_data["tenant_key"],
                tenant_type=t_data["tenant_type"],
                status=t_data.get("status", "Active"),
                address=t_data.get("address"),
                mobile=t_data.get("mobile"),
                owner=t_data.get("owner"),
                gstin=t_data.get("gstin"),
                pan=t_data.get("pan"),
                plan=t_data.get("plan", "Pro"),
                is_auto_renew=t_data.get("is_auto_renew", 1),
                kiosks=t_data.get("kiosks", 0),
                mrr=t_data.get("mrr", 0.0),
            )
            db.add(hotel)
            db.flush()  # get ID
            tenant_map[t_data["tenant_key"]] = str(hotel.id)
            print(
                f"Created Tenant: {hotel.name} (Type: {hotel.tenant_type}, ID: {hotel.id})"
            )

        db.commit()

        # 3. Seed Roles (Data Roles)
        print("\n--- Seeding Roles ---")
        roles_data = load_json("data_roles.json")
        common_roles = roles_data.get("common", [])
        specific_roles = roles_data.get("specific", {})

        # Iterate all hotels mapped in tenant_map
        for t_key, hotel_id in tenant_map.items():
            # Skip if no roles defined for this tenant in specific_roles AND common roles generally apply to all hotels
            # But usually we want common roles for ALL hotels.
            # Let's check if it is a hotel type if we want to distinguish platform?
            # For now, apply to all in tenant_map except maybe platform if desired, but code applies to all.

            # Simple check: if tenant_type is platform, maybe skip?
            # The previous code filtered `Hotel.tenant_type == "hotel"`.
            # We can check the tenant object from DB or just assume all for now.
            # Let's re-fetch the hotel to check type.
            hotel = db.get(Tenant, hotel_id)
            if not hotel or hotel.tenant_type != "hotel":
                continue

            print(f"Seeding Roles for Tenant {t_key} ({hotel_id})...")

            # Set RLS Context
            db.execute(text(f"SET LOCAL app.tenant_id = '{hotel_id}'"))

            # Common Roles
            for r in common_roles:
                role = Role(
                    name=r["name"],
                    color=r["color"],
                    description=r["description"],
                    tenant_id=hotel_id,
                    status="Active",
                )
                db.add(role)

            # Specific Roles
            if t_key in specific_roles:
                for r in specific_roles[t_key]:
                    role = Role(
                        name=r["name"],
                        color=r["color"],
                        description=r["description"],
                        tenant_id=hotel_id,
                        status="Active",
                    )
                    db.add(role)

        db.commit()

        # 4. Seed Users (Admins + Staff)
        print("\n--- Seeding Users ---")

        # Admin Users
        auth_users = auth_data.get("users", [])
        for u in auth_users:
            t_key = u.get("tenant_key")
            h_id = tenant_map.get(t_key)

            if not h_id:
                print(f"Skipping user {u['name']} - tenant key {t_key} not found")
                continue

            # Set context
            try:
                db.execute(text(f"SET LOCAL app.tenant_id = '{h_id}'"))
            except:
                pass

            user = User(
                name=u["name"],
                email=u["email"],
                username=u["email"],
                password_hash=get_password_hash(u["password"]),
                user_type=u["user_type"],
                tenant_id=h_id,
                mobile=f"+1 555 000 {t_key[:3]}",  # Simple dynamic mobile
                is_active=True,
                department="Management",
                employee_id=f"EMP-{u['email'][:3].upper()}",
            )
            db.add(user)
            print(f"Created Admin: {user.name} (Tenant: {t_key})")

        # Staff Users
        staff_data = load_json("data_staff.json")
        for hotel_group in staff_data:
            t_key = hotel_group.get("tenant_key")
            h_id = tenant_map.get(t_key)

            if not h_id:
                print(f"Skipping staff group for {t_key} - no db match")
                continue

            db.execute(text(f"SET LOCAL app.tenant_id = '{h_id}'"))

            for u in hotel_group["users"]:
                user = User(
                    name=u["name"],
                    email=u["email"],
                    username=u["email"],
                    password_hash=get_password_hash(u["password"]),
                    user_type="hotel",
                    tenant_id=h_id,
                    mobile=u["mobile"],
                    department=u["department"],
                    is_active=True,
                    employee_id=f"STF-{h_id[:4]}-{u['name'][:3].upper()}",
                )
                db.add(user)
                print(f"Created Staff: {user.name} for {t_key}")

        db.commit()

        # 5. Seed Rooms
        print("\n--- Seeding Rooms ---")
        rooms_data = load_json("data_rooms.json")
        for hotel_group in rooms_data:
            t_key = hotel_group.get("tenant_key")
            h_id = tenant_map.get(t_key)

            if not h_id:
                continue

            db.execute(text(f"SET LOCAL app.tenant_id = '{h_id}'"))

            # Categories
            for c in hotel_group.get("categories", []):
                cat = RoomCategory(
                    id=c["id"],
                    name=c["name"],
                    rate=c["rate"],
                    occupancy=c["occupancy"],
                    amenities=",".join(c["amenities"]),
                    tenant_id=h_id,
                )
                db.add(cat)

            db.flush()

            # Building
            b_name = hotel_group.get("building", "Main Building")
            building = Building(name=b_name, tenant_id=h_id)
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
                    tenant_id=h_id,
                )
                db.add(room)

            print(f"Seeded Rooms for {t_key}")

        db.commit()

        # 6. Seed Incidents
        print("\n--- Seeding Incidents ---")
        incidents_data = load_json("data_incidents.json")
        for inc in incidents_data:
            t_key = inc.get("tenant_key")
            h_id = tenant_map.get(t_key)

            if not h_id:
                continue

            db.execute(text(f"SET LOCAL app.tenant_id = '{h_id}'"))

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
                tenant_id=h_id,
                created_at=datetime.utcnow().isoformat(),
                updated_at=datetime.utcnow().isoformat(),
            )
            db.add(incident)

        db.commit()
        print("Incidents Seeding Complete.")

        # 7. Seed Tickets (Hotel -> Platform Support)
        print("\n--- Seeding Tickets ---")
        tickets_path = os.path.join(os.path.dirname(__file__), "seeds", "tickets.json")
        if os.path.exists(tickets_path):
            tickets_data = load_json("tickets.json")
            for t_data in tickets_data:
                t_key = t_data.get("tenant_key")
                h_id = tenant_map.get(t_key)

                if not h_id:
                    continue

                db.execute(text(f"SET LOCAL app.tenant_id = '{h_id}'"))

                ticket = Ticket(
                    subject=t_data["subject"],
                    description=t_data["description"],
                    priority=t_data["priority"],
                    status=t_data["status"],
                    category=t_data["category"],
                    tenant_id=h_id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
                db.add(ticket)
            db.commit()
            print("Tickets Seeded.")
        else:
            print("tickets.json not found, skipping.")

        # 6a. Seed Plans (Optional, if not handled by planseed.py separately)
        # Assuming planseed.py exists and works, we can either call it here or leave it.
        # But for 'seed_all', let's include Plans since we have models for it.
        try:
            print("\n--- Seeding Plans ---")
            p_data_list = load_json("plans_data.json")

            for p_data in p_data_list:
                plan = Plan(
                    name=p_data["name"],
                    price=p_data["price"],
                    rooms=p_data["rooms"],
                    kiosks=p_data["kiosks"],
                    subscribers=p_data["subscribers"],
                    support=p_data["support"],
                    included=p_data["included"],
                    theme=p_data["theme"],
                )
                db.add(plan)
            db.commit()
            print("Plans Seeded.")
        except Exception as e:
            print(f"Plan seeding error: {e}")

    except Exception as e:
        print(f"CRITICAL ERROR SEEDING: {e}")
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_all()
