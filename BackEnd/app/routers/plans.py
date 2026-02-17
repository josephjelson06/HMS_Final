from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.plan import Plan
from app.schemas.plan import Plan as PlanSchema, PlanCreate, PlanUpdate
from app.models.hotel import Hotel
from sqlalchemy import func
from app.modules.rbac import require_permission

router = APIRouter(prefix="/api/plans", tags=["plans"])


@router.get(
    "/",
    response_model=List[PlanSchema],
    dependencies=[Depends(require_permission("platform:plans:read"))],
)
def get_all_plans(db: Session = Depends(get_db)):
    # Get all plans
    plans = db.query(Plan).all()

    # Get hotel counts grouped by plan_id
    # Hotel is Tenant, so it has plan_id
    counts = db.query(Hotel.plan_id, func.count(Hotel.id)).group_by(Hotel.plan_id).all()
    # counts is list of (plan_id, count)
    counts_dict = {pid: count for pid, count in counts}

    # Set subscribers field dynamically
    for plan in plans:
        plan.subscribers = counts_dict.get(plan.id, 0)

    return plans


@router.post(
    "/",
    response_model=PlanSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("platform:plans:write"))],
)
def create_plan(plan: PlanCreate, db: Session = Depends(get_db)):
    try:
        # plan.model_dump() is safe now that subscribers is removed from PlanCreate
        db_plan = Plan(**plan.model_dump())
        db.add(db_plan)
        db.commit()
        db.refresh(db_plan)
        # Default subscribers is 0
        return db_plan
    except Exception as e:
        import traceback

        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Plan creation failed: {str(e)}")


@router.patch(
    "/{plan_id}",
    response_model=PlanSchema,
    dependencies=[Depends(require_permission("platform:plans:write"))],
)
def update_plan(plan_id: UUID, plan_update: PlanUpdate, db: Session = Depends(get_db)):
    db_plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    update_data = plan_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_plan, key, value)

    db.commit()
    db.refresh(db_plan)
    return db_plan


@router.delete(
    "/{plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("platform:plans:write"))],
)
def delete_plan(plan_id: UUID, db: Session = Depends(get_db)):
    db_plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not db_plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    db.delete(db_plan)
    db.commit()
    return None
