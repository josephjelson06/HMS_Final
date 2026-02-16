from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, index=True)
    description = Column(String)
    priority = Column(String)  # Low, Medium, High, Critical
    status = Column(
        String, default="Open"
    )  # Open, In Progress, Waiting on Client, Resolved, Closed
    category = Column(String)  # Technical, Billing, Feature Request, Other

    hotel_id = Column(Integer, ForeignKey("hotels.id"))
    hotel = relationship("Hotel")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
