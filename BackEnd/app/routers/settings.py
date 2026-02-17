from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.hotel import Hotel
from app.schemas.hotel import Hotel as HotelSchema, HotelUpdate
from app.modules.rbac import require_permission

router = APIRouter(prefix="/api", tags=["settings"])


# ── Platform Settings (admin only) ───────────────────────────────


@router.get(
    "/settings/",
    response_model=HotelSchema,
    dependencies=[Depends(require_permission("platform:settings:read"))],
)
def get_platform_settings(db: Session = Depends(get_db)):
    """Platform admin: returns the platform tenant record."""
    platform = db.query(Hotel).filter(Hotel.tenant_type == "platform").first()
    if not platform:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Platform settings not initialized. Please run seed script.",
        )
    return platform


@router.put(
    "/settings/",
    response_model=HotelSchema,
    dependencies=[Depends(require_permission("platform:settings:write"))],
)
def update_platform_settings(settings: HotelUpdate, db: Session = Depends(get_db)):
    """Platform admin: update platform settings."""
    platform = db.query(Hotel).filter(Hotel.tenant_type == "platform").first()
    if not platform:
        raise HTTPException(status_code=404, detail="Platform settings not found")

    for key, value in settings.model_dump(exclude_unset=True).items():
        if hasattr(platform, key):
            setattr(platform, key, value)

    db.commit()
    db.refresh(platform)
    return platform


# ── Hotel Settings (hotel managers only) ──────────────────────────


@router.get(
    "/hotels/{hotel_id}/settings",
    response_model=HotelSchema,
    dependencies=[Depends(require_permission("hotel:settings:read"))],
)
def get_hotel_settings(hotel_id: UUID, db: Session = Depends(get_db)):
    """Hotel manager: returns this hotel's tenant record for settings."""
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


@router.put(
    "/hotels/{hotel_id}/settings",
    response_model=HotelSchema,
    dependencies=[Depends(require_permission("hotel:settings:write"))],
)
def update_hotel_settings(
    hotel_id: UUID, settings: HotelUpdate, db: Session = Depends(get_db)
):
    """Hotel manager: update their own hotel settings."""
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")

    for key, value in settings.model_dump(exclude_unset=True).items():
        if hasattr(hotel, key):
            setattr(hotel, key, value)

    db.commit()
    db.refresh(hotel)
    return hotel
