import os
import json
import sys

# Ensure we are running from the root of the app
sys.path.append(os.getcwd())

from app.database import SessionLocal, engine, Base
from app.models.user import User


def seed_users():
    db = SessionLocal()

    # Load data from JSON
    check_path = os.path.join(os.path.dirname(__file__), "users.json")
    if not os.path.exists(check_path):
        print(f"File not found: {check_path}")
        return

    with open(check_path, "r") as f:
        users_data = json.load(f)

    print(f"Found {len(users_data)} users to seed.")

    # Get current user count for employee_id generation
    current_count = db.query(User).count()

    for i, user_data in enumerate(users_data):
        # Check if exists by email to avoid duplicates
        existing = db.query(User).filter(User.email == user_data["email"]).first()
        if existing:
            print(f"Skipping {user_data['name']} (already exists)")
            continue

        print(f"Seeding user: {user_data['name']}")

        # Generate Employee ID
        employee_id = f"ATC-EMP-{(current_count + i + 1):03d}"

        # Create User
        user = User(**user_data, employee_id=employee_id, last_login="Never")
        db.add(user)
        db.commit()
        db.refresh(user)

    db.close()
    print("User seeding completed successfully!")


if __name__ == "__main__":
    print("Starting User seeding...")
    Base.metadata.create_all(bind=engine)
    seed_users()
