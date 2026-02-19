Below is a **clean, production-ready Pydantic (v2) schema layer** aligned with your SQLAlchemy models and RBAC design.

I’ve structured it like a real backend:

* **Base → Create → Update → Response (Read)**
* Separate **Auth-safe outputs** (no password leaks)
* Ready for FastAPI usage

---

# 🧾 1. COMMON BASE

```python
# schemas/base.py
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class TimestampMixin(BaseModel):
    created_at: datetime
```

---

# 🧾 2. PLATFORM SCHEMAS

```python
# schemas/platform.py
from uuid import UUID
from pydantic import BaseModel, EmailStr
from schemas.base import ORMBase


class PlatformRoleRead(ORMBase):
    id: UUID
    name: str
    status: bool


class PlatformUserCreate(BaseModel):
    email: EmailStr
    phone: str | None = None
    name: str | None = None
    password: str
    role_id: UUID


class PlatformUserRead(ORMBase):
    id: UUID
    email: EmailStr
    phone: str | None
    name: str | None
    role: PlatformRoleRead
```

---

# 🧾 3. PERMISSIONS

```python
# schemas/permissions.py
from uuid import UUID
from pydantic import BaseModel
from schemas.base import ORMBase


class PermissionRead(ORMBase):
    id: UUID
    key: str
    description: str | None = None
```

---

# 🧾 4. TENANT CORE

```python
# schemas/tenant.py
from uuid import UUID
from pydantic import BaseModel, EmailStr
from schemas.base import ORMBase


# ---------- TENANT ----------

class TenantCreate(BaseModel):
    hotel_name: str
    address: str | None = None
    plan_id: UUID | None = None


class TenantRead(ORMBase):
    id: UUID
    hotel_name: str
    address: str | None
    plan_id: UUID | None
    owner_user_id: UUID | None
```

---

# 🧾 5. TENANT ROLES

```python
# schemas/tenant_roles.py
from uuid import UUID
from pydantic import BaseModel
from schemas.base import ORMBase
from schemas.permissions import PermissionRead


class TenantRoleCreate(BaseModel):
    name: str


class TenantRoleRead(ORMBase):
    id: UUID
    name: str
    status: bool
    permissions: list[PermissionRead] = []
```

---

# 🧾 6. TENANT USERS

```python
# schemas/tenant_users.py
from uuid import UUID
from pydantic import BaseModel, EmailStr
from schemas.base import ORMBase
from schemas.tenant_roles import TenantRoleRead


class TenantUserCreate(BaseModel):
    email: EmailStr
    phone: str | None = None
    name: str | None = None
    password: str
    role_id: UUID


class TenantUserUpdate(BaseModel):
    phone: str | None = None
    name: str | None = None
    role_id: UUID | None = None


class TenantUserRead(ORMBase):
    id: UUID
    email: EmailStr
    phone: str | None
    name: str | None
    role: TenantRoleRead
```

---

# 🧾 7. BILLING (PLANS + SUBSCRIPTIONS)

```python
# schemas/billing.py
from uuid import UUID
from datetime import date
from pydantic import BaseModel
from schemas.base import ORMBase


class PlanRead(ORMBase):
    id: UUID
    name: str
    period_months: int
    max_users: int | None
    max_roles: int | None
    max_rooms: int | None


class SubscriptionRead(ORMBase):
    id: UUID
    tenant_id: UUID
    start_date: date
    end_date: date
    status: str
```

---

# 🧾 8. SUPPORT

```python
# schemas/support.py
from uuid import UUID
from pydantic import BaseModel
from schemas.base import ORMBase


class SupportTicketCreate(BaseModel):
    title: str
    description: str | None = None
    category: str | None = None
    priority: str | None = None


class SupportTicketRead(ORMBase):
    id: UUID
    title: str
    description: str | None
    category: str | None
    priority: str | None
    status: str | None
```

---

# 🧾 9. ONBOARDING (IMPORTANT DTO)

This is the **most important schema for your system**.

```python
# schemas/onboarding.py
from pydantic import BaseModel, EmailStr


class TenantOnboardRequest(BaseModel):
    hotel_name: str
    address: str | None = None

    manager_name: str
    manager_email: EmailStr
    manager_phone: str | None = None

    password: str
```

---

# 🧠 DESIGN DECISIONS (IMPORTANT)

## 🔐 1. Password Handling

* Only in **Create schemas**
* Never in **Read schemas**

---

## 🔄 2. Nested Responses

Example:

```json
TenantUserRead → role → permissions
```

✔ Makes frontend easier
✔ Avoids multiple API calls

---

## 🏢 3. Tenant ID NOT in Create

Why?

```python
TenantUserCreate
```

No `tenant_id` → it comes from:

```
current_user.tenant_id
```

✔ Prevents cross-tenant injection attacks

---

# ⚠️ COMMON MISTAKES (AVOID)

❌ Returning password_hash
❌ Accepting tenant_id from frontend
❌ Flat responses without relationships
❌ Mixing DB models with schemas

---

# 🟢 FINAL RESULT

You now have:

* ✔ Clean DTO layer
* ✔ Secure input/output separation
* ✔ RBAC-ready structures
* ✔ FastAPI compatible
* ✔ Frontend-friendly responses

---