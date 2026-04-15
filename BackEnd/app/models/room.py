import uuid
from datetime import datetime
from sqlalchemy import Boolean, ForeignKey, Integer, String, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from decimal import Decimal

from app.db.base import Base


class RoomType(Base):
    __tablename__ = "room_types"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(60), nullable=False)
    price: Mapped[Decimal] = mapped_column(nullable=False)
    max_adults: Mapped[int] = mapped_column(
        Integer, nullable=False, default=2, server_default="2"
    )
    # Back-compat: the project has historically used both spellings in different places.
    max_children: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    max_childeren: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    amenities: Mapped[list[str]] = mapped_column(
        ARRAY(String), nullable=False, default=list, server_default="{}"
    )
    image_urls: Mapped[list[str]] = mapped_column(
        ARRAY(String), nullable=False, default=list, server_default="{}"
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow
    )
    updated_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))

    tenant = relationship("Tenant", back_populates="room_types")
    bookings = relationship("Booking", back_populates="room_type")
    images = relationship(
        "RoomImage",
        back_populates="room_type",
        cascade="all, delete-orphan",
        order_by="RoomImage.display_order",
    )


class RoomImage(Base):
    __tablename__ = "room_images"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    room_type_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("room_types.id", ondelete="CASCADE"), nullable=False, index=True
    )
    url: Mapped[str] = mapped_column(String(1000), nullable=False)
    display_order: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    caption: Mapped[str | None] = mapped_column(String(255))
    tags: Mapped[list[str]] = mapped_column(
        ARRAY(String), nullable=False, default=list, server_default="{}"
    )
    category: Mapped[str | None] = mapped_column(String(50))
    is_primary: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default="false"
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow
    )
    updated_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))

    room_type = relationship("RoomType", back_populates="images")
