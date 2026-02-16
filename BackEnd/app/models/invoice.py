from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"))
    amount = Column(Float)
    status = Column(String)  # 'Paid', 'Overdue', 'Pending'
    period_start = Column(String)  # ISO Date String
    period_end = Column(String)  # ISO Date String
    generated_on = Column(String, default=lambda: datetime.utcnow().isoformat())
    due_date = Column(String)

    hotel = relationship("Hotel", back_populates="invoices")
