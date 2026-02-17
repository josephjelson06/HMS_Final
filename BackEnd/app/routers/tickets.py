from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.ticket import Ticket
from app.schemas.ticket import (
    TicketCreate,
    TicketResponse,
    TicketUpdate,
    AdminTicketResponse,
)
from app.models.hotel import Hotel
from app.modules.rbac import require_permission

router = APIRouter(prefix="/api", tags=["tickets"])

# Hotel-side endpoints


@router.post("/hotels/{hotel_id}/tickets", response_model=TicketResponse)
def create_ticket(hotel_id: UUID, ticket: TicketCreate, db: Session = Depends(get_db)):
    # Verify hotel exists
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    db_ticket = Ticket(**ticket.model_dump(), tenant_id=hotel_id)
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


@router.get("/hotels/{hotel_id}/tickets", response_model=List[TicketResponse])
def get_hotel_tickets(hotel_id: UUID, db: Session = Depends(get_db)):
    return db.query(Ticket).filter(Ticket.tenant_id == hotel_id).all()


# Admin-side endpoints


@router.get(
    "/tickets",
    response_model=List[AdminTicketResponse],
    dependencies=[Depends(require_permission("platform:tickets:read"))],
)
def get_all_tickets(db: Session = Depends(get_db)):
    tickets = db.query(Ticket).all()
    # Enrich with hotel name
    for ticket in tickets:
        if ticket.tenant:
            ticket.hotel_name = ticket.tenant.name
    return tickets


@router.put(
    "/tickets/{ticket_id}",
    response_model=TicketResponse,
    dependencies=[Depends(require_permission("platform:tickets:write"))],
)
def update_ticket(
    ticket_id: UUID, ticket_data: TicketUpdate, db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    update_data = ticket_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(ticket, key, value)

    db.commit()
    db.refresh(ticket)
    return ticket
