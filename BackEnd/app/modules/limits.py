from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.hotel import Hotel
from app.models.plan import Plan
from app.models.role import Role
from app.models.room import Room
from app.models.user import User


def _load_plan_for_hotel(db: Session, hotel_id: UUID) -> Plan:
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if hotel is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hotel not found")

    plan = db.query(Plan).filter(Plan.id == hotel.plan_id).first()
    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Hotel is not linked to a valid plan",
        )
    return plan


def check_user_limit(db: Session, hotel_id: UUID) -> None:
    plan = _load_plan_for_hotel(db, hotel_id)
    if plan.max_users is None:
        return

    current_users = db.query(User).filter(User.tenant_id == hotel_id).count()
    if current_users >= plan.max_users:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User limit reached for current plan ({plan.max_users})",
        )


def check_role_limit(db: Session, hotel_id: UUID) -> None:
    plan = _load_plan_for_hotel(db, hotel_id)
    if plan.max_roles is None:
        return

    current_roles = db.query(Role).filter(Role.tenant_id == hotel_id).count()
    if current_roles >= plan.max_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Role limit reached for current plan ({plan.max_roles})",
        )


def check_room_limit(db: Session, hotel_id: UUID, adding: int = 1) -> None:
    plan = _load_plan_for_hotel(db, hotel_id)
    if plan.rooms is None:
        return

    current_rooms = db.query(Room).filter(Room.tenant_id == hotel_id).count()
    if current_rooms + adding > plan.rooms:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Room limit reached for current plan ({plan.rooms})",
        )
