import uuid
from sqlalchemy import Column, String, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"))
    amount = Column(Float)
    status = Column(String)  # 'Paid', 'Overdue', 'Pending'
    period_start = Column(String)  # ISO Date String
    period_end = Column(String)  # ISO Date String
    generated_on = Column(String, default=lambda: datetime.utcnow().isoformat())
    due_date = Column(String)

    tenant = relationship("Tenant")

    @property
    def hotel_id(self):
        return self.tenant_id
