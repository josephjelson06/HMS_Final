from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.hotel import Hotel
from app.schemas.hotel import Hotel as HotelSchema, HotelUpdate
from typing import Optional

router = APIRouter()

# --- Platform Settings (Stored as Platform Tenant in Hotels table) ---


@router.get("/", response_model=HotelSchema)
def get_platform_settings(db: Session = Depends(get_db)):
    # Find the tenant with tenant_type='platform'
    # In older seed logic, this was skipped, but new seed logic creates it.
    # Alternatively, we can find by tenant_key='platform' or id=0 if we forced it.
    # Best reliable way: tenant_type='platform'
    platform = db.query(Hotel).filter(Hotel.tenant_type == "platform").first()

    if not platform:
        # Fallback for dev/seed issues: Create on the fly or 404
        # Let's return 404 to encourage proper seeding
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Platform settings not initialized. Please run seed script.",
        )
    return platform


@router.put("/", response_model=HotelSchema)
def update_platform_settings(settings: HotelUpdate, db: Session = Depends(get_db)):
    platform = db.query(Hotel).filter(Hotel.tenant_type == "platform").first()

    if not platform:
        raise HTTPException(status_code=404, detail="Platform settings not found")

    # Update allowed fields
    if settings.name:
        platform.name = settings.name
    if settings.gstin:
        platform.gstin = settings.gstin
    if settings.pan:
        platform.pan = settings.pan
    if settings.address:
        platform.address = settings.address
    if settings.email:
        platform.email = settings.email
    if settings.mobile:
        platform.mobile = settings.mobile

    db.commit()
    db.refresh(platform)
    return platform
