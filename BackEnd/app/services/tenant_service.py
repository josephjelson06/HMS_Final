from uuid import UUID
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.tenant import Tenant
from app.schemas.tenant import TenantCreate, TenantRead


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
        tenant = Tenant(**payload.model_dump())
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
