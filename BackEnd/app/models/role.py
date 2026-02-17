import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Role(Base):
    __tablename__ = "job_roles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, index=True)  # Removed unique=True for multi-tenancy
    description = Column(String, nullable=True)
    color = Column(String, default="blue")
    status = Column(String, default="Active")
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=True)
