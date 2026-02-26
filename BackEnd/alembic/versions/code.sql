-- ============================================================
-- KIOSK + PLATFORM UNIFIED SCHEMA
-- PostgreSQL 15+
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- SECTION 1: PLATFORM LAYER
-- Writer: Platform Module (FastAPI)
-- ============================================================

CREATE TABLE platform_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    status      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE platform_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    name            VARCHAR(255),
    password_hash   TEXT NOT NULL,
    role_id         UUID NOT NULL REFERENCES platform_roles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SECTION 2: BILLING LAYER
-- Writer: Platform Module (FastAPI)
-- ============================================================

CREATE TABLE plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    price           DECIMAL(10, 2) NOT NULL DEFAULT 0.0,
    period_months   INT,
    max_users       INT,
    max_roles       INT,
    max_rooms       INT,
    is_archived     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SECTION 3: TENANT CORE
-- Writer: Platform + Tenant Modules (FastAPI)
-- ============================================================

-- tenants created first WITHOUT owner_user_id FK
-- (circular dependency with tenant_users resolved via ALTER below)
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_name      VARCHAR(255) NOT NULL,
    slug            VARCHAR(100) UNIQUE NOT NULL,
    address         TEXT,
    owner_user_id   UUID,
    plan_id         UUID REFERENCES plans(id),
    gstin           VARCHAR(50),
    pan             VARCHAR(20),
    image_url_1     TEXT,
    image_url_2     TEXT,
    image_url_3     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE tenant_roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name        VARCHAR(100) NOT NULL,
    status      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (tenant_id, name)
);

CREATE TABLE tenant_users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    phone           VARCHAR(20),
    name            VARCHAR(255),
    password_hash   TEXT NOT NULL,
    role_id         UUID NOT NULL REFERENCES tenant_roles(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (tenant_id, email)
);

-- Resolve circular dependency: tenants.owner_user_id -> tenant_users.id
ALTER TABLE tenants
    ADD CONSTRAINT fk_tenants_owner
    FOREIGN KEY (owner_user_id) REFERENCES tenant_users(id);

-- ============================================================
-- SECTION 4: SUBSCRIPTIONS
-- Writer: Platform Module (FastAPI)
-- ============================================================

CREATE TABLE subscriptions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id     UUID NOT NULL REFERENCES plans(id),
    start_date  DATE NOT NULL,
    end_date    DATE,
    status      VARCHAR(20) NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'expired', 'cancelled'))
);

-- Only one active subscription per tenant
CREATE UNIQUE INDEX idx_subscriptions_one_active
    ON subscriptions (tenant_id)
    WHERE status = 'active';

-- ============================================================
-- SECTION 5: PERMISSIONS / RBAC
-- Writer: Platform Module (FastAPI)
-- ============================================================

CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key         VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE platform_role_permissions (
    role_id         UUID NOT NULL REFERENCES platform_roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,

    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE tenant_role_permissions (
    role_id         UUID NOT NULL REFERENCES tenant_roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,

    PRIMARY KEY (role_id, permission_id)
);

-- ============================================================
-- SECTION 6: SUPPORT
-- Writer: Platform Module (FastAPI)
-- ============================================================

CREATE TABLE support_tickets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title       VARCHAR(500) NOT NULL,
    description TEXT,
    category    VARCHAR(50),
    priority    VARCHAR(20) NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high')),
    status      VARCHAR(20) NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'in_progress', 'closed')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SECTION 7: HOTEL OPERATIONS
-- Writer: Tenant Module (FastAPI) | Reader: Kiosk Module
-- ============================================================

CREATE TABLE tenant_configs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID UNIQUE NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    timezone        VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    check_in_time   VARCHAR(10) NOT NULL DEFAULT '14:00',
    check_out_time  VARCHAR(10) NOT NULL DEFAULT '11:00',
    default_lang    VARCHAR(10) NOT NULL DEFAULT 'en',
    welcome_message TEXT,
    logo_url        TEXT,
    support_phone   VARCHAR(20),
    support_email   VARCHAR(255),
    extra           JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE room_types (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    code            VARCHAR(50) NOT NULL,
    description     TEXT,
    base_price      DECIMAL(10, 2) NOT NULL,
    currency        VARCHAR(3) NOT NULL DEFAULT 'INR',
    max_adults      INT NOT NULL DEFAULT 4,
    max_children    INT NOT NULL DEFAULT 3,
    max_occupancy   INT NOT NULL DEFAULT 6,
    amenities       JSONB NOT NULL DEFAULT '[]',
    images          JSONB NOT NULL DEFAULT '[]',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    display_order   INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (tenant_id, code)
);

-- ============================================================
-- SECTION 8: KIOSK RUNTIME
-- Writer: Kiosk Module (Express/Node)
-- ============================================================

CREATE TABLE kiosk_devices (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    device_code     VARCHAR(50) NOT NULL,
    name            VARCHAR(255),
    location        VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'online'
                    CHECK (status IN ('online', 'offline', 'maintenance')),
    last_heartbeat  TIMESTAMPTZ,
    config          JSONB NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (tenant_id, device_code)
);

CREATE TABLE kiosk_sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    device_id       UUID REFERENCES kiosk_devices(id),
    session_token   VARCHAR(255) UNIQUE NOT NULL,
    language        VARCHAR(10) NOT NULL DEFAULT 'en',
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at        TIMESTAMPTZ,
    final_state     VARCHAR(50)
                    CHECK (final_state IN ('COMPLETE', 'IDLE', 'ERROR') OR final_state IS NULL),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- SECTION 9: GUEST SERVICES
-- Writer: Kiosk Module (Express/Node)
-- ============================================================

CREATE TABLE guests (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name   VARCHAR(255) NOT NULL,
    email       VARCHAR(255),
    phone       VARCHAR(50),
    id_type     VARCHAR(50)
                CHECK (id_type IN ('passport', 'aadhar', 'driving_license') OR id_type IS NULL),
    id_number   VARCHAR(100),
    nationality VARCHAR(100),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id      UUID REFERENCES kiosk_sessions(id),
    device_id       UUID REFERENCES kiosk_devices(id),
    guest_id        UUID REFERENCES guests(id),
    room_type_id    UUID NOT NULL REFERENCES room_types(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'confirmed', 'cancelled')),
    adults          INT NOT NULL DEFAULT 1,
    children        INT NOT NULL DEFAULT 0,
    check_in_date   DATE NOT NULL,
    check_out_date  DATE NOT NULL,
    nights          INT NOT NULL DEFAULT 1,
    total_price     DECIMAL(10, 2),
    currency        VARCHAR(3) NOT NULL DEFAULT 'INR',
    guest_name      VARCHAR(255),
    special_requests TEXT,
    idempotency_key VARCHAR(255) UNIQUE,
    confirmed_at    TIMESTAMPTZ,
    cancelled_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_checkout_after_checkin
        CHECK (check_out_date > check_in_date),

    CONSTRAINT chk_positive_guests
        CHECK (adults >= 1 AND children >= 0),

    CONSTRAINT chk_positive_nights
        CHECK (nights >= 1)
);

-- ============================================================
-- SECTION 10: INDEXES
-- ============================================================

-- Auth lookups
CREATE INDEX idx_platform_users_email       ON platform_users(email);
CREATE INDEX idx_tenant_users_email         ON tenant_users(email);

-- Tenant isolation
CREATE INDEX idx_tenant_users_tenant        ON tenant_users(tenant_id);
CREATE INDEX idx_tenant_roles_tenant        ON tenant_roles(tenant_id);
CREATE INDEX idx_subscriptions_tenant       ON subscriptions(tenant_id);
CREATE INDEX idx_support_tickets_tenant     ON support_tickets(tenant_id);
CREATE INDEX idx_tenant_configs_tenant      ON tenant_configs(tenant_id);
CREATE INDEX idx_room_types_tenant          ON room_types(tenant_id);
CREATE INDEX idx_kiosk_devices_tenant       ON kiosk_devices(tenant_id);
CREATE INDEX idx_kiosk_sessions_tenant      ON kiosk_sessions(tenant_id);
CREATE INDEX idx_guests_tenant              ON guests(tenant_id);
CREATE INDEX idx_bookings_tenant            ON bookings(tenant_id);

-- RBAC joins
CREATE INDEX idx_platform_role_perms_role   ON platform_role_permissions(role_id);
CREATE INDEX idx_tenant_role_perms_role     ON tenant_role_permissions(role_id);

-- Kiosk query patterns
CREATE INDEX idx_tenants_slug               ON tenants(slug);
CREATE INDEX idx_room_types_active          ON room_types(tenant_id, is_active);
CREATE INDEX idx_bookings_status            ON bookings(tenant_id, status);
CREATE INDEX idx_bookings_checkin_date      ON bookings(tenant_id, check_in_date);
CREATE INDEX idx_kiosk_sessions_token       ON kiosk_sessions(session_token);
CREATE INDEX idx_kiosk_devices_code         ON kiosk_devices(tenant_id, device_code);

-- ============================================================
-- SECTION 11: ONBOARDING FLOW
-- Execute in this order to handle circular dependency
-- ============================================================

-- STEP 1: Create tenant
-- INSERT INTO tenants (hotel_name, slug, plan_id)
-- VALUES ('Grand Hotel', 'grand-hotel', '<plan_uuid>')
-- RETURNING id;

-- STEP 2: Create "Owner" role for that tenant
-- INSERT INTO tenant_roles (tenant_id, name)
-- VALUES ('<tenant_uuid>', 'Owner')
-- RETURNING id;

-- STEP 3: Assign permissions to the Owner role
-- INSERT INTO tenant_role_permissions (role_id, permission_id)
-- SELECT '<role_uuid>', id FROM permissions
-- WHERE key LIKE 'tenant:%';

-- STEP 4: Create the owner user
-- INSERT INTO tenant_users (tenant_id, email, name, password_hash, role_id)
-- VALUES ('<tenant_uuid>', 'owner@grandhotel.com', 'John Doe', '<hash>', '<role_uuid>')
-- RETURNING id;

-- STEP 5: Link owner back to tenant
-- UPDATE tenants SET owner_user_id = '<user_uuid>'
-- WHERE id = '<tenant_uuid>';

-- STEP 6: Create tenant config
-- INSERT INTO tenant_configs (tenant_id)
-- VALUES ('<tenant_uuid>');