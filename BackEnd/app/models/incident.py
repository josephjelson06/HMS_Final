from sqlalchemy import Column, Integer, String, Float, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, index=True)
    description = Column(String)
    room = Column(String)  # Room Number/ID
    priority = Column(String)  # Low, Medium, High, Critical
    status = Column(String, default="Open")  # Open, In Progress, Resolved, Closed
    category = Column(String)  # Maintenance, Housekeeping, etc.
    guest_name = Column(String, nullable=True)
    reported_by = Column(String, nullable=True)
    assigned_to = Column(String, nullable=True)
    created_at = Column(String)  # ISO Date String
    updated_at = Column(String)  # ISO Date String
    sla_breached = Column(Boolean, default=False)

    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))

    tenant = relationship("Tenant")
