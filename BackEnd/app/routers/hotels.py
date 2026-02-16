from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.hotel import Hotel, HotelCreate, HotelUpdate
from app.repositories.hotel_repository import HotelRepository

router = APIRouter(
    prefix="/api/hotels",
    tags=["hotels"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=List[Hotel])
def read_hotels(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    repo = HotelRepository(db)
    return repo.get_all(skip=skip, limit=limit)


@router.get("/{hotel_id}", response_model=Hotel)
def read_hotel(hotel_id: int, db: Session = Depends(get_db)):
    repo = HotelRepository(db)
    hotel = repo.get_by_id(hotel_id)
    if hotel is None:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


@router.post("/", response_model=Hotel, status_code=status.HTTP_201_CREATED)
def create_hotel(hotel: HotelCreate, db: Session = Depends(get_db)):
    # Extract kiosk details if present
    kiosks_data = hotel.kiosks_details

    # Create hotel record
    repo = HotelRepository(db)
    new_hotel = repo.create(hotel)

    # If there are kiosk details, create them
    if kiosks_data:
        from app.models.kiosk import Kiosk

        for k_data in kiosks_data:
            new_kiosk = Kiosk(
                serial_number=k_data.serial_number,
                location=k_data.location,
                hotel_id=new_hotel.id,
            )
            db.add(new_kiosk)

        # Update the kiosk count to match the actual number of details provided
        # This ensures consistency if the UI sent a count that differs from the array length
        new_hotel.kiosks = len(kiosks_data)
        db.commit()
        db.refresh(new_hotel)

    return new_hotel


@router.patch("/{hotel_id}", response_model=Hotel)
def update_hotel(hotel_id: int, hotel: HotelUpdate, db: Session = Depends(get_db)):
    repo = HotelRepository(db)
    updated_hotel = repo.update(hotel_id, hotel)
    if updated_hotel is None:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return updated_hotel


@router.delete("/{hotel_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_hotel(hotel_id: int, db: Session = Depends(get_db)):
    repo = HotelRepository(db)
    success = repo.delete(hotel_id)
    if not success:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return None
