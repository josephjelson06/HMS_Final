from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.invoice import Invoice as InvoiceSchema, InvoiceCreate, InvoiceUpdate
from app.schemas.subscription import Subscription, SubscriptionUpdate
from app.services.subscription_service import SubscriptionService

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


@router.get(
    "/",
    response_model=List[Subscription],
    dependencies=[Depends(require_permission("platform:subscriptions:read"))],
)
def get_all_subscriptions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return SubscriptionService(db).get_all_subscriptions(skip=skip, limit=limit)


@router.patch(
    "/{hotel_id}",
    response_model=Subscription,
    dependencies=[Depends(require_permission("platform:subscriptions:write"))],
)
def update_subscription(hotel_id: UUID, section: SubscriptionUpdate, db: Session = Depends(get_db)):
    return SubscriptionService(db).update_subscription(hotel_id=hotel_id, payload=section)


@router.get(
    "/invoices",
    response_model=List[InvoiceSchema],
    dependencies=[Depends(require_permission("platform:invoices:read"))],
)
def get_all_invoices(db: Session = Depends(get_db)):
    return SubscriptionService(db).get_all_invoices()


@router.get(
    "/invoices/by-id/{invoice_id}",
    response_model=InvoiceSchema,
    dependencies=[Depends(require_permission("platform:invoices:read"))],
)
def get_invoice_by_id(invoice_id: UUID, db: Session = Depends(get_db)):
    return SubscriptionService(db).get_invoice_by_id(invoice_id=invoice_id)


@router.post(
    "/invoices",
    response_model=InvoiceSchema,
    dependencies=[Depends(require_permission("platform:invoices:write"))],
)
def create_invoice(data: InvoiceCreate, db: Session = Depends(get_db)):
    return SubscriptionService(db).create_invoice(payload=data)


@router.patch(
    "/invoices/{invoice_id}",
    response_model=InvoiceSchema,
    dependencies=[Depends(require_permission("platform:invoices:write"))],
)
def update_invoice(invoice_id: UUID, data: InvoiceUpdate, db: Session = Depends(get_db)):
    return SubscriptionService(db).update_invoice(invoice_id=invoice_id, payload=data)


@router.get("/invoices/{hotel_id}", response_model=List[InvoiceSchema])
def get_hotel_invoices(hotel_id: UUID, db: Session = Depends(get_db)):
    return SubscriptionService(db).get_hotel_invoices(hotel_id=hotel_id)


@router.delete(
    "/invoices/{invoice_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("platform:invoices:write"))],
)
def delete_invoice(invoice_id: UUID, db: Session = Depends(get_db)):
    SubscriptionService(db).delete_invoice(invoice_id=invoice_id)
    return None
