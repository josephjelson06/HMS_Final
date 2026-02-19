Below is a **clean, production-ready v0 backend model layer** using **FastAPI + SQLAlchemy (2.0 style)**.
It directly maps to your finalized ERD.

I’m giving you:

1. ✅ SQLAlchemy Models (with relationships)
2. ✅ Base + setup
3. ✅ Notes for FastAPI usage (minimal, no fluff)

---

# 🧾 1. BASE SETUP

```python
# db/base.py
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass
```

---

# 🧾 2. MODELS (SQLAlchemy 2.0)

## 🔐 Platform Layer

```python
# models/platform.py
import uuid
from sqlalchemy import String, Boolean, ForeignKey, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime

from db.base import Base


class PlatformRole(Base):
    __tablename__ = "platform_roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    status: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)

    users = relationship("PlatformUser", back_populates="role")
    permissions = relationship(
        "Permission",
        secondary="platform_role_permissions",
        back_populates="platform_roles"
    )


class PlatformUser(Base):
    __tablename__ = "platform_users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String)
    name: Mapped[str | None] = mapped_column(String)
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)

    role_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("platform_roles.id"), nullable=False)

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)

    role = relationship("PlatformRole", back_populates="users")
```

---

## 🏨 Tenant Core

```python
# models/tenant.py
import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, Boolean, Text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from db.base import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    hotel_name: Mapped[str] = mapped_column(String, nullable=False)
    address: Mapped[str | None] = mapped_column(Text)

    owner_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tenant_users.id"), nullable=True
    )

    plan_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("plans.id")
    )

    gstin: Mapped[str | None] = mapped_column(String)
    pan: Mapped[str | None] = mapped_column(String)

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    updated_at: Mapped[datetime | None] = mapped_column(TIMESTAMP)

    users = relationship("TenantUser", back_populates="tenant")
    roles = relationship("TenantRole", back_populates="tenant")
    subscriptions = relationship("Subscription", back_populates="tenant")
    tickets = relationship("SupportTicket", back_populates="tenant")

    owner = relationship("TenantUser", foreign_keys=[owner_user_id])
```

---

## 👤 Tenant Users + Roles

```python
class TenantRole(Base):
    __tablename__ = "tenant_roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id"), nullable=False
    )

    name: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="roles")
    users = relationship("TenantUser", back_populates="role")

    permissions = relationship(
        "Permission",
        secondary="tenant_role_permissions",
        back_populates="tenant_roles"
    )


class TenantUser(Base):
    __tablename__ = "tenant_users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id"), nullable=False
    )

    email: Mapped[str] = mapped_column(String, nullable=False)
    phone: Mapped[str | None] = mapped_column(String)
    name: Mapped[str | None] = mapped_column(String)

    password_hash: Mapped[str] = mapped_column(Text, nullable=False)

    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenant_roles.id"), nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)
    updated_at: Mapped[datetime | None] = mapped_column(TIMESTAMP)

    tenant = relationship("Tenant", back_populates="users")
    role = relationship("TenantRole", back_populates="users")
```

---

## 🔐 Permissions + Mappings

```python
# models/permissions.py
class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    key: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    platform_roles = relationship(
        "PlatformRole",
        secondary="platform_role_permissions",
        back_populates="permissions"
    )

    tenant_roles = relationship(
        "TenantRole",
        secondary="tenant_role_permissions",
        back_populates="permissions"
    )
```

---

## 🔗 Mapping Tables

```python
# models/mappings.py
from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from db.base import Base


platform_role_permissions = Table(
    "platform_role_permissions",
    Base.metadata,
    Column("role_id", UUID(as_uuid=True), ForeignKey("platform_roles.id"), primary_key=True),
    Column("permission_id", UUID(as_uuid=True), ForeignKey("permissions.id"), primary_key=True),
)


tenant_role_permissions = Table(
    "tenant_role_permissions",
    Base.metadata,
    Column("role_id", UUID(as_uuid=True), ForeignKey("tenant_roles.id"), primary_key=True),
    Column("permission_id", UUID(as_uuid=True), ForeignKey("permissions.id"), primary_key=True),
)
```

---

## 💳 Plans + Subscriptions

```python
# models/billing.py
class Plan(Base):
    __tablename__ = "plans"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name: Mapped[str] = mapped_column(String, nullable=False)
    period_months: Mapped[int] = mapped_column()

    max_users: Mapped[int | None]
    max_roles: Mapped[int | None]
    max_rooms: Mapped[int | None]

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)

    tenants = relationship("Tenant", backref="plan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id"), nullable=False
    )

    start_date: Mapped[datetime]
    end_date: Mapped[datetime]
    status: Mapped[str]

    tenant = relationship("Tenant", back_populates="subscriptions")
```

---

## 🎫 Support

```python
# models/support.py
class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tenants.id"), nullable=False
    )

    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)

    category: Mapped[str | None] = mapped_column(String)
    priority: Mapped[str | None] = mapped_column(String)
    status: Mapped[str | None] = mapped_column(String)

    created_at: Mapped[datetime] = mapped_column(TIMESTAMP, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="tickets")
```

---

# ⚙️ 3. FASTAPI INTEGRATION (MINIMAL)

## DB Session

```python
# db/session.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql+psycopg2://user:password@localhost/db"

engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)
```

---

## Dependency

```python
# dependencies/db.py
from db.session import SessionLocal

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

---

# 🔐 IMPORTANT IMPLEMENTATION NOTES

## 1. Always Filter by Tenant

```python
db.query(TenantUser).filter(
    TenantUser.tenant_id == current_user.tenant_id
)
```

---

## 2. RBAC Access

```python
user.role.permissions
```

---

## 3. Onboarding Flow (Code Perspective)

```python
tenant = Tenant(...)
db.add(tenant)

role = TenantRole(...)
db.add(role)

user = TenantUser(...)
db.add(user)

tenant.owner_user_id = user.id
```

---

