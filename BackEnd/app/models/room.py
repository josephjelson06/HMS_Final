from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Building(Base):
    __tablename__ = "buildings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"))

    hotel = relationship("Hotel")
    rooms = relationship(
        "Room", back_populates="building", cascade="all, delete-orphan"
    )


class RoomCategory(Base):
    __tablename__ = "room_categories"

    id = Column(String, primary_key=True, index=True)  # e.g., 'rt1', 'STD'
    name = Column(String, index=True)
    rate = Column(Float)
    occupancy = Column(Integer)
    amenities = Column(String)  # Stored as comma-separated string for simplicity
    hotel_id = Column(Integer, ForeignKey("hotels.id"))

    hotel = relationship("Hotel")
    rooms = relationship(
        "Room", back_populates="category", cascade="all, delete-orphan"
    )


class Room(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True, index=True)  # Room No
    floor = Column(Integer)
    status = Column(String, default="CLEAN_VACANT")
    type = Column(String, default="Hostel Room")
    building_id = Column(Integer, ForeignKey("buildings.id"))
    category_id = Column(String, ForeignKey("room_categories.id"))
    hotel_id = Column(Integer, ForeignKey("hotels.id"))

    building = relationship("Building", back_populates="rooms")
    category = relationship("RoomCategory", back_populates="rooms")
    hotel = relationship("Hotel")

    @property
    def building_name(self):
        return self.building.name if self.building else None

    @property
    def category_name(self):
        return self.category.name if self.category else None
