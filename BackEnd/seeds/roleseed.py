import os
import json
import sys

# Ensure we are running from the root of the app
sys.path.append(os.getcwd())

from app.database import SessionLocal, engine, Base
from app.models.role import Role


def seed_roles():
    db = SessionLocal()

    # Load data from JSON
    check_path = os.path.join(os.path.dirname(__file__), "roles.json")
    if not os.path.exists(check_path):
        print(f"File not found: {check_path}")
        return

    with open(check_path, "r") as f:
        roles_data = json.load(f)

    print(f"Found {len(roles_data)} roles to seed.")

    for role_data in roles_data:
        # Check if exists by name to avoid duplicates
        existing = db.query(Role).filter(Role.name == role_data["name"]).first()
        if existing:
            print(f"Skipping {role_data['name']} (already exists)")
            continue

        print(f"Seeding role: {role_data['name']}")

        # Create Role
        role = Role(**role_data)
        db.add(role)
        db.commit()
        db.refresh(role)

    db.close()
    print("Role seeding completed successfully!")


if __name__ == "__main__":
    print("Starting Role seeding...")
    Base.metadata.create_all(bind=engine)
    seed_roles()
