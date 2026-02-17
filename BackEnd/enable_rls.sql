-- Enable RLS for Multi-tenancy
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE kiosks ENABLE ROW LEVEL SECURITY;

-- tenants policy: Platform users see all, others see only their own
DROP POLICY IF EXISTS tenants_isolation_policy ON tenants;
CREATE POLICY tenants_isolation_policy ON tenants
    USING (
        (current_setting('app.tenant_type', true) = 'platform') OR
        (id = current_setting('app.tenant_id', true)::uuid)
    );

-- users policy
DROP POLICY IF EXISTS users_isolation_policy ON users;
CREATE POLICY users_isolation_policy ON users
    USING (
        (current_setting('app.tenant_type', true) = 'platform') OR
        (tenant_id = current_setting('app.tenant_id', true)::uuid)
    );

-- roles policy
DROP POLICY IF EXISTS roles_isolation_policy ON roles;
CREATE POLICY roles_isolation_policy ON roles
    USING (
        (current_setting('app.tenant_type', true) = 'platform') OR
        (tenant_id = current_setting('app.tenant_id', true)::uuid)
    );

-- buildings policy
DROP POLICY IF EXISTS buildings_isolation_policy ON buildings;
CREATE POLICY buildings_isolation_policy ON buildings
    USING (
        (current_setting('app.tenant_type', true) = 'platform') OR
        (tenant_id = current_setting('app.tenant_id', true)::uuid)
    );

-- room_categories policy
DROP POLICY IF EXISTS room_categories_isolation_policy ON room_categories;
CREATE POLICY room_categories_isolation_policy ON room_categories
    USING (
        (current_setting('app.tenant_type', true) = 'platform') OR
        (tenant_id = current_setting('app.tenant_id', true)::uuid)
    );

-- rooms policy
DROP POLICY IF EXISTS rooms_isolation_policy ON rooms;
CREATE POLICY rooms_isolation_policy ON rooms
    USING (
        (current_setting('app.tenant_type', true) = 'platform') OR
        (tenant_id = current_setting('app.tenant_id', true)::uuid)
    );

-- incidents policy
DROP POLICY IF EXISTS incidents_isolation_policy ON incidents;
CREATE POLICY incidents_isolation_policy ON incidents
    USING (
        (current_setting('app.tenant_type', true) = 'platform') OR
        (tenant_id = current_setting('app.tenant_id', true)::uuid)
    );

-- tickets policy
DROP POLICY IF EXISTS tickets_isolation_policy ON tickets;
CREATE POLICY tickets_isolation_policy ON tickets
    USING (
        (current_setting('app.tenant_type', true) = 'platform') OR
        (tenant_id = current_setting('app.tenant_id', true)::uuid)
    );

-- invoices policy
DROP POLICY IF EXISTS invoices_isolation_policy ON invoices;
CREATE POLICY invoices_isolation_policy ON invoices
    USING (
        (current_setting('app.tenant_type', true) = 'platform') OR
        (tenant_id = current_setting('app.tenant_id', true)::uuid)
    );

-- kiosks policy
DROP POLICY IF EXISTS kiosks_isolation_policy ON kiosks;
CREATE POLICY kiosks_isolation_policy ON kiosks
    USING (
        (current_setting('app.tenant_type', true) = 'platform') OR
        (tenant_id = current_setting('app.tenant_id', true)::uuid)
    );
