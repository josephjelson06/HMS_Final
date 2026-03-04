import uuid
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import String, ForeignKey, Integer, TIMESTAMP, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    room_type_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("room_types.id", ondelete="RESTRICT"), nullable=False
    )
    guest_name: Mapped[str] = mapped_column(String(255), nullable=False)
    check_in_date: Mapped[date] = mapped_column(Date, nullable=False)
    check_out_date: Mapped[date] = mapped_column(Date, nullable=False)
    adults: Mapped[int] = mapped_column(Integer, nullable=False)
    children: Mapped[int | None] = mapped_column(Integer)
    nights: Mapped[int] = mapped_column(Integer, nullable=False)
    total_price: Mapped[Decimal | None] = mapped_column(nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="DRAFT")
    idempotency_key: Mapped[str | None] = mapped_column(String(190))
    payment_ref: Mapped[str | None] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow
    )
    updated_at: Mapped[datetime | None] = mapped_column(TIMESTAMP(timezone=True))

    room_type = relationship("RoomType", back_populates="bookings")
    tenant = relationship("Tenant", back_populates="bookings")
