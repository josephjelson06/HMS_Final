import json
import os
import sys

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base, SQLALCHEMY_DATABASE_URL as DATABASE_URL
from app.models.room import Room, RoomCategory, Building
from app.models.hotel import Hotel

# Import other models to ensure they are registered with Base
from app.models.invoice import Invoice
from app.models.kiosk import Kiosk
from app.models.plan import Plan

# Create database engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()


def seed_room_management():
    print("Seeding Room Management Data...")

    # Get the first hotel (assuming hotel_id=1 for now)
    hotel = db.query(Hotel).order_by(Hotel.id).first()
    if not hotel:
        print("Error: No hotel found. Please seed hotels first.")
        return

    hotel_id = hotel.id
    print(f"Using Hotel ID: {hotel_id}")

    # Seed Room Categories
    categories_path = os.path.join(os.path.dirname(__file__), "room_categories.json")
    if os.path.exists(categories_path):
        with open(categories_path, "r") as f:
            categories_data = json.load(f)

        for cat_data in categories_data:
            existing_cat = (
                db.query(RoomCategory)
                .filter(
                    RoomCategory.id == cat_data["id"], RoomCategory.hotel_id == hotel_id
                )
                .first()
            )

            if not existing_cat:
                amenities_str = ",".join(cat_data.pop("amenities", []))
                new_cat = RoomCategory(
                    **cat_data, amenities=amenities_str, hotel_id=hotel_id
                )
                db.add(new_cat)
                print(f"Adding Category: {new_cat.name}")
            else:
                print(f"Category {cat_data['name']} already exists.")

        try:
            db.commit()
        except Exception as e:
            db.rollback()
            print(f"Error seeding categories: {e}")

    # Seed Rooms and Buildings
    rooms_path = os.path.join(os.path.dirname(__file__), "rooms.json")
    if os.path.exists(rooms_path):
        with open(rooms_path, "r") as f:
            room_config = json.load(f)

        building_name = room_config.get("building")
        rooms_list = room_config.get("rooms", [])

        if building_name:
            # Check or Create Building
            building = (
                db.query(Building)
                .filter(Building.name == building_name, Building.hotel_id == hotel_id)
                .first()
            )

            if not building:
                building = Building(name=building_name, hotel_id=hotel_id)
                db.add(building)
                db.commit()  # Commit to get building ID
                db.refresh(building)
                print(f"Created Building: {building.name} (ID: {building.id})")
            else:
                print(f"Building {building.name} already exists (ID: {building.id}).")

            # Seed Rooms
            for r in rooms_list:
                existing_room = (
                    db.query(Room)
                    .filter(Room.id == r["id"], Room.hotel_id == hotel_id)
                    .first()
                )

                if not existing_room:
                    # Lookup category by ID
                    cat_id = r["category_id"]

                    # Create Room
                    # Assuming default type and status
                    new_room = Room(
                        id=r["id"],
                        floor=r["floor"],
                        status="CLEAN_VACANT",
                        type="Hostel Room",  # Default from model
                        building_id=building.id,
                        category_id=cat_id,
                        hotel_id=hotel_id,
                    )
                    db.add(new_room)
                    print(f"Adding Room: {new_room.id}")
                else:
                    print(f"Room {r['id']} already exists.")

            try:
                db.commit()
            except Exception as e:
                db.rollback()
                print(f"Error seeding rooms: {e}")


if __name__ == "__main__":
    seed_room_management()
    db.close()
