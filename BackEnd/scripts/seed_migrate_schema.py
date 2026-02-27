"""
SEED PREREQUISITE — Apply schema migrations to Neon DB
=====================================================
Run this BEFORE seed_00_platform.py

The code.sql defines the full desired schema but the live Neon DB
may be missing columns/tables from earlier versions.

This script applies missing schema changes safely using
IF NOT EXISTS and DO $$ ... $$ blocks so it is idempotent.
"""

import sys
import os
import logging

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from sqlalchemy import text

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

MIGRATIONS = [
    # ── plans table additions ──────────────────────────────────────────
    (
        "plans.price column",
        "ALTER TABLE plans ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) NOT NULL DEFAULT 0.0;",
    ),
    (
        "plans.is_archived column",
        "ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;",
    ),
    (
        "plans.created_at column",
        "ALTER TABLE plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();",
    ),
    # ── tenants table additions ────────────────────────────────────────
    (
        "tenants.slug column",
        "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS slug VARCHAR(100);",
    ),
    (
        "tenants.image_url_1 column",
        "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS image_url_1 TEXT;",
    ),
    (
        "tenants.image_url_2 column",
        "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS image_url_2 TEXT;",
    ),
    (
        "tenants.image_url_3 column",
        "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS image_url_3 TEXT;",
    ),
    (
        "tenants.updated_at column",
        "ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();",
    ),
    # ── tenant_users.updated_at ────────────────────────────────────────
    (
        "tenant_users.updated_at column",
        "ALTER TABLE tenant_users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();",
    ),
    # ── subscriptions.plan_id ─────────────────────────────────────────
    (
        "subscriptions.plan_id column",
        "ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id);",
    ),
    # ── New tables ────────────────────────────────────────────────────
    (
        "tenant_configs table",
        """
        CREATE TABLE IF NOT EXISTS tenant_configs (
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
        """,
    ),
    (
        "room_types table",
        """
        CREATE TABLE IF NOT EXISTS room_types (
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
        """,
    ),
    (
        "kiosk_devices table",
        """
        CREATE TABLE IF NOT EXISTS kiosk_devices (
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
        """,
    ),
    (
        "kiosk_sessions table",
        """
        CREATE TABLE IF NOT EXISTS kiosk_sessions (
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
        """,
    ),
    (
        "guests table",
        """
        CREATE TABLE IF NOT EXISTS guests (
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
        """,
    ),
    (
        "bookings table",
        """
        CREATE TABLE IF NOT EXISTS bookings (
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
            CONSTRAINT chk_checkout_after_checkin CHECK (check_out_date > check_in_date),
            CONSTRAINT chk_positive_guests CHECK (adults >= 1 AND children >= 0),
            CONSTRAINT chk_positive_nights CHECK (nights >= 1)
        );
        """,
    ),
    # ── Indexes (safe with IF NOT EXISTS) ─────────────────────────────
    (
        "idx_room_types_tenant",
        "CREATE INDEX IF NOT EXISTS idx_room_types_tenant ON room_types(tenant_id);",
    ),
    (
        "idx_room_types_active",
        "CREATE INDEX IF NOT EXISTS idx_room_types_active ON room_types(tenant_id, is_active);",
    ),
    (
        "idx_kiosk_devices_tenant",
        "CREATE INDEX IF NOT EXISTS idx_kiosk_devices_tenant ON kiosk_devices(tenant_id);",
    ),
    (
        "idx_kiosk_devices_code",
        "CREATE INDEX IF NOT EXISTS idx_kiosk_devices_code ON kiosk_devices(tenant_id, device_code);",
    ),
    (
        "idx_kiosk_sessions_tenant",
        "CREATE INDEX IF NOT EXISTS idx_kiosk_sessions_tenant ON kiosk_sessions(tenant_id);",
    ),
    (
        "idx_kiosk_sessions_token",
        "CREATE INDEX IF NOT EXISTS idx_kiosk_sessions_token ON kiosk_sessions(session_token);",
    ),
    (
        "idx_guests_tenant",
        "CREATE INDEX IF NOT EXISTS idx_guests_tenant ON guests(tenant_id);",
    ),
    (
        "idx_bookings_tenant",
        "CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);",
    ),
    (
        "idx_bookings_status",
        "CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(tenant_id, status);",
    ),
    (
        "idx_bookings_checkin_date",
        "CREATE INDEX IF NOT EXISTS idx_bookings_checkin_date ON bookings(tenant_id, check_in_date);",
    ),
    (
        "idx_tenants_slug",
        "CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);",
    ),
    (
        "idx_tenant_configs_tenant",
        "CREATE INDEX IF NOT EXISTS idx_tenant_configs_tenant ON tenant_configs(tenant_id);",
    ),
]


def run():
    logger.info("Applying schema migrations to Neon DB...")
    with engine.begin() as conn:
        for name, sql in MIGRATIONS:
            try:
                conn.execute(text(sql.strip()))
                logger.info(f"  ✓ {name}")
            except Exception as e:
                logger.warning(f"  ⚠ {name}: {e}")

    logger.info("\n✅ Schema migration complete. You can now run the seed files.")


if __name__ == "__main__":
    run()
