from uuid import UUID
from typing import Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
import os
import shutil
import datetime
import json
from decimal import Decimal
from fastapi import UploadFile, HTTPException, status

from app.models.tenant import Tenant, TenantConfig
from app.models.room import RoomCategory, RoomImage, RoomType
from app.models.booking import Booking
from app.models.billing import Subscription, Plan
from app.schemas.room import RoomCategoryCreate, RoomCategoryUpdate
from app.schemas.tenant import TenantCreate
from app.services.tenant_config_defaults import build_default_tenant_config
from app.utils.cloudinary_upload import (
    upload_room_images,
    upload_room_category_images,
    delete_room_image,
    CloudinaryUploadError,
)


class TenantService:
    def __init__(self, db: Session):
        self.db = db

    CATEGORY_IMAGE_LIMIT = 3

    def _ordered_room_images(self, room: RoomType) -> List[RoomImage]:
        return sorted(
            list(room.images or []),
            key=lambda image: (image.display_order, image.created_at or datetime.datetime.min),
        )

    def _sync_room_image_urls(self, room: RoomType) -> RoomType:
        room.image_urls = [image.url for image in self._ordered_room_images(room)]
        return room

    def _parse_image_metadata_json(
        self, raw_value: Optional[str], field_name: str
    ) -> List[dict[str, Any]]:
        if not raw_value:
            return []

        try:
            parsed = json.loads(raw_value)
        except json.JSONDecodeError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid {field_name} payload.",
            ) from exc

        if not isinstance(parsed, list):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{field_name} must be a JSON array.",
            )
        return [item for item in parsed if isinstance(item, dict)]

    def _normalize_image_metadata(
        self,
        payload: dict[str, Any],
        *,
        fallback_order: int,
        default_primary: bool = False,
    ) -> dict[str, Any]:
        raw_tags = payload.get("tags") or []
        if not isinstance(raw_tags, list):
            raw_tags = []

        normalized_tags: List[str] = []
        for tag in raw_tags:
            tag_value = str(tag).strip().lower()
            if not tag_value:
                continue
            if tag_value not in normalized_tags:
                normalized_tags.append(tag_value)

        caption = payload.get("caption")
        category = payload.get("category")
        display_order = payload.get("display_order", fallback_order)

        try:
            display_order = int(display_order)
        except (TypeError, ValueError):
            display_order = fallback_order

        return {
            "caption": str(caption).strip() if caption else None,
            "category": str(category).strip().lower() if category else None,
            "display_order": max(display_order, 0),
            "tags": normalized_tags,
            "is_primary": bool(payload.get("is_primary", default_primary)),
        }

    def _ensure_single_primary(self, room: RoomType) -> None:
        ordered_images = self._ordered_room_images(room)
        primary_found = False
        for image in ordered_images:
            if image.is_primary and not primary_found:
                primary_found = True
                continue
            if image.is_primary and primary_found:
                image.is_primary = False

        if ordered_images and not primary_found:
            ordered_images[0].is_primary = True

    def _create_room_images(
        self,
        room: RoomType,
        image_urls: List[str],
        metadata_payload: List[dict[str, Any]],
    ) -> None:
        next_order = len(room.images or [])
        for index, image_url in enumerate(image_urls):
            normalized = self._normalize_image_metadata(
                metadata_payload[index] if index < len(metadata_payload) else {},
                fallback_order=next_order + index,
                default_primary=(next_order + index) == 0,
            )
            room.images.append(
                RoomImage(
                    url=image_url,
                    caption=normalized["caption"],
                    category=normalized["category"],
                    display_order=normalized["display_order"],
                    tags=normalized["tags"],
                    is_primary=normalized["is_primary"],
                )
            )

        self._ensure_single_primary(room)
        self._sync_room_image_urls(room)

    def _update_existing_room_images(
        self, room: RoomType, metadata_payload: List[dict[str, Any]]
    ) -> None:
        if not metadata_payload:
            self._ensure_single_primary(room)
            self._sync_room_image_urls(room)
            return

        image_map = {str(image.id): image for image in room.images or []}
        for index, payload in enumerate(metadata_payload):
            image_id = payload.get("id")
            if not image_id:
                continue
            image = image_map.get(str(image_id))
            if not image:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Room image {image_id} not found.",
                )

            normalized = self._normalize_image_metadata(
                payload,
                fallback_order=index,
                default_primary=image.is_primary,
            )
            image.caption = normalized["caption"]
            image.category = normalized["category"]
            image.display_order = normalized["display_order"]
            image.tags = normalized["tags"]
            image.is_primary = normalized["is_primary"]
            image.updated_at = datetime.datetime.utcnow()

        self._ensure_single_primary(room)
        self._sync_room_image_urls(room)

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
        rooms = self.db.query(RoomType).filter(RoomType.tenant_id == tenant_id).all()
        for room in rooms:
            self._sync_room_image_urls(room)
        return rooms

    def _validate_room_category(
        self, tenant_id: UUID, category_id: Optional[UUID]
    ) -> Optional[RoomCategory]:
        if category_id is None:
            return None

        category = (
            self.db.query(RoomCategory)
            .filter(
                RoomCategory.id == category_id,
                RoomCategory.tenant_id == tenant_id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room category not found",
            )
        return category

    def get_room_categories(self, tenant_id: UUID) -> List[RoomCategory]:
        return (
            self.db.query(RoomCategory)
            .filter(RoomCategory.tenant_id == tenant_id)
            .order_by(RoomCategory.display_order.asc(), RoomCategory.name.asc())
            .all()
        )

    def create_room_category(
        self, tenant_id: UUID, payload: RoomCategoryCreate
    ) -> RoomCategory:
        tenant = self.get_by_id(tenant_id)
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found",
            )

        normalized_image_urls = [
            str(url).strip() for url in (payload.image_urls or []) if str(url).strip()
        ]
        if len(normalized_image_urls) > self.CATEGORY_IMAGE_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum {self.CATEGORY_IMAGE_LIMIT} images are allowed per room category.",
            )

        category = RoomCategory(
            tenant_id=tenant_id,
            name=payload.name.strip(),
            description=payload.description.strip() if payload.description else None,
            image_urls=normalized_image_urls,
            display_order=int(payload.display_order or 0),
        )
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category

    def update_room_category(
        self, tenant_id: UUID, category_id: UUID, payload: RoomCategoryUpdate
    ) -> RoomCategory:
        category = (
            self.db.query(RoomCategory)
            .filter(
                RoomCategory.id == category_id,
                RoomCategory.tenant_id == tenant_id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room category not found",
            )

        updates = payload.model_dump(exclude_unset=True)
        if "name" in updates and updates["name"] is not None:
            updates["name"] = updates["name"].strip()
        if "description" in updates:
            raw_description = updates["description"]
            updates["description"] = raw_description.strip() if raw_description else None
        if "image_urls" in updates and updates["image_urls"] is not None:
            normalized_image_urls = [
                str(url).strip() for url in updates["image_urls"] if str(url).strip()
            ]
            if len(normalized_image_urls) > self.CATEGORY_IMAGE_LIMIT:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Maximum {self.CATEGORY_IMAGE_LIMIT} images are allowed per room category."
                    ),
                )
            updates["image_urls"] = normalized_image_urls

        for key, value in updates.items():
            setattr(category, key, value)

        self.db.commit()
        self.db.refresh(category)
        return category

    def delete_room_category(self, tenant_id: UUID, category_id: UUID) -> None:
        category = (
            self.db.query(RoomCategory)
            .filter(
                RoomCategory.id == category_id,
                RoomCategory.tenant_id == tenant_id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room category not found",
            )

        self.db.delete(category)
        self.db.commit()

    def upload_room_category_images(
        self, tenant_id: UUID, category_id: UUID, images: List[UploadFile]
    ) -> RoomCategory:
        category = (
            self.db.query(RoomCategory)
            .filter(
                RoomCategory.id == category_id,
                RoomCategory.tenant_id == tenant_id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room category not found",
            )

        valid_images = [image for image in (images or []) if image and image.filename]
        if not valid_images:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one image file is required.",
            )

        existing_urls = list(category.image_urls or [])
        if len(existing_urls) + len(valid_images) > self.CATEGORY_IMAGE_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Maximum {self.CATEGORY_IMAGE_LIMIT} images are allowed per room category.",
            )

        try:
            uploaded_urls = upload_room_category_images(valid_images, str(tenant_id))
        except CloudinaryUploadError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=str(exc),
            ) from exc

        category.image_urls = existing_urls + uploaded_urls
        self.db.commit()
        self.db.refresh(category)
        return category

    def delete_room_category_image(
        self, tenant_id: UUID, category_id: UUID, image_url: str
    ) -> RoomCategory:
        category = (
            self.db.query(RoomCategory)
            .filter(
                RoomCategory.id == category_id,
                RoomCategory.tenant_id == tenant_id,
            )
            .first()
        )
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Room category not found",
            )

        normalized_url = (image_url or "").strip()
        if not normalized_url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="image_url is required.",
            )

        existing_urls = list(category.image_urls or [])
        if normalized_url not in existing_urls:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category image not found.",
            )

        try:
            delete_room_image(normalized_url)
        except CloudinaryUploadError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=str(exc),
            ) from exc

        category.image_urls = [url for url in existing_urls if url != normalized_url]
        self.db.commit()
        self.db.refresh(category)
        return category

    def create_room(
        self,
        tenant_id: UUID,
        name: str,
        code: str,
        price: Decimal,
        category_id: Optional[UUID] = None,
        max_adults: int = 2,
        max_children: int = 0,
        amenities: Optional[List[str]] = None,
        images: Optional[List[UploadFile]] = None,
        image_metadata: Optional[List[dict[str, Any]]] = None,
    ) -> RoomType:
        tenant = self.get_by_id(tenant_id)
        if not tenant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tenant not found",
            )
        category = self._validate_room_category(tenant_id, category_id)

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
            category_id=category.id if category else None,
            name=name,
            code=code,
            price=price,
            max_adults=max(0, int(max_adults or 0)),
            max_children=max(0, int(max_children or 0)),
            max_childeren=max(0, int(max_children or 0)),
            amenities=amenities or [],
            image_urls=[],
        )
        self.db.add(room)
        self.db.flush()
        if image_urls:
            self._create_room_images(room, image_urls, image_metadata or [])
        self.db.commit()
        self.db.refresh(room)
        self._sync_room_image_urls(room)
        return room

    def update_room(
        self,
        tenant_id: UUID,
        room_type_id: UUID,
        name: str,
        code: str,
        price: Decimal,
        category_id: Optional[UUID] = None,
        max_adults: Optional[int] = None,
        max_children: Optional[int] = None,
        amenities: Optional[List[str]] = None,
        images: Optional[List[UploadFile]] = None,
        existing_image_metadata: Optional[List[dict[str, Any]]] = None,
        new_image_metadata: Optional[List[dict[str, Any]]] = None,
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
        category = self._validate_room_category(tenant_id, category_id)
        room.category_id = category.id if category else None
        if max_adults is not None:
            room.max_adults = max(0, int(max_adults))
        if max_children is not None:
            normalized_children = max(0, int(max_children))
            room.max_children = normalized_children
            room.max_childeren = normalized_children
        room.amenities = amenities or []
        self._update_existing_room_images(room, existing_image_metadata or [])
        if new_urls:
            self._create_room_images(room, new_urls, new_image_metadata or [])
        else:
            self._sync_room_image_urls(room)

        self.db.commit()
        self.db.refresh(room)
        self._sync_room_image_urls(room)
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
        self, tenant_id: UUID, room_type_id: UUID, image_id: UUID
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

        image = next((item for item in room.images or [] if item.id == image_id), None)
        if not image:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Image not found for this room type.",
            )

        try:
            delete_room_image(image.url)
        except CloudinaryUploadError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=str(exc),
            ) from exc

        self.db.delete(image)
        self.db.flush()
        self._ensure_single_primary(room)
        self._sync_room_image_urls(room)
        self.db.commit()
        self.db.refresh(room)
        self._sync_room_image_urls(room)
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
        readable_id = data.pop("readable_id", None) or self._generate_readable_id()

        slug = (
            data.get("hotel_name", "hotel").lower().replace(" ", "-")
            + "-"
            + str(os.urandom(4).hex())
        )

        tenant = Tenant(**data, slug=slug, readable_id=readable_id)
        self.db.add(tenant)
        self.db.flush()  # Get tenant.id

        self.db.add(build_default_tenant_config(tenant.id))

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
