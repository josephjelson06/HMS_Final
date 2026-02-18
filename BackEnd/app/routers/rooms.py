from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.room import (
    BuildingCreate,
    BuildingResponse,
    RoomCategoryCreate,
    RoomCategoryResponse,
    RoomCreate,
    RoomResponse,
    RoomUpdate,
)
from app.services.room_service import RoomService

router = APIRouter(prefix="/api/hotels/{hotel_id}", tags=["rooms"])


@router.get("/buildings", response_model=List[BuildingResponse])
def get_buildings(hotel_id: UUID, db: Session = Depends(get_db)):
    return RoomService(db).get_buildings(hotel_id=hotel_id)


@router.post(
    "/buildings",
    response_model=BuildingResponse,
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def create_building(hotel_id: UUID, building: BuildingCreate, db: Session = Depends(get_db)):
    return RoomService(db).create_building(hotel_id=hotel_id, payload=building)


@router.get("/categories", response_model=List[RoomCategoryResponse])
def get_categories(hotel_id: UUID, db: Session = Depends(get_db)):
    return RoomService(db).get_categories(hotel_id=hotel_id)


@router.post(
    "/categories",
    response_model=RoomCategoryResponse,
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def create_category(hotel_id: UUID, category: RoomCategoryCreate, db: Session = Depends(get_db)):
    return RoomService(db).create_category(hotel_id=hotel_id, payload=category)


@router.delete(
    "/categories/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def delete_category(hotel_id: UUID, category_id: str, db: Session = Depends(get_db)):
    RoomService(db).delete_category(hotel_id=hotel_id, category_id=category_id)
    return None


@router.get("/rooms", response_model=List[RoomResponse])
def get_rooms(hotel_id: UUID, db: Session = Depends(get_db)):
    return RoomService(db).get_rooms(hotel_id=hotel_id)


@router.post(
    "/rooms",
    response_model=RoomResponse,
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def create_room(hotel_id: UUID, room: RoomCreate, db: Session = Depends(get_db)):
    return RoomService(db).create_room(hotel_id=hotel_id, payload=room)


@router.post(
    "/rooms/batch",
    response_model=List[RoomResponse],
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def create_rooms_batch(hotel_id: UUID, rooms: List[RoomCreate], db: Session = Depends(get_db)):
    return RoomService(db).create_rooms_batch(hotel_id=hotel_id, rooms=rooms)


@router.put(
    "/rooms/{room_id}",
    response_model=RoomResponse,
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def update_room(hotel_id: UUID, room_id: str, room: RoomUpdate, db: Session = Depends(get_db)):
    return RoomService(db).update_room(hotel_id=hotel_id, room_id=room_id, payload=room)


@router.delete(
    "/rooms/{room_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("hotel:rooms:write"))],
)
def delete_room(hotel_id: UUID, room_id: str, db: Session = Depends(get_db)):
    RoomService(db).delete_room(hotel_id=hotel_id, room_id=room_id)
    return None
