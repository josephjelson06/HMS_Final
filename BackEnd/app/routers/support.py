from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.support import SupportTicketRead, SupportTicketCreate
from app.services.support_service import SupportService
from app.modules.rbac import require_permission

router = APIRouter(tags=["Support"])


@router.get(
    "/api/hotels/{hotel_id}/support/tickets", response_model=List[SupportTicketRead]
)
def get_tickets(
    hotel_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:support:read")),
):
    service = SupportService(db)
    return service.get_by_tenant(hotel_id)


@router.post("/api/hotels/{hotel_id}/support/tickets", response_model=SupportTicketRead)
def create_ticket(
    hotel_id: UUID,
    payload: SupportTicketCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:support:write")),
):
    service = SupportService(db)
    return service.create(hotel_id, payload)
