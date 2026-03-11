from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
import os
import shutil
import datetime
from decimal import Decimal
from fastapi import UploadFile, HTTPException, status

from app.models.tenant import Tenant, TenantConfig
from app.models.room import RoomType
from app.models.booking import Booking
from app.models.billing import Subscription, Plan
from app.schemas.tenant import TenantCreate
from app.utils.cloudinary_upload import (
    upload_room_images,
    delete_room_image,
    CloudinaryUploadError,
)


class TenantService:
    def __init__(self, db: Session):
        self.db = db

    def _generate_readable_id(self) -> str:
        count = self.db.query(Tenant).count()
        return f"HTL-{count + 1:04d}"

    def _populate_names(self, tenant: Tenant):
        # This is a bit of a hack to satisfy the Pydantic schema if not using joins
        if tenant.plan_id:
            plan = self.db.query(Plan).filter(Plan.id == tenant.plan_id).first()
            if plan:
                tenant.plan_name = plan.name

        if tenant.owner_user_id:
            from app.models.tenant import TenantUser

            owner = (
                self.db.query(TenantUser)
                .filter(TenantUser.id == tenant.owner_user_id)
                .first()
            )
            if owner:
                tenant.owner_name = owner.name
        return tenant

    def get_all(
        self, skip: int = 0, limit: int = 100, q: Optional[str] = None
    ) -> List[Tenant]:
        query = self.db.query(Tenant)
        if q:
            term = f"%{q}%"
            query = query.filter(
                or_(
                    Tenant.hotel_name.ilike(term),
                    Tenant.gstin.ilike(term),
                    Tenant.readable_id.ilike(term),
                )
            )
        tenants = query.offset(skip).limit(limit).all()
        for t in tenants:
            self._populate_names(t)
        return tenants

    def get_by_id(self, tenant_id: UUID) -> Optional[Tenant]:
        tenant = self.db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if tenant:
            self._populate_names(tenant)
        return tenant

    def get_config(self, tenant_id: UUID) -> Optional[TenantConfig]:
        return (
            self.db.query(TenantConfig)
            .filter(TenantConfig.tenant_id == tenant_id)
            .first()
        )

    def get_rooms(self, tenant_id: UUID) -> List[RoomType]:
        return self.db.query(RoomType).filter(RoomType.tenant_id == tenant_id).all()

    def create_room(
        self,
        tenant_id: UUID,
        name: str,
        code: str,
        price: Decimal,
        amenities: Optional[List[str]] = None,
        images: Optional[List[UploadFile]] = None,
    ) -> RoomType:
        tenant = self.get_by_id(tenant_id)
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found",
            )

        images = images or []
        if len(images) > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 5 images are allowed per room.",
            )

        image_urls: List[str] = []
        if images:
            try:
                image_urls = upload_room_images(images, str(tenant_id))
            except CloudinaryUploadError as exc:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=str(exc),
                ) from exc

        room = RoomType(
            tenant_id=tenant_id,
            name=name,
            code=code,
            price=price,
            amenities=amenities or [],
            image_urls=image_urls,
        )
        self.db.add(room)
        self.db.commit()
        self.db.refresh(room)
        return room

    def update_room(
        self,
        tenant_id: UUID,
        room_type_id: UUID,
        name: str,
        code: str,
        price: Decimal,
        amenities: Optional[List[str]] = None,
        images: Optional[List[UploadFile]] = None,
    ) -> RoomType:
        room = (
            self.db.query(RoomType)
            .filter(RoomType.id == room_type_id, RoomType.tenant_id == tenant_id)
            .first()
        )
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room type not found",
            )

        images = images or []
        existing_urls = room.image_urls or []

        if len(existing_urls) + len(images) > 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum 5 images are allowed per room.",
            )

        new_urls: List[str] = []
        if images:
            try:
                new_urls = upload_room_images(images, str(tenant_id))
            except CloudinaryUploadError as exc:
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=str(exc),
                ) from exc

        room.name = name
        room.code = code
        room.price = price
        room.amenities = amenities or []
        if new_urls:
            room.image_urls = [*existing_urls, *new_urls]

        self.db.commit()
        self.db.refresh(room)
        return room

    def delete_room(self, tenant_id: UUID, room_type_id: UUID) -> int:
        room = (
            self.db.query(RoomType)
            .filter(RoomType.id == room_type_id, RoomType.tenant_id == tenant_id)
            .first()
        )
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room type not found",
            )

        try:
            # Remove dependent bookings first because bookings.room_type_id uses FK RESTRICT.
            deleted_bookings = (
                self.db.query(Booking)
                .filter(Booking.room_type_id == room_type_id)
                .delete(synchronize_session=False)
            )
            self.db.delete(room)
            self.db.commit()
            return int(deleted_bookings or 0)
        except IntegrityError as exc:
            self.db.rollback()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Unable to delete room type due to linked records.",
            ) from exc

    def delete_room_image(
        self, tenant_id: UUID, room_type_id: UUID, image_url: str
    ) -> RoomType:
        room = (
            self.db.query(RoomType)
            .filter(RoomType.id == room_type_id, RoomType.tenant_id == tenant_id)
            .first()
        )
        if not room:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room type not found",
            )

        current_urls = room.image_urls or []
        if image_url not in current_urls:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found for this room type.",
            )

        try:
            delete_room_image(image_url)
        except CloudinaryUploadError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=str(exc),
            ) from exc

        room.image_urls = [url for url in current_urls if url != image_url]
        self.db.commit()
        self.db.refresh(room)
        return room

    def get_bookings(self, tenant_id: UUID) -> List[Booking]:
        return (
            self.db.query(Booking)
            .filter(Booking.tenant_id == tenant_id)
            .order_by(Booking.created_at.desc())
            .all()
        )

    def create(self, payload: TenantCreate) -> Tenant:
        from app.models.tenant import TenantRole, TenantUser
        from app.models.permissions import Permission
        from app.models.mappings import tenant_role_permissions
        from app.core.auth.security import get_password_hash

        data = payload.model_dump()
        owner_name = data.pop("owner_name", None)
        owner_email = data.pop("owner_email", None)
        owner_phone = data.pop("owner_phone", None)

        slug = (
            data.get("hotel_name", "hotel").lower().replace(" ", "-")
            + "-"
            + str(os.urandom(4).hex())
        )

        readable_id = data.get("readable_id") or self._generate_readable_id()
        tenant = Tenant(**data, slug=slug, readable_id=readable_id)
        self.db.add(tenant)
        self.db.flush()  # Get tenant.id

        # Automatically create initial subscription
        plan_id = data.get("plan_id")
        if not plan_id:
            default_plan = self.db.query(Plan).first()
            if default_plan:
                plan_id = default_plan.id

        if plan_id:
            sub = Subscription(
                tenant_id=tenant.id,
                plan_id=plan_id,
                start_date=datetime.datetime.utcnow(),
                end_date=datetime.datetime.utcnow() + datetime.timedelta(days=30),
                status="active",
            )
            self.db.add(sub)

        # Create General Manager Role
        mgr_role = TenantRole(
            tenant_id=tenant.id,
            name="General Manager",
            status=True,
        )
        self.db.add(mgr_role)
        self.db.flush()

        # Assign hotel permissions
        hotel_perms = (
            self.db.query(Permission).filter(Permission.key.like("hotel:%")).all()
        )
        for perm in hotel_perms:
            self.db.execute(
                tenant_role_permissions.insert().values(
                    role_id=mgr_role.id, permission_id=perm.id
                )
            )

        # Create GM User
        if owner_email and owner_name:
            mgr_user = TenantUser(
                tenant_id=tenant.id,
                email=owner_email,
                name=owner_name,
                phone=owner_phone,
                password_hash=get_password_hash("manager123"),
                role_id=mgr_role.id,
            )
            self.db.add(mgr_user)
            self.db.flush()

            # Link owner
            tenant.owner_user_id = mgr_user.id

        self.db.commit()
        self.db.refresh(tenant)
        return tenant

    def update(self, tenant_id: UUID, payload: dict) -> Optional[Tenant]:
        tenant = self.get_by_id(tenant_id)
        if not tenant:
            return None

        for k, v in payload.items():
            setattr(tenant, k, v)

        self.db.commit()
        self.db.refresh(tenant)
        return tenant

    def delete(self, tenant_id: UUID) -> bool:
        tenant = self.get_by_id(tenant_id)
        if not tenant:
            return False

        self.db.delete(tenant)
        self.db.commit()
        return True

    def upload_images(
        self, tenant_id: UUID, images: List[UploadFile]
    ) -> Optional[Tenant]:
        tenant = self.get_by_id(tenant_id)
        if not tenant:
            return None

        upload_dir = f"uploads/tenants/{tenant_id}"
        os.makedirs(upload_dir, exist_ok=True)

        for i, idx in enumerate(range(1, 4)):
            if i < len(images) and images[i].filename:
                file = images[i]
                ext = file.filename.split(".")[-1]
                filename = f"image_{idx}.{ext}"
                filepath = os.path.join(upload_dir, filename)

                with open(filepath, "wb") as buffer:
                    shutil.copyfileobj(file.file, buffer)

                url_path = f"/uploads/tenants/{tenant_id}/{filename}"
                setattr(tenant, f"image_url_{idx}", url_path)

        self.db.commit()
        self.db.refresh(tenant)
        return tenant
