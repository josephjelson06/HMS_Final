from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)  # Matching email and password as requested
    role = Column(String)
    status = Column(String, default="Active")
    mobile = Column(String, nullable=True)
    department = Column(String, nullable=True)
    last_login = Column(String, nullable=True)
    date_added = Column(String, default=lambda: datetime.utcnow().strftime("%d %b %Y"))
    avatar = Column(String, nullable=True)

    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=True)
    hotel = relationship("Hotel")
