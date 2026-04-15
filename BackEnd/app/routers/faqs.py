from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.faq import FAQCreate, FAQRead, FAQUpdate
from app.services.faq_service import FAQService

router = APIRouter(tags=["FAQs"])


@router.get("/api/hotels/{hotel_id}/faqs", response_model=list[FAQRead])
def get_faqs(
    hotel_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:config:read")),
):
    service = FAQService(db)
    return service.get_by_tenant(hotel_id)


@router.post("/api/hotels/{hotel_id}/faqs", response_model=FAQRead)
def create_faq(
    hotel_id: UUID,
    payload: FAQCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:config:write")),
):
    service = FAQService(db)
    return service.create(hotel_id, payload)


@router.put("/api/hotels/{hotel_id}/faqs/{faq_id}", response_model=FAQRead)
def update_faq(
    hotel_id: UUID,
    faq_id: UUID,
    payload: FAQUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:config:write")),
):
    service = FAQService(db)
    faq = service.update(hotel_id, faq_id, payload)
    if not faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    return faq


@router.delete("/api/hotels/{hotel_id}/faqs/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faq(
    hotel_id: UUID,
    faq_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:config:write")),
):
    service = FAQService(db)
    if not service.delete(hotel_id, faq_id):
        raise HTTPException(status_code=404, detail="FAQ not found")
    return None
