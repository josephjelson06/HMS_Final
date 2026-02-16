from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.database import Base


class Hotel(Base):
    __tablename__ = "hotels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    gstin = Column(String, unique=True, index=True)
    owner = Column(String)
    email = Column(String, index=True)
    mobile = Column(String)
    plan = Column(String, default="Starter")
    kiosks = Column(Integer, default=0)
    status = Column(String, default="Onboarding")
    mrr = Column(Float, default=0.0)
    address = Column(String)

    kiosk_list = relationship(
        "Kiosk", back_populates="hotel", cascade="all, delete-orphan"
    )
