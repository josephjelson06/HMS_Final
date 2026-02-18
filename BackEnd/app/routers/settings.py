from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.rbac import require_permission
from app.schemas.hotel import Hotel as HotelSchema, HotelUpdate
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/api", tags=["settings"])


@router.get(
    "/settings/",
    response_model=HotelSchema,
    dependencies=[Depends(require_permission("platform:settings:read"))],
)
def get_platform_settings(db: Session = Depends(get_db)):
    return SettingsService(db).get_platform_settings()


@router.put(
    "/settings/",
    response_model=HotelSchema,
    dependencies=[Depends(require_permission("platform:settings:write"))],
)
def update_platform_settings(settings: HotelUpdate, db: Session = Depends(get_db)):
    return SettingsService(db).update_platform_settings(payload=settings)


@router.get(
    "/hotels/{hotel_id}/settings",
    response_model=HotelSchema,
    dependencies=[Depends(require_permission("hotel:settings:read"))],
)
def get_hotel_settings(hotel_id: UUID, db: Session = Depends(get_db)):
    return SettingsService(db).get_hotel_settings(hotel_id=hotel_id)


@router.put(
    "/hotels/{hotel_id}/settings",
    response_model=HotelSchema,
    dependencies=[Depends(require_permission("hotel:settings:write"))],
)
def update_hotel_settings(hotel_id: UUID, settings: HotelUpdate, db: Session = Depends(get_db)):
    return SettingsService(db).update_hotel_settings(hotel_id=hotel_id, payload=settings)
