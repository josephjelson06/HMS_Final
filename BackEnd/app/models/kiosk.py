from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Kiosk(Base):
    __tablename__ = "kiosks"

    id = Column(Integer, primary_key=True, index=True)
    serial_number = Column(String, index=True)
    location = Column(String)
    hotel_id = Column(Integer, ForeignKey("hotels.id"))

    hotel = relationship("Hotel", back_populates="kiosk_list")
