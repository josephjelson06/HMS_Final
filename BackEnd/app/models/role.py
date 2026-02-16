from sqlalchemy import Column, Integer, String
from app.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)  # Removed unique=True for multi-tenancy
    description = Column(String, nullable=True)
    color = Column(String, default="blue")
    status = Column(String, default="Active")
    hotel_id = Column(
        Integer, nullable=True
    )  # ForeignKey("hotels.id") - keeping loose for now or adds constraint
