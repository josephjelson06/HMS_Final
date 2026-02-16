from sqlalchemy import Column, Integer, String, Float, JSON, Boolean
from app.database import Base


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    price = Column(Float)
    rooms = Column(Integer)
    kiosks = Column(Integer)
    subscribers = Column(Integer, default=0)
    support = Column(String)
    included = Column(JSON)  # List of strings
    theme = Column(String)
    is_archived = Column(Boolean, default=False)
