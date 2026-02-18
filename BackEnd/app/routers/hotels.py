import logging
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.hotel import Hotel, HotelCreate, HotelUpdate
from app.services.hotel_service import HotelService
from app.modules.rbac import require_permission

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/hotels",
    tags=["hotels"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "/",
    response_model=List[Hotel],
    dependencies=[Depends(require_permission("platform:hotels:read"))],
)
def read_hotels(
    skip: int = 0,
    limit: int = 100,
    q: Optional[str] = None,
    db: Session = Depends(get_db),
):
    service = HotelService(db)
    return service.get_all(skip=skip, limit=limit, q=q)


@router.get("/{hotel_id}", response_model=Hotel)
def read_hotel(hotel_id: UUID, db: Session = Depends(get_db)):
    service = HotelService(db)
    hotel = service.get_by_id(hotel_id)
    if hotel is None:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


@router.post(
    "/",
    response_model=Hotel,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_permission("platform:hotels:write"))],
)
def create_hotel(hotel: HotelCreate, db: Session = Depends(get_db)):
    try:
        service = HotelService(db)
        return service.create_hotel_with_defaults(hotel)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception("Failed to create hotel")
        raise HTTPException(status_code=400, detail=f"Creation failed: {str(e)}")


@router.patch("/{hotel_id}", response_model=Hotel)
def update_hotel(hotel_id: UUID, hotel: HotelUpdate, db: Session = Depends(get_db)):
    service = HotelService(db)
    updated_hotel = service.update(hotel_id, hotel)
    if updated_hotel is None:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return updated_hotel


@router.delete(
    "/{hotel_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_permission("platform:hotels:write"))],
)
def delete_hotel(hotel_id: UUID, db: Session = Depends(get_db)):
    service = HotelService(db)
    success = service.delete(hotel_id)
    if not success:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return None
