from uuid import UUID
from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.tenant import TenantRead, TenantCreate, TenantConfigRead
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


@router.post("/{tenant_id}/rooms", response_model=KioskRoomTypeRead)
def create_tenant_room(
    tenant_id: UUID,
    name: str = Form(...),
    code: str = Form(...),
    price: Decimal = Form(...),
    max_adults: int = Form(2),
    max_children: int = Form(0),
    max_childeren: int | None = Form(None),
    amenities: List[str] | None = Form(None),
    images: List[UploadFile] | None = File(None),
    image_metadata: str | None = Form(None),
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:write")),
):
    service = TenantService(db)
    effective_max_children = max_childeren if max_childeren is not None else max_children
    return service.create_room(
        tenant_id=tenant_id,
        name=name,
        code=code,
        price=price,
        max_adults=max_adults,
        max_children=effective_max_children,
        amenities=amenities or [],
        images=images or [],
        image_metadata=service._parse_image_metadata_json(image_metadata, "image_metadata"),
    )


@router.put("/{tenant_id}/rooms/{room_type_id}", response_model=KioskRoomTypeRead)
def update_tenant_room(
    tenant_id: UUID,
    room_type_id: UUID,
    name: str = Form(...),
    code: str = Form(...),
    price: Decimal = Form(...),
    max_adults: int | None = Form(None),
    max_children: int | None = Form(None),
    max_childeren: int | None = Form(None),
    amenities: List[str] | None = Form(None),
    images: List[UploadFile] | None = File(None),
    existing_images: str | None = Form(None),
    new_image_metadata: str | None = Form(None),
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:write")),
):
    service = TenantService(db)
    effective_max_children = (
        max_childeren
        if max_childeren is not None
        else max_children
    )
    return service.update_room(
        tenant_id=tenant_id,
        room_type_id=room_type_id,
        name=name,
        code=code,
        price=price,
        max_adults=max_adults,
        max_children=effective_max_children,
        amenities=amenities or [],
        images=images or [],
        existing_image_metadata=service._parse_image_metadata_json(
            existing_images, "existing_images"
        ),
        new_image_metadata=service._parse_image_metadata_json(
            new_image_metadata, "new_image_metadata"
        ),
    )


@router.delete("/{tenant_id}/rooms/{room_type_id}")
def delete_tenant_room(
    tenant_id: UUID,
    room_type_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:write")),
):
    service = TenantService(db)
    deleted_bookings = service.delete_room(tenant_id=tenant_id, room_type_id=room_type_id)
    return {"message": "Room type deleted", "deleted_bookings": deleted_bookings}


@router.delete(
    "/{tenant_id}/rooms/{room_type_id}/images/{image_id}",
    response_model=KioskRoomTypeRead,
)
def delete_tenant_room_image(
    tenant_id: UUID,
    room_type_id: UUID,
    image_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:rooms:write")),
):
    service = TenantService(db)
    return service.delete_room_image(
        tenant_id=tenant_id,
        room_type_id=room_type_id,
        image_id=image_id,
    )


@router.get("/{tenant_id}/bookings", response_model=List[KioskBookingRead])
def get_tenant_bookings(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:bookings:read")),
):
    service = TenantService(db)
    return service.get_bookings(tenant_id)


@router.get("/{tenant_id}/config", response_model=TenantConfigRead)
def get_tenant_config(
    tenant_id: UUID,
    db: Session = Depends(get_db),
    _=Depends(require_permission("hotel:config:read")),
):
    service = TenantService(db)
    config = service.get_config(tenant_id)
    if not config:
        raise HTTPException(status_code=404, detail="Tenant config not found")
    return config


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
