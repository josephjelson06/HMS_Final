from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
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
from app.modules.rbac import require_permission
from app.modules.limits import check_room_limit

router = APIRouter(prefix="/api/hotels/{hotel_id}", tags=["rooms"])

# --- Buildings ---


@router.get("/buildings", response_model=List[BuildingResponse])
def get_buildings(hotel_id: UUID, db: Session = Depends(get_db)):
    return db.query(Building).filter(Building.tenant_id == hotel_id).all()


@router.post(
    "/buildings",
    response_model=BuildingResponse,
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def create_building(
    hotel_id: UUID, building: BuildingCreate, db: Session = Depends(get_db)
):
    db_building = Building(**building.model_dump(), tenant_id=hotel_id)
    db.add(db_building)
    db.commit()
    db.refresh(db_building)
    return db_building


# --- Categories ---


@router.get("/categories", response_model=List[RoomCategoryResponse])
def get_categories(hotel_id: UUID, db: Session = Depends(get_db)):
    db_categories = (
        db.query(RoomCategory).filter(RoomCategory.tenant_id == hotel_id).all()
    )
    # Convert amenities string back to list
    for cat in db_categories:
        cat.amenities = cat.amenities.split(",") if cat.amenities else []
    return db_categories


@router.post(
    "/categories",
    response_model=RoomCategoryResponse,
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def create_category(
    hotel_id: UUID, category: RoomCategoryCreate, db: Session = Depends(get_db)
):
    cat_data = category.model_dump()
    cat_data["amenities"] = ",".join(cat_data["amenities"])
    db_category = RoomCategory(**cat_data, tenant_id=hotel_id)
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
def get_rooms(hotel_id: UUID, db: Session = Depends(get_db)):
    return db.query(Room).filter(Room.tenant_id == hotel_id).all()


@router.post(
    "/rooms",
    response_model=RoomResponse,
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def create_room(hotel_id: UUID, room: RoomCreate, db: Session = Depends(get_db)):
    # ── Plan limit enforcement ──
    check_room_limit(db, hotel_id, adding=1)

    # Check if category exists
    cat = (
        db.query(RoomCategory)
        .filter(RoomCategory.id == room.category_id, RoomCategory.tenant_id == hotel_id)
        .first()
    )
    if not cat:
        raise HTTPException(status_code=400, detail="Invalid Category ID")

    # Check if building exists
    bld = (
        db.query(Building)
        .filter(Building.id == room.building_id, Building.tenant_id == hotel_id)
        .first()
    )
    if not bld:
        raise HTTPException(status_code=400, detail="Invalid Building ID")

    db_room = Room(**room.model_dump(), tenant_id=hotel_id)
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room


@router.post(
    "/rooms/batch",
    response_model=List[RoomResponse],
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def create_rooms_batch(
    hotel_id: UUID, rooms: List[RoomCreate], db: Session = Depends(get_db)
):
    # ── Plan limit enforcement ──
    check_room_limit(db, hotel_id, adding=len(rooms))

    created_rooms = []
    for room in rooms:
        # Check if room exists
        if (
            room.id
            and db.query(Room)
            .filter(Room.id == room.id, Room.tenant_id == hotel_id)
            .first()
        ):
            continue

        db_room = Room(**room.model_dump(), tenant_id=hotel_id)
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


@router.put(
    "/rooms/{room_id}",
    response_model=RoomResponse,
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def update_room(
    hotel_id: UUID, room_id: UUID, room: RoomUpdate, db: Session = Depends(get_db)
):
    db_room = (
        db.query(Room).filter(Room.id == room_id, Room.tenant_id == hotel_id).first()
    )
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    update_data = room.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_room, key, value)

    db.commit()
    db.refresh(db_room)
    return db_room


@router.delete(
    "/rooms/{room_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def delete_room(hotel_id: UUID, room_id: UUID, db: Session = Depends(get_db)):
    db_room = (
        db.query(Room).filter(Room.id == room_id, Room.tenant_id == hotel_id).first()
    )
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    db.delete(db_room)
    db.commit()
    return None
