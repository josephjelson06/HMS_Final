from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.hotel import Hotel
from app.models.invoice import Invoice
from app.schemas.subscription import Subscription, SubscriptionUpdate
from app.schemas.invoice import Invoice as InvoiceSchema, InvoiceUpdate, InvoiceCreate
from app.modules.rbac import require_permission
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/subscriptions", tags=["subscriptions"])


@router.get(
    "/",
    response_model=List[Subscription],
    dependencies=[Depends(require_permission("platform:subscriptions:read"))],
)
def get_all_subscriptions(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    hotels = db.query(Hotel).offset(skip).limit(limit).all()
    subscriptions = []

    for hotel in hotels:
        # Determine status based on dates
        hotel_status = getattr(hotel, "status", "Active")
        final_status = "Active"
        if hotel_status == "Suspended":
            final_status = "Suspended"
        elif hotel_status == "Past Due":
            final_status = "Expired"

        subscriptions.append(
            Subscription(
                id=str(hotel.id),
                hotel_id=hotel.id,
                hotel=hotel.name,
                plan=hotel.plan,
                startDate=hotel.subscription_start_date
                or datetime.utcnow().isoformat(),
                renewalDate=hotel.subscription_end_date
                or (datetime.utcnow() + timedelta(days=30)).isoformat(),
                status=final_status,
                autoRenew=bool(hotel.is_auto_renew),
                price=hotel.mrr,
            )
        )

    return subscriptions


@router.patch(
    "/{hotel_id}",
    response_model=Subscription,
    dependencies=[Depends(require_permission("platform:subscriptions:write"))],
)
def update_subscription(
    hotel_id: UUID, section: SubscriptionUpdate, db: Session = Depends(get_db)
):
    try:
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")

        if section.plan:
            # Plan is a property, so we must find the plan_id
            from app.models.plan import Plan

            sys_plan = db.query(Plan).filter(Plan.name == section.plan).first()
            if not sys_plan:
                raise HTTPException(
                    status_code=400, detail=f"Plan '{section.plan}' not found"
                )
            hotel.plan_id = sys_plan.id

        if section.is_auto_renew is not None:
            hotel.is_auto_renew = 1 if section.is_auto_renew else 0
        if section.subscription_end_date:
            hotel.subscription_end_date = section.subscription_end_date
        if section.mrr is not None:
            hotel.mrr = section.mrr

        # Create Invoice if amount is provided
        if section.invoice_amount:
            new_invoice = Invoice(
                tenant_id=hotel.id,
                amount=section.invoice_amount,
                status=section.invoice_status or "Pending",
                period_start=datetime.utcnow().isoformat(),
                period_end=section.subscription_end_date
                or (datetime.utcnow() + timedelta(days=30)).isoformat(),
                generated_on=datetime.utcnow().isoformat(),
                due_date=(datetime.utcnow() + timedelta(days=7)).isoformat(),
            )
            db.add(new_invoice)

        db.commit()
        db.refresh(hotel)

        return Subscription(
            id=str(hotel.id),
            hotel_id=hotel.id,
            hotel=hotel.name,
            plan=hotel.plan,
            startDate=hotel.subscription_start_date,
            renewalDate=hotel.subscription_end_date,
            status=getattr(hotel, "status", "Active"),
            autoRenew=bool(hotel.is_auto_renew),
            price=hotel.mrr,
        )
    except Exception as e:
        import traceback

        traceback.print_exc()
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Update failed: {str(e)}")


@router.get(
    "/invoices",
    response_model=List[InvoiceSchema],
    dependencies=[Depends(require_permission("platform:invoices:read"))],
)
def get_all_invoices(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).all()
    result = []
    for inv in invoices:
        hotel_name = inv.tenant.name if inv.tenant else "Unknown Hotel"

        try:
            date_obj = datetime.fromisoformat(inv.generated_on)
        except (ValueError, TypeError):
            date_obj = datetime.utcnow()

        # For UUID, we'll just use a shorter string or prefix
        formatted_number = f"INV-{date_obj.year}-{str(inv.id)[:8].upper()}"

        inv_data = InvoiceSchema.model_validate(inv)
        inv_data.hotel_name = hotel_name
        inv_data.invoice_number = formatted_number
        result.append(inv_data)
    return result


@router.post(
    "/invoices",
    response_model=InvoiceSchema,
    dependencies=[Depends(require_permission("platform:invoices:write"))],
)
def create_invoice(data: InvoiceCreate, db: Session = Depends(get_db)):
    try:
        # Check if hotel exists
        hotel = db.query(Hotel).filter(Hotel.id == data.hotel_id).first()
        if not hotel:
            raise HTTPException(status_code=404, detail="Hotel not found")

        new_invoice = Invoice(
            tenant_id=data.hotel_id,
            amount=data.amount,
            status=data.status or "Pending",
            period_start=data.period_start,
            period_end=data.period_end,
            generated_on=datetime.utcnow().isoformat(),
            due_date=data.due_date,
        )
        db.add(new_invoice)
        db.commit()
        db.refresh(new_invoice)

        # Map to schema
        hotel_name = hotel.name
        try:
            date_obj = datetime.fromisoformat(new_invoice.generated_on)
        except (ValueError, TypeError):
            date_obj = datetime.utcnow()
        formatted_number = f"INV-{date_obj.year}-{str(new_invoice.id)[:8].upper()}"

        inv_data = InvoiceSchema.model_validate(new_invoice)
        inv_data.hotel_name = hotel_name
        inv_data.invoice_number = formatted_number
        return inv_data
    except Exception as e:
        import traceback

        traceback.print_exc()
        db.rollback()
        raise HTTPException(
            status_code=400, detail=f"Invoice creation failed: {str(e)}"
        )


@router.patch(
    "/invoices/{invoice_id}",
    response_model=InvoiceSchema,
    dependencies=[Depends(require_permission("platform:invoices:write"))],
)
def update_invoice(
    invoice_id: UUID, data: InvoiceUpdate, db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    if data.status:
        invoice.status = data.status
    if data.amount is not None:
        invoice.amount = data.amount
    if data.due_date:
        invoice.due_date = data.due_date

    db.commit()
    db.refresh(invoice)

    hotel_name = invoice.tenant.name if invoice.tenant else "Unknown Hotel"
    try:
        date_obj = datetime.fromisoformat(invoice.generated_on)
    except (ValueError, TypeError):
        date_obj = datetime.utcnow()
    formatted_number = f"INV-{date_obj.year}-{str(invoice.id)[:8].upper()}"

    inv_data = InvoiceSchema.model_validate(invoice)
    inv_data.hotel_name = hotel_name
    inv_data.invoice_number = formatted_number
    return inv_data


@router.get("/invoices/{hotel_id}", response_model=List[InvoiceSchema])
def get_hotel_invoices(hotel_id: UUID, db: Session = Depends(get_db)):
    invoices = db.query(Invoice).filter(Invoice.tenant_id == hotel_id).all()
    result = []
    for inv in invoices:
        hotel_name = inv.tenant.name if inv.tenant else "Unknown Hotel"

        try:
            date_obj = datetime.fromisoformat(inv.generated_on)
        except ValueError:
            date_obj = datetime.utcnow()

        formatted_number = (
            f"INV-{date_obj.year}-{date_obj.month:02d}-{str(inv.id)[:8].upper()}"
        )

        inv_data = InvoiceSchema.model_validate(inv)
        inv_data.hotel_name = hotel_name
        inv_data.invoice_number = formatted_number
        result.append(inv_data)
    return result


@router.delete(
    "/invoices/{invoice_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("platform:invoices:write"))],
)
def delete_invoice(invoice_id: UUID, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    db.delete(invoice)
    db.commit()
    return None
