import uuid
from sqlalchemy import Column, Integer, String, Float, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base


class Plan(Base):
    __tablename__ = "plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, unique=True, index=True)
    price = Column(Float)
    rooms = Column(Integer)
    kiosks = Column(Integer)
    support = Column(String)
    included = Column(JSON)  # List of strings
    theme = Column(String)
    max_roles = Column(Integer, default=5)
    max_users = Column(Integer, default=10)
    is_archived = Column(Boolean, default=False)
