"""
Plan-based limit enforcement utilities for tenant-scoped resources.
"""

from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.auth import Tenant
from app.models.plan import Plan
from app.models.role import Role
from app.models.user import User
from app.models.room import Room


def _get_plan_for_hotel(db: Session, hotel_id: UUID) -> Plan | None:
    """Look up the Plan row matching the hotel's plan string."""
    hotel = db.query(Tenant).filter(Tenant.id == hotel_id).first()
    if not hotel:
        return None
    return hotel.subscribed_plan


def check_role_limit(db: Session, hotel_id: UUID) -> None:
    """Raise 403 if adding another role would exceed the plan limit."""
    plan = _get_plan_for_hotel(db, hotel_id)
    if not plan:
        return  # no plan found — allow (graceful fallback)

    current_count = (
        db.query(func.count(Role.id)).filter(Role.tenant_id == hotel_id).scalar() or 0
    )
    if current_count >= plan.max_roles:
        raise HTTPException(
            status_code=403,
            detail=f"Role limit reached ({plan.max_roles}) for your {plan.name} plan. Upgrade to add more roles.",
        )


def check_user_limit(db: Session, hotel_id: UUID) -> None:
    """Raise 403 if adding another user would exceed the plan limit."""
    plan = _get_plan_for_hotel(db, hotel_id)
    if not plan:
        return

    current_count = (
        db.query(func.count(User.id)).filter(User.tenant_id == hotel_id).scalar() or 0
    )
    if current_count >= plan.max_users:
        raise HTTPException(
            status_code=403,
            detail=f"User limit reached ({plan.max_users}) for your {plan.name} plan. Upgrade to add more users.",
        )


def check_room_limit(db: Session, hotel_id: UUID, adding: int = 1) -> None:
    """Raise 403 if adding rooms would exceed the plan limit."""
    plan = _get_plan_for_hotel(db, hotel_id)
    if not plan:
        return

    current_count = (
        db.query(func.count(Room.id)).filter(Room.tenant_id == hotel_id).scalar() or 0
    )
    if current_count + adding > plan.rooms:
        raise HTTPException(
            status_code=403,
            detail=f"Room limit reached ({plan.rooms}) for your {plan.name} plan. Current: {current_count}, Attempting to add: {adding}.",
        )
