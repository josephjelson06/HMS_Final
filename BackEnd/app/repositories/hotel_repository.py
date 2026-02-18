from sqlalchemy.orm import Session
from typing import List, Optional, Any, Dict
from uuid import UUID
from app.models.hotel import Hotel as HotelModel


class HotelRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[HotelModel]:
        return self.db.query(HotelModel).offset(skip).limit(limit).all()

    def get_by_id(self, hotel_id: UUID) -> Optional[HotelModel]:
        return self.db.query(HotelModel).filter(HotelModel.id == hotel_id).first()

    def create(self, hotel: HotelModel) -> HotelModel:
        self.db.add(hotel)
        self.db.commit()
        self.db.refresh(hotel)
        return hotel

    def update(
        self, hotel_id: UUID, hotel_data: Dict[str, Any]
    ) -> Optional[HotelModel]:
        db_hotel = self.get_by_id(hotel_id)
        if not db_hotel:
            return None

        for key, value in hotel_data.items():
            setattr(db_hotel, key, value)

        self.db.add(db_hotel)
        self.db.commit()
        self.db.refresh(db_hotel)
        return db_hotel

    def delete(self, hotel_id: UUID) -> bool:
        db_hotel = self.get_by_id(hotel_id)
        if not db_hotel:
            return False

        self.db.delete(db_hotel)
        self.db.commit()
        return True
