import json
import os
import sys

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, DATABASE_URL
from app.models.ticket import Ticket
from app.models.hotel import Hotel


def seed_tickets():
    print(f"Connecting to database: {DATABASE_URL}")
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    try:
        # Load tickets from JSON
        json_path = os.path.join(os.path.dirname(__file__), "tickets.json")
        print(f"Loading tickets from: {json_path}")

        with open(json_path, "r") as f:
            tickets_data = json.load(f)

        for ticket_data in tickets_data:
            print(f"Processing ticket: {ticket_data['subject']}")
            # Check if ticket already exists
            existing = (
                db.query(Ticket)
                .filter(
                    Ticket.subject == ticket_data["subject"],
                    Ticket.hotel_id == ticket_data["hotel_id"],
                )
                .first()
            )

            if existing:
                print(f"  - Already exists. Skipping.")
                continue

            # Verify hotel exists
            hotel = db.query(Hotel).filter(Hotel.id == ticket_data["hotel_id"]).first()
            if not hotel:
                print(f"  - Hotel ID {ticket_data['hotel_id']} not found. Skipping.")
                continue

            ticket = Ticket(**ticket_data)
            db.add(ticket)

        db.commit()
        print("Tickets seeded successfully!")

    except Exception as e:
        print(f"Error seeding tickets: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_tickets()
