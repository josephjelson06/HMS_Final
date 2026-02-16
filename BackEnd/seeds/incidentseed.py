import json
import os
import sys

# Add the parent directory to sys.path to import app modules
# Assuming this script is run from /app/seeds/ or /app/
# We need /app to be in sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, DATABASE_URL
from app.models.incident import Incident
from app.models.hotel import Hotel


def seed_incidents():
    print(f"Connecting to database: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Load incidents from JSON
        # File is in the same directory as the script
        json_path = os.path.join(os.path.dirname(__file__), "incidents.json")
        print(f"Loading incidents from: {json_path}")

        with open(json_path, "r") as f:
            incidents_data = json.load(f)

        for incident_data in incidents_data:
            print(f"Processing incident: {incident_data['subject']}")
            # Check if incident already exists
            existing = (
                db.query(Incident)
                .filter(
                    Incident.subject == incident_data["subject"],
                    Incident.room == incident_data["room"],
                    Incident.hotel_id == incident_data["hotel_id"],
                )
                .first()
            )

            if existing:
                print(f"  - Already exists. Skipping.")
                continue

            # Verify hotel exists
            hotel = (
                db.query(Hotel).filter(Hotel.id == incident_data["hotel_id"]).first()
            )
            if not hotel:
                print(f"  - Hotel ID {incident_data['hotel_id']} not found. Skipping.")
                continue

            incident = Incident(**incident_data)
            db.add(incident)

        db.commit()
        print("Incidents seeded successfully!")

    except Exception as e:
        print(f"Error seeding incidents: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_incidents()
