from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.hotel import Hotel
from app.models.invoice import Invoice
from app.schemas.subscription import Subscription, SubscriptionUpdate
from app.schemas.invoice import Invoice as InvoiceSchema, InvoiceUpdate, InvoiceCreate
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/", response_model=List[Subscription])
def get_all_subscriptions(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    hotels = db.query(Hotel).offset(skip).limit(limit).all()
    subscriptions = []

    for hotel in hotels:
        # Determine status based on dates
        status = "Active"
        if hotel.status == "Suspended":
            status = "Suspended"
        elif hotel.status == "Past Due":
            status = "Expired"

        # logic to determine "Expiring Soon" could be added here

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
                status=status,
                autoRenew=bool(hotel.is_auto_renew),
                price=hotel.mrr,
            )
        )

    return subscriptions


@router.patch("/{hotel_id}", response_model=Subscription)
def update_subscription(
    hotel_id: int, section: SubscriptionUpdate, db: Session = Depends(get_db)
):
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    print(f"DEBUG: Updating hotel {hotel_id} with {section}")
    if section.plan:
        print(f"DEBUG: Changing plan from {hotel.plan} to {section.plan}")
        hotel.plan = section.plan
    if section.is_auto_renew is not None:
        hotel.is_auto_renew = 1 if section.is_auto_renew else 0
    if section.subscription_end_date:
        hotel.subscription_end_date = section.subscription_end_date
    if section.mrr is not None:
        print(f"DEBUG: Changing MRR from {hotel.mrr} to {section.mrr}")
        hotel.mrr = section.mrr

    # Create Invoice if amount is provided
    if section.invoice_amount:
        new_invoice = Invoice(
            hotel_id=hotel.id,
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

    print(
        f"DEBUG: Post-commit state for hotel {hotel_id}: Plan={hotel.plan}, MRR={hotel.mrr}, Renew={hotel.is_auto_renew}"
    )

    return Subscription(
        id=str(hotel.id),
        hotel_id=hotel.id,
        hotel=hotel.name,
        plan=hotel.plan,
        startDate=hotel.subscription_start_date,
        renewalDate=hotel.subscription_end_date,
        status=hotel.status,  # Simplified mapping
        autoRenew=bool(hotel.is_auto_renew),
        price=hotel.mrr,
    )


@router.get("/invoices", response_model=List[InvoiceSchema])
def get_all_invoices(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).all()
    # Map to schema with hotel name and formatted number
    result = []
    for inv in invoices:
        hotel_name = inv.hotel.name if inv.hotel else "Unknown Hotel"

        # Format: INV-YYYY-ID (compact)
        try:
            date_obj = datetime.fromisoformat(inv.generated_on)
        except (ValueError, TypeError):
            date_obj = datetime.utcnow()

        formatted_number = f"INV-{date_obj.year}-{inv.id:04d}"

        inv_data = InvoiceSchema.from_orm(inv)
        inv_data.hotel_name = hotel_name
        inv_data.invoice_number = formatted_number
        result.append(inv_data)
    return result


@router.post("/invoices", response_model=InvoiceSchema)
def create_invoice(data: InvoiceCreate, db: Session = Depends(get_db)):
    # Check if hotel exists
    hotel = db.query(Hotel).filter(Hotel.id == data.hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    new_invoice = Invoice(
        hotel_id=data.hotel_id,
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

    # Map to schema with hotel name and formatted number
    hotel_name = hotel.name
    try:
        date_obj = datetime.fromisoformat(new_invoice.generated_on)
    except (ValueError, TypeError):
        date_obj = datetime.utcnow()
    formatted_number = f"INV-{date_obj.year}-{new_invoice.id:04d}"

    inv_data = InvoiceSchema.from_orm(new_invoice)
    inv_data.hotel_name = hotel_name
    inv_data.invoice_number = formatted_number
    return inv_data


@router.patch("/invoices/{invoice_id}", response_model=InvoiceSchema)
def update_invoice(invoice_id: int, data: InvoiceUpdate, db: Session = Depends(get_db)):
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

    # Map to schema with hotel name and formatted number
    hotel_name = invoice.hotel.name if invoice.hotel else "Unknown Hotel"
    try:
        date_obj = datetime.fromisoformat(invoice.generated_on)
    except (ValueError, TypeError):
        date_obj = datetime.utcnow()
    formatted_number = f"INV-{date_obj.year}-{invoice.id:04d}"

    inv_data = InvoiceSchema.from_orm(invoice)
    inv_data.hotel_name = hotel_name
    inv_data.invoice_number = formatted_number
    return inv_data


@router.get("/invoices/{hotel_id}", response_model=List[InvoiceSchema])
def get_hotel_invoices(hotel_id: int, db: Session = Depends(get_db)):
    invoices = db.query(Invoice).filter(Invoice.hotel_id == hotel_id).all()
    # Map to schema with hotel name and formatted number
    result = []
    for inv in invoices:
        hotel_name = inv.hotel.name if inv.hotel else "Unknown Hotel"

        # Format: INV-YYYY-MM-{ID}
        # e.g., INV-2026-02-005102
        try:
            date_obj = datetime.fromisoformat(inv.generated_on)
        except ValueError:
            date_obj = datetime.utcnow()

        formatted_number = f"INV-{date_obj.year}-{date_obj.month:02d}-{inv.id:06d}"

        inv_data = InvoiceSchema.from_orm(inv)
        inv_data.hotel_name = hotel_name
        inv_data.invoice_number = formatted_number
        result.append(inv_data)
    return result


@router.delete("/invoices/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    db.delete(invoice)
    db.commit()
    return {"detail": "Invoice deleted"}
