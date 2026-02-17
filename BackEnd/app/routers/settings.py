from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.hotel import Hotel
from app.schemas.hotel import Hotel as HotelSchema, HotelUpdate
from app.modules.rbac import require_permission

router = APIRouter(prefix="/api/settings", tags=["settings"])

# --- Platform Settings (Stored as Platform Tenant in Hotels table) ---


@router.get(
    "/",
    response_model=HotelSchema,
    dependencies=[Depends(require_permission("platform:settings:read"))],
)
def get_platform_settings(db: Session = Depends(get_db)):
    # Find the tenant with tenant_type='platform'
    platform = db.query(Hotel).filter(Hotel.tenant_type == "platform").first()

    if not platform:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Platform settings not initialized. Please run seed script.",
        )
    return platform


@router.put(
    "/",
    response_model=HotelSchema,
    dependencies=[Depends(require_permission("platform:settings:write"))],
)
def update_platform_settings(settings: HotelUpdate, db: Session = Depends(get_db)):
    platform = db.query(Hotel).filter(Hotel.tenant_type == "platform").first()

    if not platform:
        raise HTTPException(status_code=404, detail="Platform settings not found")

    # Update allowed fields
    update_data = settings.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if hasattr(platform, key):
            setattr(platform, key, value)

    db.commit()
    db.refresh(platform)
    return platform
