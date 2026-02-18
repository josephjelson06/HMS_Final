from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.room import Building, Room, RoomCategory
from app.modules.limits import check_room_limit
from app.schemas.room import BuildingCreate, RoomCategoryCreate, RoomCreate, RoomUpdate


class RoomService:
    def __init__(self, db: Session):
        self.db = db

    def get_buildings(self, hotel_id: UUID) -> list[Building]:
        return self.db.query(Building).filter(Building.tenant_id == hotel_id).all()

    def create_building(self, hotel_id: UUID, payload: BuildingCreate) -> Building:
        db_building = Building(**payload.model_dump(), tenant_id=hotel_id)
        self.db.add(db_building)
        self.db.commit()
        self.db.refresh(db_building)
        return db_building

    def get_categories(self, hotel_id: UUID) -> list[RoomCategory]:
        categories = self.db.query(RoomCategory).filter(RoomCategory.tenant_id == hotel_id).all()
        for category in categories:
            category.amenities = category.amenities.split(",") if category.amenities else []
        return categories

    def create_category(self, hotel_id: UUID, payload: RoomCategoryCreate) -> RoomCategory:
        data = payload.model_dump()
        data["amenities"] = ",".join(data["amenities"])
        db_category = RoomCategory(**data, tenant_id=hotel_id)
        self.db.add(db_category)
        self.db.commit()
        self.db.refresh(db_category)
        db_category.amenities = db_category.amenities.split(",") if db_category.amenities else []
        return db_category

    def get_rooms(self, hotel_id: UUID) -> list[Room]:
        return self.db.query(Room).filter(Room.tenant_id == hotel_id).all()

    def create_room(self, hotel_id: UUID, payload: RoomCreate) -> Room:
        check_room_limit(self.db, hotel_id, adding=1)

        category = (
            self.db.query(RoomCategory)
            .filter(RoomCategory.id == payload.category_id, RoomCategory.tenant_id == hotel_id)
            .first()
        )
        if not category:
            raise HTTPException(status_code=400, detail="Invalid Category ID")

        building = (
            self.db.query(Building)
            .filter(Building.id == payload.building_id, Building.tenant_id == hotel_id)
            .first()
        )
        if not building:
            raise HTTPException(status_code=400, detail="Invalid Building ID")

        db_room = Room(**payload.model_dump(), tenant_id=hotel_id)
        self.db.add(db_room)
        self.db.commit()
        self.db.refresh(db_room)
        return db_room

    def create_rooms_batch(self, hotel_id: UUID, rooms: list[RoomCreate]) -> list[Room]:
        check_room_limit(self.db, hotel_id, adding=len(rooms))

        created_rooms: list[Room] = []
        for room in rooms:
            exists = (
                room.id
                and self.db.query(Room).filter(Room.id == room.id, Room.tenant_id == hotel_id).first()
            )
            if exists:
                continue

            db_room = Room(**room.model_dump(), tenant_id=hotel_id)
            self.db.add(db_room)
            created_rooms.append(db_room)

        try:
            self.db.commit()
            for db_room in created_rooms:
                self.db.refresh(db_room)
            return created_rooms
        except Exception as exc:
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Batch Create Failed: {exc}") from exc

    def update_room(self, hotel_id: UUID, room_id: str, payload: RoomUpdate) -> Room:
        db_room = self.db.query(Room).filter(Room.id == room_id, Room.tenant_id == hotel_id).first()
        if not db_room:
            raise HTTPException(status_code=404, detail="Room not found")

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(db_room, key, value)
        self.db.commit()
        self.db.refresh(db_room)
        return db_room

    def delete_room(self, hotel_id: UUID, room_id: str) -> None:
        db_room = self.db.query(Room).filter(Room.id == room_id, Room.tenant_id == hotel_id).first()
        if not db_room:
            raise HTTPException(status_code=404, detail="Room not found")
        self.db.delete(db_room)
        self.db.commit()
