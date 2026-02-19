from uuid import UUID
from typing import List
from sqlalchemy.orm import Session

from app.models.support import SupportTicket
from app.schemas.support import SupportTicketCreate


class SupportService:
    def __init__(self, db: Session):
        self.db = db

    def get_by_tenant(self, tenant_id: UUID) -> List[SupportTicket]:
        return (
            self.db.query(SupportTicket)
            .filter(SupportTicket.tenant_id == tenant_id)
            .all()
        )

    def create(self, tenant_id: UUID, payload: SupportTicketCreate) -> SupportTicket:
        ticket = SupportTicket(
            **payload.model_dump(), tenant_id=tenant_id, status="open"
        )
        self.db.add(ticket)
        self.db.commit()
        self.db.refresh(ticket)
        return ticket
