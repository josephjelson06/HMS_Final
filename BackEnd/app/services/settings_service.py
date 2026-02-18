from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.hotel import Hotel
from app.models.plan import Plan
from app.schemas.hotel import HotelUpdate


class SettingsService:
    def __init__(self, db: Session):
        self.db = db

    def get_platform_settings(self) -> Hotel:
        platform = self.db.query(Hotel).filter(Hotel.tenant_type == "platform").first()
        if not platform:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Platform settings not initialized. Please bootstrap manually.",
            )
        return platform

    def update_platform_settings(self, payload: HotelUpdate) -> Hotel:
        platform = self.db.query(Hotel).filter(Hotel.tenant_type == "platform").first()
        if not platform:
            raise HTTPException(status_code=404, detail="Platform settings not found")

        update_data = payload.model_dump(exclude_unset=True)
        plan_name = update_data.pop("plan", None)
        if plan_name:
            plan = self.db.query(Plan).filter(Plan.name == plan_name).first()
            if not plan:
                raise HTTPException(status_code=400, detail=f"Plan '{plan_name}' not found")
            platform.plan_id = plan.id

        for key, value in update_data.items():
            if hasattr(platform, key):
                setattr(platform, key, value)

        self.db.commit()
        self.db.refresh(platform)
        return platform

    def get_hotel_settings(self, hotel_id: UUID) -> Hotel:
        hotel = self.db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")
        return hotel

    def update_hotel_settings(self, hotel_id: UUID, payload: HotelUpdate) -> Hotel:
        hotel = self.db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")

        update_data = payload.model_dump(exclude_unset=True)
        plan_name = update_data.pop("plan", None)
        if plan_name:
            plan = self.db.query(Plan).filter(Plan.name == plan_name).first()
            if not plan:
                raise HTTPException(status_code=400, detail=f"Plan '{plan_name}' not found")
            hotel.plan_id = plan.id

        for key, value in update_data.items():
            if hasattr(hotel, key):
                setattr(hotel, key, value)

        self.db.commit()
        self.db.refresh(hotel)
        return hotel
