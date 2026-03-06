from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
import os
import shutil
import datetime
from fastapi import UploadFile

from app.models.tenant import Tenant
from app.models.room import RoomType
from app.models.booking import Booking
from app.models.billing import Subscription, Plan
from app.schemas.tenant import TenantCreate


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

    def get_rooms(self, tenant_id: UUID) -> List[RoomType]:
        return self.db.query(RoomType).filter(RoomType.tenant_id == tenant_id).all()

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
