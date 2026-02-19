# Database Architecture Analysis

## 1. Overview

This is the database layer of a **Hotel Management System (HMS)** SaaS platform built with **FastAPI + SQLAlchemy + PostgreSQL 15** (Dockerized). The system is designed around two foundational patterns:

| Pattern           | Implementation                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| **Multi-tenancy** | Shared database, tenant-scoped rows via `tenant_id` FK on most tables                                     |
| **RBAC**          | Role-Based Access Control with a full `permissions → role_permissions → roles → user_roles → users` chain |

The database has **11 tables** across **7 model files**, managed through a single Alembic migration and bootstrapped via 3 seed/backfill scripts.

**Database connection**: `postgresql://postgres:postgres@hms_postgres:5432/hms_db` (via Docker Compose). SQLAlchemy engine uses `pool_pre_ping=True` for connection health checks.

---

## 2. Tables & Entities

### 2.1 `plans`

**Purpose**: Subscription tiers that tenants are assigned to. Controls capacity limits.

| Column        | Type                     | Role                                 |
| ------------- | ------------------------ | ------------------------------------ |
| `id`          | UUID (PK)                | Auto-generated primary key           |
| `name`        | String (unique, indexed) | Plan display name (e.g. "Free Plan") |
| `price`       | Float                    | Monthly price                        |
| `rooms`       | Integer                  | Max rooms allowed                    |
| `kiosks`      | Integer                  | Max kiosks allowed                   |
| `support`     | String                   | Support level (e.g. "Email")         |
| `included`    | JSON                     | List of included features            |
| `theme`       | String                   | UI theme identifier                  |
| `max_roles`   | Integer (default: 5)     | Max roles per tenant                 |
| `max_users`   | Integer (default: 10)    | Max users per tenant                 |
| `is_archived` | Boolean (default: false) | Soft-archive flag                    |

**Constraints**: Unique on `name`.
**Foreign keys**: None (root entity).

> [!NOTE]
> The `plans` table is a **root dependency** — `tenants.plan_id` references it, so a plan must exist before any tenant can be created.

---

### 2.2 `tenants`

**Purpose**: Represents an organization/hotel. This is the multi-tenancy anchor. The model is aliased as both `Tenant` and `Hotel` in the codebase (`Hotel = Tenant`).

| Column                    | Type                               | Role                                     |
| ------------------------- | ---------------------------------- | ---------------------------------------- |
| `id`                      | UUID (PK)                          | Auto-generated primary key               |
| `name`                    | String (indexed)                   | Display name                             |
| `tenant_key`              | String (unique, indexed)           | Slug-style unique identifier             |
| `tenant_type`             | String (indexed, default: "hotel") | Discriminator: `"platform"` or `"hotel"` |
| `owner`                   | String                             | Owner name (nullable)                    |
| `email`                   | String (indexed)                   | Contact email                            |
| `mobile`                  | String                             | Contact phone                            |
| `gstin`                   | String                             | Tax ID (India: GST)                      |
| `pan`                     | String                             | PAN number                               |
| `legal_name`              | String                             | Registered legal name                    |
| `logo`                    | String                             | Logo URL/path                            |
| `address`                 | String                             | Physical address                         |
| `plan_id`                 | UUID (FK → `plans.id`)             | **Required** subscription plan           |
| `kiosks`                  | Integer (default: 0)               | Kiosks provisioned                       |
| `status`                  | String (default: "Onboarding")     | Lifecycle state                          |
| `mrr`                     | Float (default: 0.0)               | Monthly recurring revenue                |
| `is_auto_renew`           | Boolean (default: true)            | Auto-renewal flag                        |
| `subscription_start_date` | String                             | ISO date string                          |
| `subscription_end_date`   | String                             | ISO date string                          |
| `created_at`              | DateTime                           | Creation timestamp                       |
| `updated_at`              | DateTime                           | Auto-updated on changes                  |

**Constraints**: Unique on `tenant_key`.
**Foreign keys**: `plan_id → plans.id`.
**Relationships**: `users`, `roles` (back_populates); eager-loaded `plan_rel → Plan`.

> [!IMPORTANT]
> The `tenant_type` column is crucial. The value `"platform"` denotes the system-level tenant (ATC Platform), while `"hotel"` denotes actual hotel businesses. This is how platform-level admin data is co-located with hotel data in the same table.

---

### 2.3 `users`

**Purpose**: All human users of the system — both platform admins and hotel staff.

| Column                | Type                               | Role                                     |
| --------------------- | ---------------------------------- | ---------------------------------------- |
| `id`                  | UUID (PK)                          | Auto-generated primary key               |
| `tenant_id`           | UUID (FK → `tenants.id`, nullable) | Tenant scope                             |
| `email`               | String (unique, indexed)           | Login identifier                         |
| `username`            | String (unique, indexed, nullable) | Alternative identifier                   |
| `name`                | String                             | Display name                             |
| `employee_id`         | String (indexed, nullable)         | HR identifier                            |
| `department`          | String                             | Department name                          |
| `mobile`              | String                             | Phone number                             |
| `avatar`              | String                             | Avatar URL/path                          |
| `password_hash`       | String (nullable)                  | Bcrypt hash                              |
| `user_type`           | String (indexed, default: "hotel") | Discriminator: `"platform"` or `"hotel"` |
| `is_active`           | Boolean (default: true)            | Active/disabled toggle                   |
| `must_reset_password` | Boolean (default: false)           | Force password reset                     |
| `created_at`          | DateTime                           | Creation timestamp                       |
| `updated_at`          | DateTime                           | Auto-updated on changes                  |

**Constraints**: Unique on `email`, unique on `username`.
**Foreign keys**: `tenant_id → tenants.id`.
**Relationships**: `tenant` (back_populates), `user_roles` (cascade delete-orphan).

> [!NOTE]
> `tenant_id` is **nullable**, meaning a user can theoretically exist without a tenant. The bootstrap script resolves this by assigning the platform tenant. `user_type` mirrors `tenant_type` for quick filtering without joining.

---

### 2.4 `roles`

**Purpose**: Named roles (e.g. "Super Admin", "General Manager", "Receptionist") scoped to a tenant.

| Column        | Type                               | Role                               |
| ------------- | ---------------------------------- | ---------------------------------- |
| `id`          | UUID (PK)                          | Auto-generated primary key         |
| `tenant_id`   | UUID (FK → `tenants.id`, nullable) | Tenant scope; `NULL` = global role |
| `name`        | String (indexed)                   | Role name                          |
| `description` | String                             | Human-readable description         |
| `color`       | String (default: "blue")           | UI display color                   |
| `status`      | String (default: "Active")         | Active/Inactive                    |
| `created_at`  | DateTime                           | Creation timestamp                 |
| `updated_at`  | DateTime                           | Auto-updated on changes            |

**Constraints**: `UniqueConstraint("tenant_id", "name")` — role names are unique per tenant.
**Foreign keys**: `tenant_id → tenants.id`.
**Relationships**: `tenant`, `role_permissions` (cascade delete-orphan), `user_roles` (cascade delete-orphan).

> [!IMPORTANT]
> When `tenant_id` is `NULL`, the role is **global** (platform-wide). The "Super Admin" role is created this way by the backfill script. Hotel-specific roles like "General Manager" have a non-null `tenant_id`.

---

### 2.5 `permissions`

**Purpose**: Flat catalog of all permission keys in the system. Global (not tenant-scoped).

| Column           | Type                     | Role                                           |
| ---------------- | ------------------------ | ---------------------------------------------- |
| `id`             | UUID (PK)                | Auto-generated primary key                     |
| `permission_key` | String (unique, indexed) | Namespaced key (e.g. `"platform:hotels:read"`) |
| `description`    | String                   | Human-readable description                     |
| `created_at`     | DateTime                 | Creation timestamp                             |

**Constraints**: Unique on `permission_key`.
**Foreign keys**: None.
**Relationships**: `role_permissions` (cascade delete-orphan).

The system defines two permission namespaces:

- **`platform:*`** — 12 keys (hotels, plans, users, roles, subscriptions, invoices × read/write)
- **`hotel:*`** — 13 keys (dashboard, guests, rooms, incidents, users, reports, settings, rates, bookings, billing × read + rooms, users, settings × write)

---

### 2.6 `role_permissions` _(Junction Table)_

**Purpose**: Links roles to permissions. **Each row = one permission assigned to one role.**

| Column          | Type                         | Role                      |
| --------------- | ---------------------------- | ------------------------- |
| `id`            | UUID (PK)                    | Surrogate primary key     |
| `role_id`       | UUID (FK → `roles.id`)       | The role                  |
| `permission_id` | UUID (FK → `permissions.id`) | The permission            |
| `created_at`    | DateTime                     | When the link was created |

**Constraints**: `UniqueConstraint("role_id", "permission_id")` — prevents duplicate assignments.
**Foreign keys**: `role_id → roles.id`, `permission_id → permissions.id`.

> [!TIP]
> This is why you see repeated rows when querying roles with their permissions. If "Super Admin" has 12 permissions, there will be **12 rows** in `role_permissions` for that single role. This is standard relational M:N modeling.

---

### 2.7 `user_roles` _(Junction Table)_

**Purpose**: Links users to roles within a tenant context. **Each row = one role assigned to one user in one tenant.**

| Column       | Type                     | Role                            |
| ------------ | ------------------------ | ------------------------------- |
| `id`         | UUID (PK)                | Surrogate primary key           |
| `tenant_id`  | UUID (FK → `tenants.id`) | **Required** tenant scope       |
| `user_id`    | UUID (FK → `users.id`)   | The user                        |
| `role_id`    | UUID (FK → `roles.id`)   | The role                        |
| `created_at` | DateTime                 | When the assignment was created |

**Constraints**: `UniqueConstraint("tenant_id", "user_id", "role_id")` — a user can hold a given role only once per tenant.
**Foreign keys**: `tenant_id → tenants.id`, `user_id → users.id`, `role_id → roles.id`.

> [!IMPORTANT]
> The triple-key unique constraint means the same user **can** hold the same role in **different** tenants. This is the multi-tenancy RBAC mechanism — roles are assigned per-tenant.

---

### 2.8 `buildings`

**Purpose**: Physical buildings within a hotel property.

| Column      | Type                         | Role                   |
| ----------- | ---------------------------- | ---------------------- |
| `id`        | Integer (PK, auto-increment) | Sequential primary key |
| `name`      | String (indexed)             | Building name          |
| `tenant_id` | UUID (FK → `tenants.id`)     | Tenant scope           |

**Foreign keys**: `tenant_id → tenants.id`.
**Relationships**: `rooms` (cascade delete-orphan).

---

### 2.9 `room_categories`

**Purpose**: Room type definitions (e.g. "Standard", "Deluxe") with pricing.

| Column      | Type                     | Role                                      |
| ----------- | ------------------------ | ----------------------------------------- |
| `id`        | String (PK)              | Human-readable ID (e.g. `"rt1"`, `"STD"`) |
| `name`      | String (indexed)         | Category display name                     |
| `rate`      | Float                    | Nightly rate                              |
| `occupancy` | Integer                  | Max guests                                |
| `amenities` | String                   | Comma-separated amenity list              |
| `tenant_id` | UUID (FK → `tenants.id`) | Tenant scope                              |

**Foreign keys**: `tenant_id → tenants.id`.
**Relationships**: `rooms` (cascade delete-orphan).

---

### 2.10 `rooms`

**Purpose**: Individual rooms within a hotel.

| Column        | Type                               | Role                       |
| ------------- | ---------------------------------- | -------------------------- |
| `id`          | String (PK)                        | Room number (e.g. `"101"`) |
| `floor`       | Integer                            | Floor number               |
| `status`      | String (default: "CLEAN_VACANT")   | Housekeeping status        |
| `type`        | String (default: "Hostel Room")    | Room type label            |
| `building_id` | Integer (FK → `buildings.id`)      | Parent building            |
| `category_id` | String (FK → `room_categories.id`) | Room category              |
| `tenant_id`   | UUID (FK → `tenants.id`)           | Tenant scope               |

**Foreign keys**: `building_id → buildings.id`, `category_id → room_categories.id`, `tenant_id → tenants.id`.
**Relationships**: `building`, `category` (back_populates).

---

### 2.11 `invoices`

**Purpose**: Billing invoices for tenant subscriptions.

| Column         | Type                     | Role                                 |
| -------------- | ------------------------ | ------------------------------------ |
| `id`           | UUID (PK)                | Auto-generated primary key           |
| `tenant_id`    | UUID (FK → `tenants.id`) | Tenant scope                         |
| `amount`       | Float                    | Invoice amount                       |
| `status`       | String                   | Status: "Paid", "Overdue", "Pending" |
| `period_start` | String                   | Billing period start (ISO string)    |
| `period_end`   | String                   | Billing period end (ISO string)      |
| `generated_on` | String                   | Generation timestamp (ISO string)    |
| `due_date`     | String                   | Payment due date                     |

**Foreign keys**: `tenant_id → tenants.id`.
**Note**: Has a `hotel_id` property alias that returns `tenant_id` for backward compatibility.

---

## 3. Relationships

### 3.1 One-to-Many

```mermaid
graph LR
    Plans["plans"] -->|1:N| Tenants["tenants"]
    Tenants -->|1:N| Users["users"]
    Tenants -->|1:N| Roles["roles"]
    Tenants -->|1:N| Buildings["buildings"]
    Tenants -->|1:N| RoomCategories["room_categories"]
    Tenants -->|1:N| Rooms["rooms"]
    Tenants -->|1:N| Invoices["invoices"]
    Buildings -->|1:N| Rooms
    RoomCategories -->|1:N| Rooms
```

| Parent            | Child             | FK Column                   | Nullable |
| ----------------- | ----------------- | --------------------------- | -------- |
| `plans`           | `tenants`         | `tenants.plan_id`           | **No**   |
| `tenants`         | `users`           | `users.tenant_id`           | Yes      |
| `tenants`         | `roles`           | `roles.tenant_id`           | Yes      |
| `tenants`         | `buildings`       | `buildings.tenant_id`       | Yes      |
| `tenants`         | `room_categories` | `room_categories.tenant_id` | Yes      |
| `tenants`         | `rooms`           | `rooms.tenant_id`           | Yes      |
| `tenants`         | `invoices`        | `invoices.tenant_id`        | Yes      |
| `buildings`       | `rooms`           | `rooms.building_id`         | Yes      |
| `room_categories` | `rooms`           | `rooms.category_id`         | Yes      |

### 3.2 Many-to-Many (via Junction Tables)

```mermaid
graph LR
    Roles["roles"] <-->|M:N via role_permissions| Permissions["permissions"]
    Users["users"] <-->|M:N via user_roles| Roles
```

| Relationship               | Junction Table     | Key Columns                       | Unique Constraint     |
| -------------------------- | ------------------ | --------------------------------- | --------------------- |
| Roles ↔ Permissions        | `role_permissions` | `role_id`, `permission_id`        | `uq_role_permissions` |
| Users ↔ Roles (per tenant) | `user_roles`       | `tenant_id`, `user_id`, `role_id` | `uq_user_roles`       |

### 3.3 Junction Tables

| Table              | Purpose                           | Why it looks like "repeated rows"             |
| ------------------ | --------------------------------- | --------------------------------------------- |
| `role_permissions` | Assigns permissions to roles      | If a role has 12 permissions, you see 12 rows |
| `user_roles`       | Assigns roles to users per tenant | If a user has 3 roles, you see 3 rows         |

---

## 4. Data Flow & Patterns

### 4.1 System Bootstrap Flow

```mermaid
sequenceDiagram
    participant BS as bootstrap_db.py
    participant DB as Database
    BS->>DB: 1. Create "Free Plan" (if missing)
    BS->>DB: 2. Create "ATC Platform" tenant (type=platform)
    BS->>DB: 3. Create admin@atc.com user (type=platform)
```

### 4.2 RBAC Backfill Flow

```mermaid
sequenceDiagram
    participant BF as backfill_platform_super_admin_permissions.py
    participant DB as Database
    BF->>DB: 1. Ensure 12 platform:* permission rows exist
    BF->>DB: 2. Ensure "Super Admin" role exists (tenant_id=NULL)
    BF->>DB: 3. Create RolePermission links for all 12 permissions
    BF->>DB: 4. Create UserRole linking admin@atc.com → Super Admin
```

### 4.3 RBAC Authorization Chain

To determine what a user can do:

```
User → user_roles (filtered by tenant_id)
     → Role
     → role_permissions
     → Permission.permission_key
```

**Example**: "Can admin@atc.com manage hotels?"

1. Find `user_roles` rows for the user's ID → gets `role_id`(s)
2. Find `role_permissions` rows for those role IDs → gets `permission_id`(s)
3. Check if `permission_key = "platform:hotels:write"` exists in those permissions

### 4.4 Multi-Tenancy Pattern

- `tenants` is the central anchor; `tenant_id` appears on: `users`, `roles`, `user_roles`, `buildings`, `room_categories`, `rooms`, `invoices`
- The `tenant_type` discriminator (`"platform"` vs `"hotel"`) separates system-level data from hotel business data **within the same tables**
- There is no row-level security at the DB level; tenant scoping is enforced in application code (queries filter by `tenant_id`)

### 4.5 Key Design Patterns

| Pattern                            | Where                                                               |
| ---------------------------------- | ------------------------------------------------------------------- |
| **Single-table multi-tenancy**     | `tenants` with `tenant_type` discriminator                          |
| **RBAC with junction tables**      | `role_permissions` + `user_roles`                                   |
| **Global vs tenant-scoped roles**  | `roles.tenant_id = NULL` for global roles                           |
| **Soft archive**                   | `plans.is_archived`                                                 |
| **Backward compatibility aliases** | `Hotel = Tenant`, `Invoice.hotel_id` property                       |
| **Cascade delete-orphan**          | On `user_roles`, `role_permissions` from parent `User` and `Role`   |
| **Surrogate UUID PKs**             | All major entities use UUID v4                                      |
| **String PKs for domain entities** | `rooms.id` and `room_categories.id` use business-meaningful strings |

---

## 5. Migrations & Scripts

### 5.1 Alembic Migration

| Item                | Value                                 |
| ------------------- | ------------------------------------- |
| **Migration count** | 1 (single initial schema migration)   |
| **Revision**        | `a118201e2c39` ("Inital_Schema")      |
| **Created**         | 2026-02-19 04:27:26                   |
| **Down revision**   | None (first migration)                |
| **Auto-generated**  | Yes (with `# please adjust!` comment) |

The migration creates all 11 tables with proper foreign keys, indexes, and unique constraints. The `downgrade()` drops all tables in reverse dependency order.

### 5.2 Seed / Backfill Scripts

#### [bootstrap_db.py](file:///c:/Users/josep/Desktop/HMS_Final/BackEnd/scripts/bootstrap_db.py)

- **Purpose**: Creates the absolute minimum data to start the system
- **Creates**: 1 Plan → 1 Platform Tenant → 1 Admin User
- **Idempotent**: Yes — checks for existing rows before creating
- **Admin credentials**: `admin@atc.com` / `password123`

#### [backfill_platform_super_admin_permissions.py](file:///c:/Users/josep/Desktop/HMS_Final/BackEnd/scripts/backfill_platform_super_admin_permissions.py)

- **Purpose**: Sets up the full platform RBAC layer
- **Creates**: 12 platform permissions → "Super Admin" role → RolePermission links → UserRole assignment
- **Idempotent**: Yes — skips existing rows at every step
- **Configurable**: `PLATFORM_ADMIN_EMAIL` env var (defaults to `admin@atc.com`)

#### [backfill_hotel_gm_permissions.py](file:///c:/Users/josep/Desktop/HMS_Final/BackEnd/scripts/backfill_hotel_gm_permissions.py)

- **Purpose**: Backfills baseline hotel permissions to all existing "General Manager" roles
- **Creates**: 13 hotel permissions → RolePermission links for each GM role
- **Idempotent**: Yes — queries for existing RolePermission rows before adding
- **Scope**: Only affects roles named "General Manager" under `hotel`-type tenants

### 5.3 Script Execution Order

The scripts must be run in this specific order:

```
1. alembic upgrade head          ← creates all tables
2. python scripts/bootstrap_db.py                           ← creates plan, tenant, user
3. python scripts/backfill_platform_super_admin_permissions.py  ← platform RBAC
4. python scripts/backfill_hotel_gm_permissions.py              ← hotel RBAC (only if hotels exist)
```

---

## 6. Observations & Insights

### Why `Hotel = Tenant`?

The system likely started as a hotel management tool and evolved into a multi-tenant SaaS platform. Rather than renaming all references, the codebase uses `Hotel = Tenant` as a backward-compatible alias. Routers and schemas can still reference "Hotel" while the underlying table is `tenants`.

### Why `tenant_id` is nullable on `users` and `roles`?

- **Users**: Allows creating users before assigning them a tenant (the bootstrap script demonstrates this pattern).
- **Roles**: Allows **global roles** (like "Super Admin") that aren't scoped to any single tenant. This is essential for platform-level administration.

### Why separate `user_type` and `tenant_type`?

Both serve as discriminators, but `user_type` on the `users` table avoids a JOIN to `tenants` when you just need to filter "give me all platform users." It's a **denormalization for query performance**.

### Why String PKs on rooms/room_categories?

These entities use business-meaningful identifiers (room numbers like "101", category codes like "STD"). This simplifies lookups but introduces the risk of collisions across tenants — mitigated by filtering on `tenant_id`.

### Why ISO date strings instead of DateTime for subscriptions and invoices?

Likely a pragmatic decision for simpler frontend serialization. Dates stored as strings avoid timezone complexities but sacrifice DB-level date operations (comparisons, range queries, etc.).

---

## 7. Potential Issues / Risks

> [!CAUTION]
>
> ### 7.1 Missing `ON DELETE` cascades at the DB level
>
> SQLAlchemy ORM cascades (`cascade="all, delete-orphan"`) only work when deleting via the ORM Session. Raw SQL deletes or deletes from PgAdmin will leave orphaned rows. No `ON DELETE CASCADE` is set on any foreign key in the migration.

> [!WARNING]
>
> ### 7.2 String-typed dates on `invoices` and `tenants`
>
> `subscription_start_date`, `subscription_end_date`, `period_start`, `period_end`, `due_date`, and `generated_on` are all `String` columns. This prevents:
>
> - Native date comparison queries (`WHERE due_date < NOW()`)
> - Proper sorting by date
> - Database-level validation of date format

> [!WARNING]
>
> ### 7.3 No tenant-scoping uniqueness on `rooms` and `room_categories`
>
> The `rooms.id` (room number) and `room_categories.id` (category code) are String PKs with no composite uniqueness with `tenant_id`. Two hotels could theoretically collide if they use the same room number or category ID, since primary keys are globally unique. In practice, this means room numbers must be **globally unique across all hotels**, not just within one hotel.

> [!NOTE]
>
> ### 7.4 No audit trail
>
> There is no `created_by` or `updated_by` column on any table. For a multi-user system, there's no way to trace who made a change. The `created_at` / `updated_at` timestamps exist but lack actor attribution.

### 7.5 `amenities` stored as comma-separated String

The `room_categories.amenities` column stores amenities as a comma-separated string. This makes it impossible to query/filter by individual amenities at the DB level without string manipulation functions.

### 7.6 Nullable FK columns without explicit ON DELETE behavior

Most `tenant_id` foreign keys are nullable (`rooms`, `buildings`, `room_categories`, `invoices`), meaning records could exist without a tenant reference. This could lead to orphaned data if a tenant is deleted.

### 7.7 `password_hash` is nullable

The `users.password_hash` is nullable, which could allow users to exist without passwords. While this may be intentional (for SSO users, perhaps), there's no explicit mechanism to handle authentication for users with null passwords.

---

## 8. Mental Model

> **Think of this database as a company directory for hotel businesses.**

### The Hierarchy

```
Plans (subscription tiers)
  └── Tenants (hotels / platform)
        ├── Users (staff members)
        ├── Roles (job titles with permissions)
        │     └── RolePermissions (what each role can do)
        ├── UserRoles (who has which role)
        ├── Buildings
        │     └── Rooms
        ├── RoomCategories
        └── Invoices
```

### Simple Rules

1. **Each row in `role_permissions`** = one permission assigned to one role. If "Super Admin" has 12 permissions, you see 12 rows. **This is normal.** This is NOT data duplication — it's a many-to-many relationship being expressed.

2. **Each row in `user_roles`** = one role assigned to one user in one tenant. If admin@atc.com has 1 role in the platform tenant, there's 1 row. If they were also added to a hotel tenant with 2 roles, there'd be 3 rows total.

3. **`tenants` table holds BOTH the platform itself AND hotel businesses.** The `tenant_type` column tells them apart. The "ATC Platform" is just another tenant with `type = "platform"`.

4. **Global roles** (like "Super Admin") have `tenant_id = NULL` in the `roles` table. Hotel-specific roles (like "General Manager") have a real tenant_id.

5. **Everything is scoped by `tenant_id`** — rooms, buildings, users, roles, invoices. If you query without filtering by `tenant_id`, you get data from ALL hotels mixed together.

6. **The permission key format** is `scope:resource:action`:
   - `platform:hotels:read` → platform scope, hotels resource, read action
   - `hotel:rooms:write` → hotel scope, rooms resource, write action

### Why You See "Repeated Rows"

When you query roles with their permissions (e.g., via a JOIN or eager loading), the role's columns repeat for every permission it has. This is because the database is expressing: "This role has permission A, AND this role has permission B, AND this role has permission C…"

Each row is a **unique combination** of (role + permission). The role data appears repeated because the permission data is different on each row.

---

## 9. Summary

- **11 tables** across a single PostgreSQL database (`hms_db`), managed via SQLAlchemy ORM + Alembic migrations
- **Multi-tenant SaaS architecture** using a shared database with `tenant_id` columns for row-level scoping; the platform itself is modeled as a special tenant (`tenant_type = "platform"`)
- **Full RBAC system** with `permissions → role_permissions → roles → user_roles → users` chain, supporting both global and tenant-scoped roles
- **3 idempotent seed scripts** establish the bootstrap data: a default plan, the platform tenant, an admin user, and all permission/role assignments
- **Junction tables (`role_permissions`, `user_roles`) are the reason for "repeated rows"** — this is the correct relational pattern for many-to-many relationships, not data duplication
- **Key risks**: missing DB-level cascades, string-typed date columns, and room IDs that must be globally unique across all hotels
- **The system is still early-stage** — single Alembic migration, no audit trail, and some schema decisions (string dates, comma-separated amenities) suggest rapid prototyping with known trade-offs
