import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, Boolean, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.db.base import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    hotel_name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    address: Mapped[str | None] = mapped_column(Text)
    owner_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tenant_users.id"), nullable=True
    )
    plan_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("plans.id"))
    readable_id: Mapped[str | None] = mapped_column(String(20), unique=True)
    gstin: Mapped[str | None] = mapped_column(String(50))
    pan: Mapped[str | None] = mapped_column(String(20))
    image_url_1: Mapped[str | None] = mapped_column(Text)
    image_url_2: Mapped[str | None] = mapped_column(Text)
    image_url_3: Mapped[str | None] = mapped_column(Text)
    status: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow
    )

    users = relationship(
        "TenantUser",
        back_populates="tenant",
        foreign_keys="TenantUser.tenant_id",
        cascade="all, delete-orphan",
    )
    roles = relationship(
        "TenantRole", back_populates="tenant", cascade="all, delete-orphan"
    )
    subscriptions = relationship(
        "Subscription", back_populates="tenant", cascade="all, delete-orphan"
    )
    tickets = relationship(
        "SupportTicket", back_populates="tenant", cascade="all, delete-orphan"
    )
    config = relationship(
        "TenantConfig",
        back_populates="tenant",
        uselist=False,
        cascade="all, delete-orphan",
    )
    room_types = relationship(
        "RoomType", back_populates="tenant", cascade="all, delete-orphan"
    )
    bookings = relationship(
        "Booking", back_populates="tenant", cascade="all, delete-orphan"
    )
    owner = relationship("TenantUser", foreign_keys=[owner_user_id], post_update=True)


class TenantRole(Base):
    __tablename__ = "tenant_roles"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow
    )

    tenant = relationship("Tenant", back_populates="roles")
    users = relationship("TenantUser", back_populates="role")
    permissions = relationship(
        "Permission", secondary="tenant_role_permissions", back_populates="tenant_roles"
    )


class TenantUser(Base):
    __tablename__ = "tenant_users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), nullable=False
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(20))
    name: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)
    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenant_roles.id"), nullable=False
    )
    readable_id: Mapped[str | None] = mapped_column(String(20), unique=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow
    )

    tenant = relationship("Tenant", back_populates="users", foreign_keys=[tenant_id])
    role = relationship("TenantRole", back_populates="users")


class TenantConfig(Base):
    __tablename__ = "tenant_configs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    timezone: Mapped[str] = mapped_column(
        String(50), nullable=False, default="Asia/Kolkata"
    )
    check_in_time: Mapped[str] = mapped_column(
        String(10), nullable=False, default="14:00"
    )
    check_out_time: Mapped[str] = mapped_column(
        String(10), nullable=False, default="11:00"
    )
    default_lang: Mapped[str] = mapped_column(String(10), nullable=False, default="en")
    welcome_message: Mapped[str | None] = mapped_column(Text)
    logo_url: Mapped[str | None] = mapped_column(Text)
    support_phone: Mapped[str | None] = mapped_column(String(20))
    support_email: Mapped[str | None] = mapped_column(String(255))
    extra: Mapped[dict] = mapped_column(
        JSONB, nullable=False, default=dict, server_default="{}"
    )
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), default=datetime.utcnow
    )

    tenant = relationship("Tenant", back_populates="config")
