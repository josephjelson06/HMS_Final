from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.hotel import Hotel as HotelModel
from app.schemas.hotel import HotelCreate, HotelUpdate


class HotelRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[HotelModel]:
        return self.db.query(HotelModel).offset(skip).limit(limit).all()

    def get_by_id(self, hotel_id: int) -> Optional[HotelModel]:
        return self.db.query(HotelModel).filter(HotelModel.id == hotel_id).first()

    def create(self, hotel_in: HotelCreate) -> HotelModel:
        hotel_data = hotel_in.model_dump()
        if "kiosks_details" in hotel_data:
            del hotel_data["kiosks_details"]
        db_hotel = HotelModel(**hotel_data)
        self.db.add(db_hotel)
        self.db.commit()
        self.db.refresh(db_hotel)
        return db_hotel

    def update(self, hotel_id: int, hotel_in: HotelUpdate) -> Optional[HotelModel]:
        db_hotel = self.get_by_id(hotel_id)
        if not db_hotel:
            return None

        update_data = hotel_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_hotel, key, value)

        self.db.add(db_hotel)
        self.db.commit()
        self.db.refresh(db_hotel)
        return db_hotel

    def delete(self, hotel_id: int) -> bool:
        db_hotel = self.get_by_id(hotel_id)
        if not db_hotel:
            return False

        self.db.delete(db_hotel)
        self.db.commit()
        return True
