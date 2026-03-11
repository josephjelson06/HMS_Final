from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.faq import FAQ
from app.schemas.faq import FAQCreate, FAQUpdate


class FAQService:
    def __init__(self, db: Session):
        self.db = db

    def get_by_tenant(self, tenant_id: UUID) -> list[FAQ]:
        return (
            self.db.query(FAQ)
            .filter(FAQ.tenant_id == tenant_id)
            .order_by(FAQ.created_at.desc())
            .all()
        )

    def create(self, tenant_id: UUID, payload: FAQCreate) -> FAQ:
        faq = FAQ(tenant_id=tenant_id, **payload.model_dump())
        self.db.add(faq)
        self.db.commit()
        self.db.refresh(faq)
        return faq

    def update(self, tenant_id: UUID, faq_id: UUID, payload: FAQUpdate) -> FAQ | None:
        faq = (
            self.db.query(FAQ)
            .filter(FAQ.id == faq_id, FAQ.tenant_id == tenant_id)
            .first()
        )
        if not faq:
            return None

        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(faq, key, value)
        faq.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(faq)
        return faq

    def delete(self, tenant_id: UUID, faq_id: UUID) -> bool:
        faq = (
            self.db.query(FAQ)
            .filter(FAQ.id == faq_id, FAQ.tenant_id == tenant_id)
            .first()
        )
        if not faq:
            return False
        self.db.delete(faq)
        self.db.commit()
        return True
