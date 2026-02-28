from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.tenant import TenantRead, TenantCreate
from app.schemas.kiosk import KioskRoomTypeRead, KioskBookingRead
from app.services.tenant_service import TenantService
from app.modules.rbac import require_permission

router = APIRouter(prefix="/api/tenants", tags=["Tenants"])


@router.get("", response_model=List[TenantRead])
def get_tenants(
    skip: int = 0,
    limit: int = 100,
    q: str = None,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:tenants:read")),
):
    service = TenantService(db)
    return service.get_all(skip, limit, q)


@router.get("/{tenant_id}", response_model=TenantRead)
def get_tenant(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:tenants:read")),
):
    service = TenantService(db)
    tenant = service.get_by_id(tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.get("/{tenant_id}/rooms", response_model=List[KioskRoomTypeRead])
def get_tenant_rooms(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:read")),
):
    service = TenantService(db)
    return service.get_rooms(tenant_id)


@router.get("/{tenant_id}/bookings", response_model=List[KioskBookingRead])
def get_tenant_bookings(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:bookings:read")),
):
    service = TenantService(db)
    return service.get_bookings(tenant_id)


@router.post("", response_model=TenantRead)
def create_tenant(
    payload: TenantCreate,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:tenants:write")),
):
    service = TenantService(db)
    return service.create(payload)


@router.patch("/{tenant_id}", response_model=TenantRead)
def update_tenant(
    tenant_id: UUID,
    payload: dict,  # Using dict for partial update simplicity for now
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:tenants:write")),
):
    service = TenantService(db)
    tenant = service.update(tenant_id, payload)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant


@router.delete("/{tenant_id}")
def delete_tenant(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:tenants:write")),
):
    service = TenantService(db)
    success = service.delete(tenant_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {"message": "Tenant deleted"}


@router.post("/{tenant_id}/images", response_model=TenantRead)
def upload_tenant_images(
    tenant_id: UUID,
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    _=Depends(require_permission("platform:tenants:write")),
):
    service = TenantService(db)
    tenant = service.upload_images(tenant_id, images)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant
