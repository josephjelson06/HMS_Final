from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


class Kiosk(Base):
    __tablename__ = "kiosks"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String, index=True)
    location = Column(String)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))

    tenant = relationship("Tenant", backref="kiosk_list")
