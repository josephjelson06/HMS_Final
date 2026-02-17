from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from app.models.hotel import Hotel as HotelModel
from app.models.plan import Plan
from app.schemas.hotel import HotelCreate, HotelUpdate


class HotelRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[HotelModel]:
        return self.db.query(HotelModel).offset(skip).limit(limit).all()

    def get_by_id(self, hotel_id: UUID) -> Optional[HotelModel]:
        return self.db.query(HotelModel).filter(HotelModel.id == hotel_id).first()

    def create(self, hotel_in: HotelCreate) -> HotelModel:
        hotel_data = hotel_in.model_dump()

        # Handle plan string -> ID resolution
        plan_name = hotel_data.pop("plan", "Starter")
        plan = self.db.query(Plan).filter(Plan.name == plan_name).first()
        if not plan:
            # Fallback to Starter if requested plan not found
            plan = self.db.query(Plan).filter(Plan.name == "Starter").first()

        if not plan:
            # If even Starter is missing, we have a seed issue, but handle gracefully-ish?
            # We can't create tenant without plan_id (NOT NULL).
            # Raise error.
            raise ValueError(
                f"Plan '{plan_name}' (or default 'Starter') not found in database."
            )

        hotel_data["plan_id"] = plan.id

        if "kiosks_details" in hotel_data:
            del hotel_data["kiosks_details"]
        db_hotel = HotelModel(**hotel_data)
        self.db.add(db_hotel)
        self.db.commit()
        self.db.refresh(db_hotel)
        return db_hotel

    def update(self, hotel_id: UUID, hotel_in: HotelUpdate) -> Optional[HotelModel]:
        db_hotel = self.get_by_id(hotel_id)
        if not db_hotel:
            return None

        update_data = hotel_in.model_dump(exclude_unset=True)

        # Handle plan update
        if "plan" in update_data:
            plan_name = update_data.pop("plan")
            if plan_name:
                plan = self.db.query(Plan).filter(Plan.name == plan_name).first()
                if plan:
                    update_data["plan_id"] = plan.id

        for key, value in update_data.items():
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
