from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.room import Room, RoomCategory, Building
from app.schemas.room import (
    RoomCreate,
    RoomUpdate,
    RoomResponse,
    RoomCategoryCreate,
    RoomCategoryResponse,
    BuildingCreate,
    BuildingResponse,
)

router = APIRouter(prefix="/hotels/{hotel_id}", tags=["rooms"])

# --- Buildings ---


@router.get("/buildings", response_model=List[BuildingResponse])
def get_buildings(hotel_id: int, db: Session = Depends(get_db)):
    return db.query(Building).filter(Building.hotel_id == hotel_id).all()


@router.post("/buildings", response_model=BuildingResponse)
def create_building(
    hotel_id: int, building: BuildingCreate, db: Session = Depends(get_db)
):
    db_building = Building(**building.dict(), hotel_id=hotel_id)
    db.add(db_building)
    db.commit()
    db.refresh(db_building)
    return db_building


# --- Categories ---


@router.get("/categories", response_model=List[RoomCategoryResponse])
def get_categories(hotel_id: int, db: Session = Depends(get_db)):
    db_categories = (
        db.query(RoomCategory).filter(RoomCategory.hotel_id == hotel_id).all()
    )
    # Convert amenities string back to list
    for cat in db_categories:
        cat.amenities = cat.amenities.split(",") if cat.amenities else []
    return db_categories


@router.post("/categories", response_model=RoomCategoryResponse)
def create_category(
    hotel_id: int, category: RoomCategoryCreate, db: Session = Depends(get_db)
):
    cat_data = category.dict()
    cat_data["amenities"] = ",".join(cat_data["amenities"])
    db_category = RoomCategory(**cat_data, hotel_id=hotel_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    # Convert back for response
    db_category.amenities = (
        db_category.amenities.split(",") if db_category.amenities else []
    )
    return db_category


# --- Rooms ---


@router.get("/rooms", response_model=List[RoomResponse])
def get_rooms(hotel_id: int, db: Session = Depends(get_db)):
    return db.query(Room).filter(Room.hotel_id == hotel_id).all()


@router.post("/rooms", response_model=RoomResponse)
def create_room(hotel_id: int, room: RoomCreate, db: Session = Depends(get_db)):
    # Check if category exists
    cat = (
        db.query(RoomCategory)
        .filter(RoomCategory.id == room.category_id, RoomCategory.hotel_id == hotel_id)
        .first()
    )
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid Category ID")

    # Check if building exists
    bld = (
        db.query(Building)
        .filter(Building.id == room.building_id, Building.hotel_id == hotel_id)
        .first()
    )
    if not bld:
        raise HTTPException(status_code=400, detail="Invalid Building ID")

    db_room = Room(**room.dict(), hotel_id=hotel_id)
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room


@router.post("/rooms/batch", response_model=List[RoomResponse])
def create_rooms_batch(
    hotel_id: int, rooms: List[RoomCreate], db: Session = Depends(get_db)
):
    created_rooms = []
    for room in rooms:
        # Check if room exists
        if db.query(Room).filter(Room.id == room.id, Room.hotel_id == hotel_id).first():
            continue

        db_room = Room(**room.dict(), hotel_id=hotel_id)
        db.add(db_room)
        created_rooms.append(db_room)

    try:
        db.commit()
        for r in created_rooms:
            db.refresh(r)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Batch Create Failed: {str(e)}")

    return created_rooms


@router.put("/rooms/{room_id}", response_model=RoomResponse)
def update_room(
    hotel_id: int, room_id: str, room: RoomUpdate, db: Session = Depends(get_db)
):
    db_room = (
        db.query(Room).filter(Room.id == room_id, Room.hotel_id == hotel_id).first()
    )
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    update_data = room.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_room, key, value)

    db.commit()
    db.refresh(db_room)
    return db_room


@router.delete("/rooms/{room_id}")
def delete_room(hotel_id: int, room_id: str, db: Session = Depends(get_db)):
    db_room = (
        db.query(Room).filter(Room.id == room_id, Room.hotel_id == hotel_id).first()
    )
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    db.delete(db_room)
    db.commit()
    return {"message": "Room deleted successfully"}
