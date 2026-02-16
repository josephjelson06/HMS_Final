-- Enable RLS for Multi-tenancy
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- users policy: Platform users can see all, Hotel users see only their hotel
DROP POLICY IF EXISTS users_isolation_policy ON users;
CREATE POLICY users_isolation_policy ON users
    USING (
        (current_setting('app.tenant_type', true) = 'platform') OR
        (hotel_id = current_setting('app.tenant_id', true)::integer)
    );

-- roles policy: Similar isolation
DROP POLICY IF EXISTS roles_isolation_policy ON roles;
CREATE POLICY roles_isolation_policy ON roles
    USING (
        (current_setting('app.tenant_type', true) = 'platform') OR
        (hotel_id = current_setting('app.tenant_id', true)::integer)
    );
