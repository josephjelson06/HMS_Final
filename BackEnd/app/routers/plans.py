from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.billing import PlanRead
from app.services.plan_service import PlanService

router = APIRouter(prefix="/api/plans", tags=["Plans"])


@router.get("", response_model=List[PlanRead])
def get_plans(
    db: Session = Depends(get_db),
):
    service = PlanService(db)
    return service.get_all()
