# HMS Foundation — Technical Documentation

**Version:** 2.0.0  
**Stack:** FastAPI (Python 3.11) · Next.js 16 · PostgreSQL (Neon) · Docker  
**Last Updated:** April 2026

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Backend Architecture](#2-backend-architecture)
   - [Directory Structure](#21-directory-structure)
   - [Application Entry Point](#22-application-entry-point)
   - [Configuration & Environment](#23-configuration--environment)
   - [Database Setup](#24-database-setup)
   - [Data Models](#25-data-models)
   - [Authentication System](#26-authentication-system)
   - [RBAC (Role-Based Access Control)](#27-rbac-role-based-access-control)
   - [API Routers — Endpoint Reference](#28-api-routers--endpoint-reference)
   - [Service Layer](#29-service-layer)
   - [Database Migrations (Alembic)](#210-database-migrations-alembic)
   - [Docker & Deployment](#211-docker--deployment)
3. [Frontend Architecture](#3-frontend-architecture)
   - [Directory Structure](#31-directory-structure)
   - [Routing Model](#32-routing-model)
   - [Domain Layer](#33-domain-layer)
   - [Infrastructure Layer](#34-infrastructure-layer)
   - [Presentation Layer](#35-presentation-layer)
   - [Authentication Flow (Frontend)](#36-authentication-flow-frontend)
4. [Data Flow Diagrams](#4-data-flow-diagrams)
5. [Permission System Reference](#5-permission-system-reference)
6. [Known Issues & Technical Notes](#6-known-issues--technical-notes)

---

## 1. System Architecture

HMS Foundation follows a **client-server architecture** with a clear separation between the frontend (Next.js), backend (FastAPI), and the database layer (PostgreSQL). The system is **multi-tenant** — the same backend serves both the Super Admin platform console and individual hotel admin workspaces.

```
┌─────────────────────────────────────────────┐
│              Browser (Client)               │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │     Next.js 16 (App Router)         │   │
│  │  ┌──────────────┬──────────────┐   │   │
│  │  │  ATC Admin   │  HMS Hotel   │   │   │
│  │  │ (Super Panel)│ (Hotel Panel)│   │   │
│  │  └──────────────┴──────────────┘   │   │
│  └─────────────────────────────────────┘   │
│          │ HTTPS   (fetch + cookies)        │
└──────────┼──────────────────────────────────┘
           │
           ▼  http://localhost:8080
┌─────────────────────────────────────────────┐
│        Docker Container                     │
│   FastAPI v2 (python:3.11-slim)             │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │  Routers → Services → Repositories  │  │
│  │  RBAC Middleware (permission keys)   │  │
│  │  JWT Auth (HTTP-only cookie)         │  │
│  └──────────────────────────────────────┘  │
│           │  SQLAlchemy 2.0                 │
└───────────┼─────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│    PostgreSQL — Neon (Cloud-hosted)         │
│    Connection pooling: pool_size=5          │
│    max_overflow=10 · pool_recycle=300s      │
└─────────────────────────────────────────────┘
            │
            ▼ (Image uploads)
┌──────────────────┐
│   Cloudinary CDN │
│  (Room/Tenant    │
│   photos)        │
└──────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|---|---|
| Single FastAPI backend serves both admin panels | Simplifies deployment; role-based routing happens via JWT permissions |
| JWT stored in HTTP-only cookie | Security; prevents XSS token theft. Cookie is cross-origin so Authorization header fallback is used |
| Neon PostgreSQL (cloud-hosted) | Serverless Postgres — no local DB setup required; connection pooler built-in |
| Docker-only backend | Ensures consistent environment; eliminates "works on my machine" issues |
| Cloudinary for image storage | Removes need for local file storage in containerized environments |
| Alembic for migrations | Version-controlled schema evolution; safe rollbacks |

---

## 2. Backend Architecture

### 2.1 Directory Structure

```
BackEnd/
├── app/
│   ├── main.py               # FastAPI app factory, middleware, router registration
│   ├── database.py           # SQLAlchemy engine and session factory
│   ├── core/
│   │   ├── config.py         # Pydantic-settings Settings class (env vars)
│   │   └── auth/             # JWT creation, validation, cookie management
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── platform.py       # PlatformUser, PlatformRole
│   │   ├── tenant.py         # Tenant, TenantUser, TenantRole, TenantConfig
│   │   ├── permissions.py    # Permission model
│   │   ├── mappings.py       # M2M association tables (role ↔ permission)
│   │   ├── billing.py        # Plan, Subscription
│   │   ├── support.py        # SupportTicket
│   │   ├── room.py           # RoomType, RoomImage
│   │   ├── booking.py        # Booking
│   │   └── faq.py            # FAQ
│   ├── routers/              # FastAPI route handlers (thin controllers)
│   ├── schemas/              # Pydantic v2 request/response schemas
│   ├── services/             # Business logic (fat services)
│   ├── repositories/         # Data access objects (SQLAlchemy queries)
│   ├── modules/
│   │   └── rbac.py           # require_permission() dependency factory
│   └── utils/                # Shared utilities
├── alembic/                  # Alembic migration environment
│   └── versions/             # Auto-generated migration files
├── scripts/                  # Utility/maintenance scripts
├── Dockerfile
├── docker-compose.yaml
├── requirements.txt
├── run.py                    # Uvicorn launcher (python run.py)
└── alembic.ini               # Alembic configuration
```

---

### 2.2 Application Entry Point

**File:** `app/main.py`

The FastAPI application is created with the following configuration:

```python
app = FastAPI(
    title="HMS Backend API",
    description="Backend API for Hotel Management System",
    version="2.0.0",
)
```

**CORS Origins configured:**

| Origin | Purpose |
|---|---|
| `http://localhost:3000`, `http://localhost:3001` | Next.js frontend (dev) |
| `http://localhost:4000` | Kiosk app (Express dev) |
| `http://localhost:5173`, `http://localhost:5174` | Kiosk app (Vite dev) |

**Registered Routers:**

| Router | Prefix | Tag |
|---|---|---|
| `auth_simple` | `/auth` | Auth |
| `tenants` | `/api/tenants` | Tenants |
| `subscriptions` | `/api/subscriptions` | Subscriptions |
| `plans` | `/api/plans` | Plans |
| `users` | `/api/users` | Users |
| `roles` | `/api/roles` | Roles |
| `permissions` | `/api/permissions` | Permissions |
| `support` | `/api/support` | Support |
| `onboarding` | `/api/onboarding` | Onboarding |
| `kiosk` | `/api/kiosk` | Kiosk |
| `faqs` | `/api/faqs` | FAQs |

**Static Files:** Uploaded images served from `/uploads` directory.

---

### 2.3 Configuration & Environment

**File:** `app/core/config.py`

Configuration uses `pydantic-settings` (`BaseSettings`), automatically loading from a `.env` file or environment variables.

| Variable | Type | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | `str` | *(required)* | PostgreSQL connection string (Neon) |
| `JWT_SECRET` | `str` | `CHANGE_THIS...` | HMAC secret for JWT signing |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `int` | `1440` (24h) | JWT token TTL |
| `COOKIE_SECURE` | `bool` | `False` | Set `True` in HTTPS production |
| `ACCESS_TOKEN_COOKIE_NAME` | `str` | `access_token` | Cookie name for JWT |
| `ACCESS_TOKEN_COOKIE_SAMESITE` | `str` | `lax` | SameSite cookie policy |
| `CLOUDINARY_CLOUD_NAME` | `str \| None` | `None` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `str \| None` | `None` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `str \| None` | `None` | Cloudinary API secret |

Settings are cached via `@lru_cache` — the `get_settings()` function is called once per process lifetime.

---

### 2.4 Database Setup

**File:** `app/database.py`

```python
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
)
```

| Parameter | Value | Reason |
|---|---|---|
| `pool_pre_ping=True` | Enabled | Validates connections before use — important for cloud DBs that drop idle connections |
| `pool_recycle=300` | 300s | Recycles connections every 5 min — prevents stale connection errors |
| `pool_size=5` | 5 | Base connection pool size |
| `max_overflow=10` | 10 | Additional burst connections allowed |

**Session dependency:**
```python
def get_db(request: Request = None):
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```
Used via FastAPI's `Depends(get_db)` in all router handlers.

---

### 2.5 Data Models

All models inherit from `Base` (SQLAlchemy declarative base). UUIDs are used as primary keys throughout.

#### Platform Models (Super Admin scope)

**`PlatformUser`** — Super admin team members
```
id (UUID PK) | name | email | hashed_password | role_id (FK→PlatformRole) | created_at | updated_at
```

**`PlatformRole`** — Roles for platform users (e.g., SUPER ADMIN)
```
id (UUID PK) | name | description | is_active | created_at | permissions (M2M→Permission)
```

#### Tenant Models (Hotel scope)

**`Tenant`** — A hotel entity (one row per hotel)
```
id (UUID PK) | name | address | gstin | pan | state_code | status
             | owner_name | owner_email | owner_phone
             | plan_id (FK→Plan) | images (JSON)
             | created_at | updated_at
```

**`TenantConfig`** — Per-hotel kiosk configuration
```
id (UUID PK) | tenant_id (FK→Tenant) | timezone | check_in_time | check_out_time
             | default_lang | available_lang | support_phone | support_email | extra (JSON)
```

**`TenantUser`** — Hotel staff accounts
```
id (UUID PK) | name | email | hashed_password | tenant_id (FK→Tenant)
             | role_id (FK→TenantRole) | created_at | updated_at
```

**`TenantRole`** — RBAC roles within a hotel (e.g., General Manager)
```
id (UUID PK) | name | description | tenant_id (FK→Tenant) | permissions (M2M→Permission)
```

#### Billing Models

**`Plan`** — Subscription plan tiers
```
id (UUID PK) | name | price | max_rooms | max_users | max_roles
             | modules (JSON) | is_active | created_at
```

**`Subscription`** — Hotel's active plan assignment
```
id (UUID PK) | tenant_id (FK→Tenant) | plan_id (FK→Plan)
             | start_date | renewal_date | status | auto_renew
             | billing_frequency | payment_method | currency
```

#### Operational Models

**`RoomType`** — Hotel room categories
```
id (UUID PK) | tenant_id (FK→Tenant) | name | code | price
             | max_adults | max_children | amenities (JSON) | is_active
```

**`RoomImage`** — Room type photos (Cloudinary)
```
id (UUID PK) | room_type_id (FK→RoomType) | url | public_id | order | created_at
```

**`Booking`** — Guest bookings
```
id (UUID PK) | tenant_id (FK→Tenant) | room_type_id (FK→RoomType)
             | guest_name | adults | children | check_in | check_out
             | total_price | status | created_at
```

**`FAQ`** — Hotel FAQ entries (shown on kiosk)
```
id (UUID PK) | tenant_id (FK→Tenant) | question | answer | is_active | created_at
```

**`SupportTicket`** — Hotel → Platform support tickets
```
id (UUID PK) | tenant_id (FK→Tenant) | subject | body | status | priority | category | created_at
```

**`Permission`** — Granular permission keys
```
id (UUID PK) | key (unique) | description
```

#### Association Tables (M2M)

| Table | Left | Right |
|---|---|---|
| `platform_role_permissions` | `PlatformRole.id` | `Permission.id` |
| `tenant_role_permissions` | `TenantRole.id` | `Permission.id` |

---

### 2.6 Authentication System

**Mechanism:** Email + password → JWT stored as HTTP-only cookie + Authorization header fallback.

**Login Flow:**
1. `POST /auth/login` — receives `{ email, password }`
2. `AuthService.login()` looks up user in both `PlatformUser` and `TenantUser` tables
3. Password verified with `passlib[bcrypt]`
4. JWT created with `PyJWT` — payload includes: `sub` (user id), `user_type` (`platform` or `tenant`), `tenant_id`, role, permissions
5. JWT set as HTTP-only cookie (`access_token`)
6. Response also returns `UserResponse` containing `user_type`, `tenant_id`, `permissions[]`, `role_name`

**`GET /auth/me`** — returns the currently authenticated user's identity and permissions from the JWT.

**`POST /auth/logout`** — clears the authentication cookie.

**Cross-Origin Cookie Note:**  
Because the frontend (`localhost:3000`) and backend (`localhost:8080`) are on different ports, cross-origin cookies with `SameSite=lax` are **not** automatically sent. The frontend HTTP client (`infrastructure/http/client.ts`) reads the JWT from `document.cookie` and sends it as an `Authorization` header on every request.

---

### 2.7 RBAC (Role-Based Access Control)

**File:** `app/modules/rbac.py`

The system uses a **permission-key** based RBAC model. Every user has a role, and every role has a set of `Permission` records. Each permission has a unique `key` string.

**Permission key naming convention:**

```
{scope}:{resource}:{action}

Examples:
  platform:tenants:read      → Super Admin can view all hotels
  platform:tenants:write     → Super Admin can create/edit/delete hotels
  hotel:rooms:read           → Hotel staff can view rooms
  hotel:rooms:write          → Hotel staff can create/edit/delete rooms
  hotel:bookings:read        → Hotel staff can view bookings
  hotel:config:write         → Hotel staff can update hotel settings
```

**`require_permission(key)`** is a FastAPI dependency factory:

```python
# Usage in a router
@router.get("", response_model=List[TenantRead])
def get_tenants(
    _=Depends(require_permission("platform:tenants:read")),
    ...
):
```

If the current user's role does not contain the required permission key, a `403 Forbidden` is returned.

**Super Admin Permission Scopes:**

| Module Key | Description |
|---|---|
| `platform:tenants` | Hotels (CRUD) |
| `platform:billing` | Plans, subscriptions |
| `platform:plans` | Plan catalog |
| `platform:roles` | Platform role management |
| `platform:settings` | Platform settings |
| `platform:support` | Helpdesk tickets |
| `platform:users` | Platform user management |

**Hotel Admin Permission Scopes:**

| Module Key | Description |
|---|---|
| `hotel:billing` | Billing / subscription view |
| `hotel:bookings` | Booking management |
| `hotel:config` | Hotel settings |
| `hotel:dashboard` | Dashboard view |
| `hotel:guests` | Guest management |
| `hotel:kiosk` | Kiosk management |
| `hotel:roles` | Staff role management |
| `hotel:rooms` | Room type management |
| `hotel:support` | Support ticket management |
| `hotel:users` | Staff user management |

---

### 2.8 API Routers — Endpoint Reference

#### Auth (`/auth`)

| Method | Path | Description | Auth Required |
|---|---|---|---|
| `POST` | `/auth/login` | Login with email + password | No |
| `POST` | `/auth/logout` | Clear auth cookie | No |
| `GET` | `/auth/me` | Get current authenticated user | Yes |

---

#### Tenants (`/api/tenants`)

| Method | Path | Permission | Description |
|---|---|---|---|
| `GET` | `/api/tenants` | `platform:tenants:read` | List all hotels (paginated, searchable) |
| `GET` | `/api/tenants/{id}` | `platform:tenants:read` | Get hotel by ID |
| `POST` | `/api/tenants` | `platform:tenants:write` | Create (onboard) a new hotel |
| `PATCH` | `/api/tenants/{id}` | `platform:tenants:write` | Update hotel details |
| `DELETE` | `/api/tenants/{id}` | `platform:tenants:write` | Delete a hotel |
| `POST` | `/api/tenants/{id}/images` | `platform:tenants:write` | Upload hotel property photos |
| `GET` | `/api/tenants/{id}/rooms` | `hotel:rooms:read` | List room types for a hotel |
| `POST` | `/api/tenants/{id}/rooms` | `hotel:rooms:write` | Create a room type (multipart/form-data) |
| `PUT` | `/api/tenants/{id}/rooms/{rid}` | `hotel:rooms:write` | Update a room type |
| `DELETE` | `/api/tenants/{id}/rooms/{rid}` | `hotel:rooms:write` | Delete a room type |
| `DELETE` | `/api/tenants/{id}/rooms/{rid}/images/{iid}` | `hotel:rooms:write` | Delete a room image |
| `GET` | `/api/tenants/{id}/bookings` | `hotel:bookings:read` | List all bookings for a hotel |
| `GET` | `/api/tenants/{id}/config` | `hotel:config:read` | Get kiosk/hotel config |
| `PATCH` | `/api/tenants/me/config` | `hotel:config:write` | Update own hotel's config |

---

#### Plans (`/api/plans`)

| Method | Path | Permission | Description |
|---|---|---|---|
| `GET` | `/api/plans` | `platform:plans:read` | List all subscription plans |
| `GET` | `/api/plans/{id}` | `platform:plans:read` | Get plan by ID |
| `POST` | `/api/plans` | `platform:plans:write` | Create a new plan |
| `PATCH` | `/api/plans/{id}` | `platform:plans:write` | Update a plan |
| `DELETE` | `/api/plans/{id}` | `platform:plans:write` | Delete a plan |

---

#### Subscriptions (`/api/subscriptions`)

| Method | Path | Permission | Description |
|---|---|---|---|
| `GET` | `/api/subscriptions` | `platform:billing:read` | List all hotel subscriptions |
| `GET` | `/api/subscriptions/me` | `hotel:billing:read` | Get current hotel's subscription |
| `POST` | `/api/subscriptions` | `platform:billing:write` | Create a subscription for a hotel |
| `PATCH` | `/api/subscriptions/{id}` | `platform:billing:write` | Update a subscription |

---

#### Users (`/api/users`)

| Method | Path | Permission | Description |
|---|---|---|---|
| `GET` | `/api/users/platform` | `platform:users:read` | List all Super Admin platform users |
| `GET` | `/api/users/hotel` | `hotel:users:read` | List all staff in current hotel |
| `POST` | `/api/users/platform` | `platform:users:write` | Create a platform user |
| `POST` | `/api/users/hotel` | `hotel:users:write` | Add a hotel staff member |
| `PATCH` | `/api/users/platform/{id}` | `platform:users:write` | Update a platform user |
| `PATCH` | `/api/users/hotel/{id}` | `hotel:users:write` | Update a hotel staff member |
| `DELETE` | `/api/users/platform/{id}` | `platform:users:write` | Delete a platform user |
| `DELETE` | `/api/users/hotel/{id}` | `hotel:users:write` | Remove a hotel staff member |

---

#### Roles (`/api/roles`)

| Method | Path | Permission | Description |
|---|---|---|---|
| `GET` | `/api/roles/platform` | `platform:roles:read` | List platform roles |
| `GET` | `/api/roles/hotel` | `hotel:roles:read` | List hotel roles |
| `POST` | `/api/roles/platform` | `platform:roles:write` | Create a platform role |
| `POST` | `/api/roles/hotel` | `hotel:roles:write` | Create a hotel role |
| `PATCH` | `/api/roles/platform/{id}` | `platform:roles:write` | Update a platform role |
| `PATCH` | `/api/roles/hotel/{id}` | `hotel:roles:write` | Update a hotel role |
| `DELETE` | `/api/roles/platform/{id}` | `platform:roles:write` | Delete a platform role |
| `DELETE` | `/api/roles/hotel/{id}` | `hotel:roles:write` | Delete a hotel role |
| `PUT` | `/api/roles/platform/{id}/permissions` | `platform:roles:write` | Set permissions for a platform role |
| `PUT` | `/api/roles/hotel/{id}/permissions` | `hotel:roles:write` | Set permissions for a hotel role |

---

#### Permissions (`/api/permissions`)

| Method | Path | Permission | Description |
|---|---|---|---|
| `GET` | `/api/permissions` | Any authenticated | List all available permission keys |

---

#### Support (`/api/support`)

| Method | Path | Permission | Description |
|---|---|---|---|
| `GET` | `/api/support` | `platform:support:read` | List all support tickets (Super Admin) |
| `GET` | `/api/support/my` | `hotel:support:read` | List tickets for current hotel |
| `POST` | `/api/support` | `hotel:support:write` | Raise a new support ticket |
| `PATCH` | `/api/support/{id}` | `platform:support:write` | Update ticket status (Super Admin) |

---

#### FAQs (`/api/faqs`)

| Method | Path | Permission | Description |
|---|---|---|---|
| `GET` | `/api/faqs` | `hotel:guests:read` | List FAQs for current hotel |
| `POST` | `/api/faqs` | `hotel:guests:write` | Create a new FAQ |
| `PATCH` | `/api/faqs/{id}` | `hotel:guests:write` | Update an FAQ |
| `DELETE` | `/api/faqs/{id}` | `hotel:guests:write` | Delete an FAQ |

---

#### Kiosk (`/api/kiosk`)

The kiosk router exposes public-facing endpoints consumed by the physical kiosk terminal (no RBAC — token-based or open based on configuration).

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/kiosk/{tenant_id}` | Get kiosk data (rooms, FAQs, config) for a hotel |
| `POST` | `/api/kiosk/{tenant_id}/bookings` | Create a new booking from kiosk |

---

#### Onboarding (`/api/onboarding`)

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/onboarding` | Onboard a new hotel (creates Tenant, TenantConfig, Subscription, and default TenantRole in one transaction) |

---

### 2.9 Service Layer

The service layer contains all business logic. Routers are thin — they validate input and call services. Services handle:

- Business rules and validations
- Orchestrating multiple repository calls
- Cloudinary uploads
- Complex queries and joins

| Service | Responsibility |
|---|---|
| `AuthService` | Login / logout / JWT creation |
| `TenantService` | Hotel CRUD, room management, booking retrieval, image uploads |
| `PlanService` | Plan catalog management |
| `SubscriptionService` | Hotel subscription assignment |
| `PlatformUserService` | Super Admin user management |
| `TenantUserService` | Hotel staff management |
| `PlatformRoleService` | Platform role + permission matrix management |
| `TenantRoleService` | Hotel role + permission matrix management |
| `PermissionService` | Permission key listing |
| `SupportService` | Support ticket management |
| `FAQService` | FAQ entry management |
| `KioskService` | Kiosk data aggregation |
| `OnboardingService` | Full hotel onboarding transaction |

---

### 2.10 Database Migrations (Alembic)

**Config file:** `alembic.ini`  
**Env file:** `alembic/env.py`

```powershell
# Run all pending migrations (inside running container)
docker exec -it hms_backend_alt_container alembic upgrade head

# Create a new migration (auto-generate from model changes)
docker exec -it hms_backend_alt_container alembic revision --autogenerate -m "description"

# Rollback one migration
docker exec -it hms_backend_alt_container alembic downgrade -1

# View migration history
docker exec -it hms_backend_alt_container alembic history
```

> ⚠ **Always back up the database before running downgrade migrations in production.**

---

### 2.11 Docker & Deployment

**Dockerfile** (python:3.11-slim):

```dockerfile
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "run.py"]
```

**docker-compose.yaml:**

```yaml
services:
  backend:
    build: .
    image: hms_backend_alt
    container_name: hms_backend_alt_container
    ports:
      - "8080:8000"      # Host:8080 → Container:8000
    volumes:
      - .:/app           # Live code reload in development
    environment:
      - DATABASE_URL=...
      - JWT_SECRET=...
      - COOKIE_SECURE=False
    restart: always
```

**Port mapping:** External `8080` → Internal `8000` (Uvicorn).

---

## 3. Frontend Architecture

### 3.1 Directory Structure

```
FrontEnd/
├── app/                          # Next.js App Router
│   ├── (authenticated)/          # Route group — requires auth
│   │   ├── layout.tsx            # Auth guard + sidebar layout
│   │   ├── hotel/                # Hotel Admin pages
│   │   │   ├── dashboard/
│   │   │   ├── rooms/
│   │   │   ├── guests/
│   │   │   ├── bookings/
│   │   │   ├── reports/
│   │   │   ├── billing/
│   │   │   ├── faq/
│   │   │   ├── roles/
│   │   │   ├── users/
│   │   │   ├── settings/
│   │   │   ├── help/
│   │   │   ├── profile/
│   │   │   ├── incidents/
│   │   │   └── rates/
│   │   └── super/                # Super Admin pages
│   │       ├── dashboard/
│   │       ├── hotels/
│   │       ├── plans/
│   │       ├── subscriptions/
│   │       ├── reports/
│   │       ├── invoices/
│   │       ├── helpdesk/
│   │       ├── users/
│   │       ├── tenants/
│   │       ├── kiosks/
│   │       ├── audit-logs/
│   │       ├── settings/
│   │       └── profile/
│   └── (public)/                 # Login page (no auth required)
│
├── domain/                       # Entities and contracts (interfaces)
│   ├── entities/                 # TypeScript types for domain objects
│   └── contracts/                # Repository interface definitions
│
├── infrastructure/               # External service implementations
│   ├── http/
│   │   └── client.ts             # HttpClient class (singleton)
│   ├── repositories/             # API repository implementations
│   │   ├── UserRepository.ts
│   │   ├── TenantRepository.ts
│   │   ├── HotelStaffRepository.ts
│   │   ├── PlanRepository.ts
│   │   ├── SubscriptionRepository.ts
│   │   ├── SupportRepository.ts
│   │   ├── SettingsRepository.ts
│   │   └── ...
│   ├── browser/                  # Browser utilities (cookie reading)
│   ├── config/                   # Frontend config (API URL)
│   ├── dto/                      # Data Transfer Objects
│   ├── services/                 # Frontend service wrappers
│   └── storage/                  # IndexedDB / local storage utilities
│
├── presentation/                 # UI layer
│   ├── components/               # Reusable React components
│   │   ├── layout/               # Sidebar, topbar, shell
│   │   ├── ui/                   # Primitives (Button, Modal, Table...)
│   │   ├── dashboard/            # Dashboard widgets
│   │   ├── hotel/                # Hotel-specific components
│   │   ├── domain/               # Domain-linked components
│   │   └── auth/                 # Auth-related components
│   ├── hooks/                    # Custom React hooks
│   ├── modals/                   # Modal components
│   ├── pages/                    # Page-level components (used by App Router pages)
│   └── providers/                # React context providers
│
└── styles/                       # Global CSS
```

---

### 3.2 Routing Model

Next.js 16 App Router with **route groups** for auth separation:

```
/                              → Login page (public)
/hotel/dashboard               → Hotel Admin dashboard (authenticated)
/hotel/rooms                   → Room Types
/hotel/guests                  → Bookings list
/hotel/billing                 → Commercial Ecosystem
/hotel/faq                     → FAQ Knowledge Base
/hotel/roles                   → Team Sovereignty (Users & Roles)
/hotel/settings                → Hotel Settings
/hotel/help                    → Support Helpdesk
/hotel/profile                 → My Profile

/super/dashboard               → Super Admin dashboard
/super/hotels                  → Hotels Registry
/super/plans                   → Product Catalog
/super/subscriptions           → Subscription Hub
/super/reports                 → Intelligence Hub
/super/helpdesk                → Support Center
/super/users                   → Platform Users & Access Control
/super/profile                 → Account Settings
```

**Authentication Guard:** The `(authenticated)/layout.tsx` checks for a valid session on every render. If no session is found, it redirects to the login page. After login, the server-side role (`user_type: "platform" | "tenant"`) determines which panel layout and sidebar to render.

---

### 3.3 Domain Layer

**Location:** `domain/`

Contains pure TypeScript types — no business logic, no API calls. These are the canonical shapes of all domain objects used by both the infrastructure and presentation layers.

**Key entities:**
- `Tenant` — Hotel entity
- `TenantUser` / `PlatformUser` — User types
- `Plan` — Subscription plan
- `Subscription` — Active hotel subscription
- `Booking` — Guest booking
- `RoomType` — Room category
- `FAQ` — Hotel FAQ
- `SupportTicket` — Help ticket
- `Permission` / `Role` — RBAC types

**Contracts:** TypeScript interfaces defining what each repository must implement (Dependency Inversion Principle).

---

### 3.4 Infrastructure Layer

#### HTTP Client

**File:** `infrastructure/http/client.ts`

A custom `HttpClient` class wraps the native `fetch()` API:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const httpClient = new HttpClient(API_URL);
```

**Key features:**
- Centralized base URL configuration via `NEXT_PUBLIC_API_URL`
- Automatic `Authorization` header injection (reads JWT from `document.cookie`)
- Automatic `FormData` handling (removes `Content-Type` header so browser sets boundary)
- Standardized error handling with HTTP status code mapping
- Methods: `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `delete<T>()`

#### Repositories

Each repository in `infrastructure/repositories/` maps to a backend resource:

| Repository | Backend Resource | Key Methods |
|---|---|---|
| `UserRepository` | `/api/users/platform` | `listPlatformUsers()`, `createPlatformUser()`, `updatePlatformUser()`, `deletePlatformUser()` |
| `HotelStaffRepository` | `/api/users/hotel` | `listStaff()`, `createStaff()`, `updateStaff()` |
| `TenantRepository` | `/api/tenants` | `listTenants()`, `getTenant()`, `createTenant()`, `updateTenant()`, `deleteTenant()` |
| `PlanRepository` | `/api/plans` | `listPlans()`, `createPlan()`, `updatePlan()`, `deletePlan()` |
| `SubscriptionRepository` | `/api/subscriptions` | `listSubscriptions()`, `getMySubscription()`, `updateSubscription()` |
| `SupportRepository` | `/api/support` | `listTickets()`, `createTicket()`, `updateTicket()` |
| `SettingsRepository` | `/api/tenants/me/config` | `getConfig()`, `updateConfig()` |

---

### 3.5 Presentation Layer

**Location:** `presentation/`

**Components (`presentation/components/`):**

| Folder | Contents |
|---|---|
| `layout/` | `Sidebar`, `Topbar`, `Shell` — core page layout |
| `ui/` | Primitive components: `Button`, `Modal`, `Table`, `Badge`, `Input`, `Card`, `Spinner` |
| `dashboard/` | KPI Cards, Chart widgets, Live Feed, Alert List |
| `hotel/` | Hotel-specific components (room cards, booking cards) |
| `auth/` | `LoginForm`, session guards |
| `domain/` | Data-driven components that render domain entities |

**Key shared components:**
- `Access.tsx` — RBAC-aware wrapper: hides/shows children based on user permissions
- `AlertList.tsx` — Live incident feed for Super Admin dashboard
- `QuickAccess.tsx` — Dashboard quick navigation shortcuts
- `Team.tsx` — Staff listing with role management

**Hooks (`presentation/hooks/`):**
Custom hooks for data fetching, form state, and modal management.

**Providers (`presentation/providers/`):**
React context providers including auth context (user session state).

**Modals (`presentation/modals/`):**
Isolated modal components for create/edit forms (e.g., Edit Hotel Modal, Create Plan Modal, Add FAQ Modal).

---

### 3.6 Authentication Flow (Frontend)

```
1. User visits /
   → (authenticated)/layout.tsx checks session
   → No session → redirect to (public)/login

2. User submits login form
   → POST /auth/login
   → Backend sets HTTP-only cookie "access_token"
   → Response returns UserResponse { user_type, tenant_id, permissions[], role_name }

3. UserResponse stored in React auth context (memory, not localStorage)

4. Auth context reads user_type:
   → "platform" → render Super Admin (ATC Admin) layout + sidebar
   → "tenant"   → render Hotel Admin (HMS Hotel) layout + sidebar

5. All subsequent API calls:
   → HttpClient reads "access_token" cookie from document.cookie
   → Sets Authorization: <token> header on every request

6. User logs out → POST /auth/logout → cookie cleared → redirect to login
```

---

## 4. Data Flow Diagrams

### Hotel Onboarding Flow (Super Admin)

```
Super Admin UI
  → POST /api/onboarding { name, address, gstin, pan, plan_id, ... }
  → OnboardingService.onboard()
      ├── Creates Tenant record
      ├── Creates TenantConfig (default timezone, support contacts)
      ├── Creates Subscription (linked to chosen plan)
      └── Creates default TenantRole ("General Manager") with full permissions
  → 201 Created { tenant }
  → Super Admin UI shows new hotel in Hotels Registry
```

### Room Type Creation Flow (Hotel Admin)

```
Hotel Admin UI (Room Types page)
  → POST /api/tenants/{id}/rooms (multipart/form-data)
      { name, code, price, max_adults, max_children, amenities[], images[] }
  → TenantService.create_room()
      ├── Creates RoomType record
      └── Uploads each image to Cloudinary
          ├── Stores { url, public_id } as RoomImage records
  → 201 Created { room_type with images }
  → UI re-renders room card grid
```

### Kiosk Booking Flow

```
Kiosk Terminal
  → GET /api/kiosk/{tenant_id}
      → KioskService.get_kiosk_data()
          ├── Room types for this hotel
          ├── FAQ entries
          └── Hotel config (timezone, support phone, etc.)

  → POST /api/kiosk/{tenant_id}/bookings
      { guest_name, room_type_id, check_in, check_out, adults, children }
      → KioskService.create_booking()
          ├── Validates room type belongs to tenant
          ├── Calculates total price (nights × base_rate)
          └── Creates Booking record with status=CONFIRMED
  → 201 Created { booking }
  → Booking appears on Hotel Admin → Guests page
```

---

## 5. Permission System Reference

### Complete Permission Key List

#### Platform (Super Admin) Permissions

| Key | Action |
|---|---|
| `platform:tenants:read` | View hotel list and hotel details |
| `platform:tenants:write` | Create, edit, delete hotels |
| `platform:plans:read` | View subscription plans |
| `platform:plans:write` | Create, edit, delete plans |
| `platform:billing:read` | View subscriptions |
| `platform:billing:write` | Create, modify subscriptions |
| `platform:roles:read` | View platform roles and permission matrix |
| `platform:roles:write` | Create, edit, delete platform roles; assign permissions |
| `platform:users:read` | View platform users |
| `platform:users:write` | Create, edit, delete platform users |
| `platform:support:read` | View all hotel support tickets |
| `platform:support:write` | Respond to / resolve support tickets |
| `platform:settings:read` | View platform settings |
| `platform:settings:write` | Update platform settings |

#### Hotel Permissions

| Key | Action |
|---|---|
| `hotel:dashboard:read` | View hotel dashboard |
| `hotel:rooms:read` | View room types |
| `hotel:rooms:write` | Create, edit, delete room types and images |
| `hotel:bookings:read` | View all bookings |
| `hotel:bookings:write` | Create, modify, cancel bookings |
| `hotel:guests:read` | View guest/booking list; view FAQs |
| `hotel:guests:write` | Manage FAQs |
| `hotel:billing:read` | View subscription and billing details |
| `hotel:billing:write` | Modify subscription tier / payment |
| `hotel:config:read` | View hotel kiosk settings |
| `hotel:config:write` | Update hotel kiosk settings |
| `hotel:roles:read` | View hotel roles |
| `hotel:roles:write` | Create, edit, delete hotel roles; assign permissions |
| `hotel:users:read` | View hotel staff |
| `hotel:users:write` | Add, edit, remove hotel staff |
| `hotel:support:read` | View hotel's support tickets |
| `hotel:support:write` | Raise support tickets |
| `hotel:kiosk:read` | View kiosk data |
| `hotel:kiosk:write` | Manage kiosk configuration |

---

## 6. Known Issues & Technical Notes

| Issue | Detail | Workaround / Status |
|---|---|---|
| Typo: `max_childeren` | The `max_childeren` parameter (misspelt) is accepted alongside `max_children` in room creation/update endpoints for backward compatibility | Kept as dual-accept; `max_childeren` takes precedence if provided |
| Cross-origin cookie limitation | `localhost:3000` → `localhost:8080` cross-origin requests do not auto-send `SameSite=lax` cookies | Resolved: JWT read from `document.cookie` and sent as `Authorization` header |
| Transactional History disabled | The Hotel Admin billing page shows "TRANSACTIONAL HISTORY DISABLED" — historical invoice fetching is not yet implemented | Contact Super Admin for invoice copies via the Helpdesk |
| Kiosk heartbeat alerts | Dashboard shows kiosk heartbeat failures if a kiosk terminal goes offline for > N minutes | Monitor via Super Admin Dashboard → Critical Alerts |
| Analytics engine init | Hotel Dashboard shows "REAL-TIME ANALYTICS ENGINE INITIALIZING" on first load | Resolves in seconds; if persists > 5 min, check backend connectivity |
| `COOKIE_SECURE=False` in compose | Docker Compose sets `COOKIE_SECURE=False` — cookies sent over HTTP | Set to `True` when deploying behind HTTPS in production |
| Inspect DB utilities | `inspect_db.py`, `inspect_db_v2.py` are development-only utilities | Do not use in production |
| `super_healer.py` | A utility script for fixing data inconsistencies (e.g., missing subscriptions) | Run only when needed via `docker exec` |

---

*End of HMS Foundation Technical Documentation — v2.0.0*
