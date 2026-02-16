import os
import json
import sys

# Ensure we are running from the root of the app
sys.path.append(os.getcwd())

from app.database import SessionLocal, engine, Base

# Import all models to ensure they are registered with Base metadata
from app.models.hotel import Hotel
from app.models.invoice import Invoice
from app.models.kiosk import Kiosk


def seed_hotels():
    db = SessionLocal()

    # Load data from JSON
    check_path = os.path.join(os.path.dirname(__file__), "hotels.json")
    if not os.path.exists(check_path):
        print(f"File not found: {check_path}")
        return

    with open(check_path, "r") as f:
        hotels_data = json.load(f)

    print(f"Found {len(hotels_data)} hotels to seed.")

    for hotel_data in hotels_data:
        # Check if exists by email to avoid duplicates
        existing = db.query(Hotel).filter(Hotel.email == hotel_data["email"]).first()
        if existing:
            print(f"Skipping {hotel_data['name']} (already exists)")
            continue

        print(f"Seeding {hotel_data['name']} with {hotel_data['kiosks']} kiosks...")

        # Create Hotel
        hotel = Hotel(**hotel_data)
        db.add(hotel)
        db.commit()  # Commit to get ID
        db.refresh(hotel)

        # Create dummy kiosks if needed
        # (Optional logic here if we wanted to seed kiosks too)

    db.close()
    print("Seeding completed successfully!")


if __name__ == "__main__":
    print("Starting database seeding...")
    # Ensure tables exist (optional, but good for safety)
    Base.metadata.create_all(bind=engine)
    seed_hotels()
