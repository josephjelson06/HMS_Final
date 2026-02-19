from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.billing import Plan
from app.schemas.billing import PlanRead


class PlanService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> List[Plan]:
        return self.db.query(Plan).all()

    def get_by_id(self, plan_id: UUID) -> Optional[Plan]:
        return self.db.query(Plan).filter(Plan.id == plan_id).first()
