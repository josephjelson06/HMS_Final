import uuid
from app.database import SessionLocal
from app.models.auth import Permission

permissions_to_seed = [
    # --- PLATFORM SCOPE ---
    ("platform:tenants:read", "View tenant (hotel) list and details"),
    ("platform:tenants:write", "Create and update tenants"),
    ("platform:tenants:delete", "Delete tenants"),
    ("platform:plans:read", "View subscription plans"),
    ("platform:plans:write", "Manage subscription plans"),
    ("platform:users:read", "View platform users"),
    ("platform:users:write", "Manage platform users"),
    ("platform:roles:read", "View system roles"),
    ("platform:roles:write", "Manage system roles and permissions"),
    ("platform:kiosks:read", "View kiosk fleet"),
    ("platform:kiosks:write", "Manage kiosk hardware and firmware"),
    ("platform:billing:read", "View platform billing and invoices"),
    ("platform:billing:write", "Manage billing and payments"),
    ("platform:reports:read", "Access platform-wide reports"),
    # --- HOTEL SCOPE ---
    ("hotel:users:read", "View hotel staff list"),
    ("hotel:users:write", "Manage hotel staff"),
    ("hotel:roles:read", "View hotel-specific roles"),
    ("hotel:roles:write", "Manage hotel roles and permissions"),
    ("hotel:rooms:read", "View room status and inventory"),
    ("hotel:rooms:write", "Manage rooms and categories"),
    ("hotel:bookings:read", "View guest bookings"),
    ("hotel:bookings:write", "Create and manage bookings"),
    ("hotel:housekeeping:read", "View cleaning tasks"),
    ("hotel:housekeeping:write", "Manage housekeeping assignments"),
    ("hotel:incidents:read", "View maintenance incidents"),
    ("hotel:incidents:write", "Report and resolve incidents"),
    ("hotel:invoices:read", "View hotel invoices"),
    ("hotel:invoices:write", "Generate and manage invoices"),
    ("hotel:reports:read", "Access hotel-level analytics"),
    # Custom/Special
    ("platform:*:*", "Full Platform Access"),
    ("hotel:*:*", "Full Hotel Access"),
]


def seed_permissions():
    db = SessionLocal()
    print("Seeding permissions...")
    try:
        for key, desc in permissions_to_seed:
            existing = (
                db.query(Permission).filter(Permission.permission_key == key).first()
            )
            if not existing:
                perm = Permission(permission_key=key, description=desc)
                db.add(perm)
                print(f"Added: {key}")
            else:
                print(f"Exists: {key}")
        db.commit()
        print("Success!")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_permissions()
