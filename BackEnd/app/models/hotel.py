from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False, index=True)
    tenant_key = Column(String, nullable=False, unique=True, index=True)
    tenant_type = Column(String, nullable=False, default="hotel", index=True)

    owner = Column(String, nullable=True)
    email = Column(String, nullable=True, index=True)
    mobile = Column(String, nullable=True)
    gstin = Column(String, nullable=True)
    pan = Column(String, nullable=True)
    legal_name = Column(String, nullable=True)
    logo = Column(String, nullable=True)
    address = Column(String, nullable=True)

    plan_id = Column(UUID(as_uuid=True), ForeignKey("plans.id"), nullable=False)
    kiosks = Column(Integer, nullable=False, default=0)
    status = Column(String, nullable=False, default="Onboarding")
    mrr = Column(Float, nullable=False, default=0.0)
    is_auto_renew = Column(Boolean, nullable=False, default=True)
    subscription_start_date = Column(String, nullable=True)
    subscription_end_date = Column(String, nullable=True)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    plan_rel = relationship("Plan", lazy="joined")
    users = relationship("User", back_populates="tenant")
    roles = relationship("Role", back_populates="tenant")

    @property
    def plan(self) -> str | None:
        if self.plan_rel is not None:
            return self.plan_rel.name
        return getattr(self, "_plan_name_override", None)

    @plan.setter
    def plan(self, value: str | None) -> None:
        # Compatibility setter so payload updates that include `plan` do not crash.
        self._plan_name_override = value


# Backward compatible alias used by existing routers/schemas.
Hotel = Tenant
