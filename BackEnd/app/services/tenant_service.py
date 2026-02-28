from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
import os
import shutil
from fastapi import UploadFile

from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate


class TenantService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self, skip: int = 0, limit: int = 100, q: Optional[str] = None
    ) -> List[Tenant]:
        query = self.db.query(Tenant)
        if q:
            term = f"%{q}%"
            query = query.filter(
                or_(Tenant.hotel_name.ilike(term), Tenant.gstin.ilike(term))
            )
        return query.offset(skip).limit(limit).all()

    def get_by_id(self, tenant_id: UUID) -> Optional[Tenant]:
        return self.db.query(Tenant).filter(Tenant.id == tenant_id).first()

    def create(self, payload: TenantCreate) -> Tenant:
        # Note: Full onboarding flow should use OnboardingService.
        # This is a raw create method, mostly for admin or testing.
        data = payload.model_dump()
        slug = (
            data.get("hotel_name", "hotel").lower().replace(" ", "-")
            + "-"
            + str(os.urandom(4).hex())
        )
        tenant = Tenant(**data, slug=slug)
        self.db.add(tenant)
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
