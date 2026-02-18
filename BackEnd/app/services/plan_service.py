from __future__ import annotations

import logging
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.hotel import Hotel
from app.models.plan import Plan
from app.schemas.plan import PlanCreate, PlanUpdate


logger = logging.getLogger(__name__)


class PlanService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Plan]:
        plans = self.db.query(Plan).all()
        counts = self.db.query(Hotel.plan_id, func.count(Hotel.id)).group_by(Hotel.plan_id).all()
        counts_dict = {plan_id: count for plan_id, count in counts}
        for plan in plans:
            plan.subscribers = counts_dict.get(plan.id, 0)
        return plans

    def get_by_id(self, plan_id: UUID) -> Plan:
        plan = self.db.query(Plan).filter(Plan.id == plan_id).first()
        if not plan:
            raise HTTPException(status_code=404, detail="Plan not found")

        subscribers = (
            self.db.query(func.count(Hotel.id)).filter(Hotel.plan_id == plan.id).scalar() or 0
        )
        plan.subscribers = subscribers
        return plan

    def create(self, payload: PlanCreate) -> Plan:
        try:
            plan = Plan(**payload.model_dump())
            self.db.add(plan)
            self.db.commit()
            self.db.refresh(plan)
            return plan
        except Exception as exc:
            logger.exception("Failed to create plan")
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Plan creation failed: {exc}") from exc

    def update(self, plan_id: UUID, payload: PlanUpdate) -> Plan:
        db_plan = self.db.query(Plan).filter(Plan.id == plan_id).first()
        if not db_plan:
            raise HTTPException(status_code=404, detail="Plan not found")

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(db_plan, key, value)

        self.db.commit()
        self.db.refresh(db_plan)
        return db_plan

    def delete(self, plan_id: UUID) -> None:
        db_plan = self.db.query(Plan).filter(Plan.id == plan_id).first()
        if not db_plan:
            raise HTTPException(status_code=404, detail="Plan not found")

        self.db.delete(db_plan)
        self.db.commit()
