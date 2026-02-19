from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.billing import SubscriptionRead
from app.services.subscription_service import SubscriptionService
from app.modules.rbac import require_permission

router = APIRouter(tags=["Subscriptions"])


@router.get("/api/hotels/{hotel_id}/subscription", response_model=SubscriptionRead)
def get_subscription(
    hotel_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:billing:read")),
):
    service = SubscriptionService(db)
    sub = service.get_by_tenant(hotel_id)
    if not sub:
        raise HTTPException(status_code=404, detail="No active subscription found")
    return sub
