from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.plan import Plan as PlanSchema, PlanCreate, PlanUpdate
from app.services.plan_service import PlanService

router = APIRouter(prefix="/api/plans", tags=["plans"])


@router.get(
    "/",
    response_model=List[PlanSchema],
    dependencies=[Depends(require_permission("platform:plans:read"))],
)
def get_all_plans(db: Session = Depends(get_db)):
    return PlanService(db).get_all()


@router.post(
    "/",
    response_model=PlanSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("platform:plans:write"))],
)
def create_plan(plan: PlanCreate, db: Session = Depends(get_db)):
    return PlanService(db).create(plan)


@router.patch(
    "/{plan_id}",
    response_model=PlanSchema,
    dependencies=[Depends(require_permission("platform:plans:write"))],
)
def update_plan(plan_id: UUID, plan_update: PlanUpdate, db: Session = Depends(get_db)):
    return PlanService(db).update(plan_id=plan_id, payload=plan_update)


@router.delete(
    "/{plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("platform:plans:write"))],
)
def delete_plan(plan_id: UUID, db: Session = Depends(get_db)):
    PlanService(db).delete(plan_id=plan_id)
    return None
