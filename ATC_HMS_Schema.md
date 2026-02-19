---

# 🧾 FINAL SCHEMA (REWRITTEN)

---

## ------------------------------

## PLATFORM LAYER

## ------------------------------

### platform_roles

```sql
platform_roles
- id (UUID, PK)
- name (VARCHAR, UNIQUE, NOT NULL)
- status (BOOLEAN, DEFAULT TRUE)
- created_at (TIMESTAMP)
```

---

### platform_users

```sql
platform_users
- id (UUID, PK)
- email (VARCHAR, UNIQUE, NOT NULL)
- phone (VARCHAR)
- name (VARCHAR)
- password_hash (TEXT, NOT NULL)
- role_id (UUID, FK -> platform_roles.id, NOT NULL)
- created_at (TIMESTAMP)
```

---

## ------------------------------

## TENANT (CORE BUSINESS)

## ------------------------------

### tenants

```sql
tenants
- id (UUID, PK)
- hotel_name (VARCHAR, NOT NULL)
- address (TEXT)

-- IMPORTANT: nullable initially to avoid circular dependency
- owner_user_id (UUID, FK -> tenant_users.id, NULL)

- plan_id (UUID, FK -> plans.id)
- gstin (VARCHAR, NULL)
- pan (VARCHAR, NULL)

- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

### tenant_users

```sql
tenant_users
- id (UUID, PK)

-- TENANT ISOLATION
- tenant_id (UUID, FK -> tenants.id, NOT NULL)

- email (VARCHAR, NOT NULL)
- phone (VARCHAR)
- name (VARCHAR)

- password_hash (TEXT, NOT NULL)

- role_id (UUID, FK -> tenant_roles.id, NOT NULL)

- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

-- Prevent duplicate users inside same tenant
UNIQUE (tenant_id, email)
```

---

### tenant_roles

```sql
tenant_roles
- id (UUID, PK)
- tenant_id (UUID, FK -> tenants.id, NOT NULL)

- name (VARCHAR, NOT NULL)
- status (BOOLEAN, DEFAULT TRUE)

- created_at (TIMESTAMP)

-- Prevent duplicate roles per tenant
UNIQUE (tenant_id, name)
```

---

## ------------------------------

## BILLING / PLAN LAYER

## ------------------------------

### plans

```sql
plans
- id (UUID, PK)
- name (VARCHAR, NOT NULL)

- period_months (INT) -- 1, 3, 6, 12

- max_users (INT)
- max_roles (INT)
- max_rooms (INT)

- created_at (TIMESTAMP)
```

---

### subscriptions

```sql
subscriptions
- id (UUID, PK)
- tenant_id (UUID, FK -> tenants.id, NOT NULL)

- start_date (DATE)
- end_date (DATE)

- status (VARCHAR) 
  -- "active", "expired", "cancelled"

-- Optional but recommended (Postgres partial index)
-- Ensure only one active subscription
-- UNIQUE (tenant_id) WHERE status = 'active'
```

---

## ------------------------------

## SUPPORT SYSTEM

## ------------------------------

### support_tickets

```sql
support_tickets
- id (UUID, PK)
- tenant_id (UUID, FK -> tenants.id, NOT NULL)

- title (VARCHAR, NOT NULL)
- description (TEXT)

- category (VARCHAR)
- priority (VARCHAR) 
  -- "low", "medium", "high"

- status (VARCHAR) 
  -- "open", "in_progress", "closed"

- created_at (TIMESTAMP)
```

---

## ------------------------------

## PERMISSIONS / RBAC

## ------------------------------

### permissions

```sql
permissions
- id (UUID, PK)

- key (VARCHAR, UNIQUE, NOT NULL)
  -- format: <scope>:<resource>:<action>
  -- example: "tenant:users:read"

- description (TEXT)
```

---

### platform_role_permissions

```sql
platform_role_permissions
- role_id (UUID, FK -> platform_roles.id, NOT NULL)
- permission_id (UUID, FK -> permissions.id, NOT NULL)

PRIMARY KEY (role_id, permission_id)
```

---

### tenant_role_permissions

```sql
tenant_role_permissions
- role_id (UUID, FK -> tenant_roles.id, NOT NULL)
- permission_id (UUID, FK -> permissions.id, NOT NULL)

PRIMARY KEY (role_id, permission_id)
```

---

## ------------------------------

## INDEXES (MANDATORY)

## ------------------------------

```sql
-- Tenant isolation performance
INDEX tenant_users(tenant_id)
INDEX tenant_roles(tenant_id)
INDEX subscriptions(tenant_id)
INDEX support_tickets(tenant_id)

-- RBAC joins
INDEX tenant_role_permissions(role_id)
INDEX platform_role_permissions(role_id)

-- Auth
INDEX tenant_users(email)
INDEX platform_users(email)
```

---

# 🔐 CRITICAL RULES (ENFORCE IN APP LOGIC)

## 1. Tenant Ownership Integrity

```text
tenants.owner_user_id MUST belong to same tenant
```

---

## 2. Role-Tenant Consistency

```text
tenant_users.tenant_id == tenant_roles.tenant_id
```

---

## 3. Mandatory Tenant Scoping

Every query:

```sql
WHERE tenant_id = ?
```

---

# 🔁 FINAL ONBOARDING FLOW (ALIGNED WITH THIS SCHEMA)

```
1. Create tenant (owner_user_id = NULL)
2. Create tenant role (Owner)
3. Assign permissions
4. Create tenant user (manager)
5. Update tenants.owner_user_id
```

---