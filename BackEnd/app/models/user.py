from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=True)

    email = Column(String, nullable=False, unique=True, index=True)
    username = Column(String, nullable=True, unique=True, index=True)
    name = Column(String, nullable=True)
    employee_id = Column(String, nullable=True, index=True)
    department = Column(String, nullable=True)
    mobile = Column(String, nullable=True)
    avatar = Column(String, nullable=True)

    password_hash = Column(String, nullable=True)
    user_type = Column(String, nullable=False, default="hotel", index=True)
    is_active = Column(Boolean, nullable=False, default=True)
    must_reset_password = Column(Boolean, nullable=False, default=False)

    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )

    tenant = relationship("Tenant", back_populates="users")
    user_roles = relationship(
        "UserRole",
        back_populates="user",
        cascade="all, delete-orphan",
    )
