from __future__ import annotations

import logging
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.hotel import Hotel
from app.models.invoice import Invoice
from app.models.plan import Plan
from app.schemas.invoice import InvoiceCreate, InvoiceUpdate
from app.schemas.subscription import Subscription, SubscriptionUpdate


logger = logging.getLogger(__name__)


class SubscriptionService:
    def __init__(self, db: Session):
        self.db = db

    @staticmethod
    def _invoice_number(invoice: Invoice, with_month: bool = False) -> str:
        try:
            date_obj = datetime.fromisoformat(invoice.generated_on)
        except (ValueError, TypeError):
            date_obj = datetime.utcnow()
        if with_month:
            return f"INV-{date_obj.year}-{date_obj.month:02d}-{str(invoice.id)[:8].upper()}"
        return f"INV-{date_obj.year}-{str(invoice.id)[:8].upper()}"

    def get_all_subscriptions(self, skip: int = 0, limit: int = 100) -> list[Subscription]:
        hotels = self.db.query(Hotel).offset(skip).limit(limit).all()
        subscriptions: list[Subscription] = []

        for hotel in hotels:
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
                    startDate=hotel.subscription_start_date or datetime.utcnow().isoformat(),
                    renewalDate=hotel.subscription_end_date
                    or (datetime.utcnow() + timedelta(days=30)).isoformat(),
                    status=final_status,
                    autoRenew=bool(hotel.is_auto_renew),
                    price=hotel.mrr,
                )
            )

        return subscriptions

    def update_subscription(self, hotel_id: UUID, payload: SubscriptionUpdate) -> Subscription:
        try:
            hotel = self.db.query(Hotel).filter(Hotel.id == hotel_id).first()
            if not hotel:
                raise HTTPException(status_code=404, detail="Hotel not found")

            if payload.plan:
                plan = self.db.query(Plan).filter(Plan.name == payload.plan).first()
                if not plan:
                    raise HTTPException(status_code=400, detail=f"Plan '{payload.plan}' not found")
                hotel.plan_id = plan.id

            if payload.is_auto_renew is not None:
                hotel.is_auto_renew = 1 if payload.is_auto_renew else 0
            if payload.subscription_end_date:
                hotel.subscription_end_date = payload.subscription_end_date
            if payload.mrr is not None:
                hotel.mrr = payload.mrr

            if payload.invoice_amount:
                self.db.add(
                    Invoice(
                        tenant_id=hotel.id,
                        amount=payload.invoice_amount,
                        status=payload.invoice_status or "Pending",
                        period_start=datetime.utcnow().isoformat(),
                        period_end=payload.subscription_end_date
                        or (datetime.utcnow() + timedelta(days=30)).isoformat(),
                        generated_on=datetime.utcnow().isoformat(),
                        due_date=(datetime.utcnow() + timedelta(days=7)).isoformat(),
                    )
                )

            self.db.commit()
            self.db.refresh(hotel)

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
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            logger.exception("Failed to update subscription for hotel %s", hotel_id)
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Update failed: {exc}") from exc

    def get_all_invoices(self):
        invoices = self.db.query(Invoice).all()
        result = []
        from app.schemas.invoice import Invoice as InvoiceSchema

        for invoice in invoices:
            validated = InvoiceSchema.model_validate(invoice)
            validated.hotel_name = invoice.tenant.name if invoice.tenant else "Unknown Hotel"
            validated.invoice_number = self._invoice_number(invoice)
            result.append(validated)
        return result

    def get_invoice_by_id(self, invoice_id: UUID):
        invoice = self.db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        from app.schemas.invoice import Invoice as InvoiceSchema

        validated = InvoiceSchema.model_validate(invoice)
        validated.hotel_name = invoice.tenant.name if invoice.tenant else "Unknown Hotel"
        validated.invoice_number = self._invoice_number(invoice)
        return validated

    def create_invoice(self, payload: InvoiceCreate):
        try:
            hotel = self.db.query(Hotel).filter(Hotel.id == payload.hotel_id).first()
            if not hotel:
                raise HTTPException(status_code=404, detail="Hotel not found")

            new_invoice = Invoice(
                tenant_id=payload.hotel_id,
                amount=payload.amount,
                status=payload.status or "Pending",
                period_start=payload.period_start,
                period_end=payload.period_end,
                generated_on=datetime.utcnow().isoformat(),
                due_date=payload.due_date,
            )
            self.db.add(new_invoice)
            self.db.commit()
            self.db.refresh(new_invoice)

            from app.schemas.invoice import Invoice as InvoiceSchema

            validated = InvoiceSchema.model_validate(new_invoice)
            validated.hotel_name = hotel.name
            validated.invoice_number = self._invoice_number(new_invoice)
            return validated
        except HTTPException:
            self.db.rollback()
            raise
        except Exception as exc:
            logger.exception("Failed to create invoice for hotel %s", payload.hotel_id)
            self.db.rollback()
            raise HTTPException(status_code=400, detail=f"Invoice creation failed: {exc}") from exc

    def update_invoice(self, invoice_id: UUID, payload: InvoiceUpdate):
        invoice = self.db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")

        if payload.status:
            invoice.status = payload.status
        if payload.amount is not None:
            invoice.amount = payload.amount
        if payload.due_date:
            invoice.due_date = payload.due_date

        self.db.commit()
        self.db.refresh(invoice)

        from app.schemas.invoice import Invoice as InvoiceSchema

        validated = InvoiceSchema.model_validate(invoice)
        validated.hotel_name = invoice.tenant.name if invoice.tenant else "Unknown Hotel"
        validated.invoice_number = self._invoice_number(invoice)
        return validated

    def get_hotel_invoices(self, hotel_id: UUID):
        invoices = self.db.query(Invoice).filter(Invoice.tenant_id == hotel_id).all()
        result = []
        from app.schemas.invoice import Invoice as InvoiceSchema

        for invoice in invoices:
            validated = InvoiceSchema.model_validate(invoice)
            validated.hotel_name = invoice.tenant.name if invoice.tenant else "Unknown Hotel"
            validated.invoice_number = self._invoice_number(invoice, with_month=True)
            result.append(validated)
        return result

    def delete_invoice(self, invoice_id: UUID) -> None:
        invoice = self.db.query(Invoice).filter(Invoice.id == invoice_id).first()
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        self.db.delete(invoice)
        self.db.commit()
