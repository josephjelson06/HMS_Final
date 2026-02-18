# Backend Recovery And Refactor Plan (Post-Deletion, CRUD + Minimal Auth)

## Summary
You deleted core backend foundations that the remaining code still depends on.  
The biggest deletions are: `app/core/config.py`, `app/core/auth/*`, `app/models/auth.py`, all `app/modules/*`, plus seed/utility files.  
Current remaining routers/services/models still import these deleted paths, so the backend is structurally broken at import/runtime level.

This plan restores bootability first, then refactors into a clean, maintainable structure while keeping current API contracts stable.

## What Was Broken By The Deletions
1. Configuration/session bootstrap is broken: `BackEnd/app/database.py` imports deleted `app.core.config`.
2. App startup is broken: `BackEnd/app/main.py` imports deleted `app.core.auth.middleware`.
3. Model graph is broken: `BackEnd/app/models/hotel.py`, `BackEnd/app/models/user.py`, `BackEnd/app/models/role.py` still alias deleted `app.models.auth`.
4. Router dependencies are broken: multiple routers import deleted `app.modules.rbac`, `app.modules.limits`, and deleted auth helpers.
5. Service imports are broken: `BackEnd/app/services/hotel_service.py` imports deleted model/auth utilities.
6. Alembic/autogenerate path is broken or incomplete due removed model module references.
7. Seed/bootstrap pipeline is removed (per your choice: this will stay removed, but manual bootstrap docs are required).

## Target Structure (Final State)
1. `BackEnd/app/core/` contains only runtime fundamentals:
- `config.py`
- `auth/security.py`
- `auth/dependencies.py`

2. `BackEnd/app/models/` contains canonical domain models:
- `hotel.py` (tenant/hotel entity)
- `user.py`
- `role.py` (role + permission link entities)
- `plan.py`
- `room.py`
- `invoice.py`
- `auth.py` as compatibility re-export only (temporary shim, no business logic)

3. `BackEnd/app/modules/` is reduced to only currently used policy helpers:
- `rbac.py` (minimal permission gate)
- `limits.py` (plan limits)

4. `BackEnd/app/routers/` and `BackEnd/app/services/` depend only on canonical model/core paths.

## Refactor Phases

## Phase 1: Restore Bootable Foundations
1. Recreate `BackEnd/app/core/config.py` with minimal `Settings`:
- `DATABASE_URL`
- `JWT_SECRET`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- cookie basics used by `auth_simple`.
2. Update `BackEnd/app/database.py` to use the restored settings.
3. Update `BackEnd/app/main.py`:
- remove deleted middleware import/registration or replace with minimal live middleware only if required.
- keep current router registration order and route paths unchanged.
4. Add missing package `__init__.py` files where needed for explicit import hygiene.

## Phase 2: Rebuild Model Layer Properly
1. Replace alias-only `BackEnd/app/models/hotel.py` with concrete tenant/hotel model definition (same table/column names as before to avoid DB breakage).
2. Replace alias-only `BackEnd/app/models/user.py` with concrete `User` definition.
3. Replace alias-only `BackEnd/app/models/role.py` with concrete `Role`, `Permission`, `RolePermission`, `UserRole` definitions.
4. Recreate `BackEnd/app/models/auth.py` as compatibility exports only to avoid immediate broad import churn.
5. Validate all model relationships in `BackEnd/app/models/room.py` and `BackEnd/app/models/invoice.py` resolve correctly to restored entities.

## Phase 3: Minimal Auth (Chosen Scope)
1. Recreate `BackEnd/app/core/auth/security.py` with only required functions used today:
- `verify_password`
- `get_password_hash`
- `create_access_token`
2. Recreate `BackEnd/app/core/auth/dependencies.py` with `get_current_user` reading cookie/bearer token.
3. Keep `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/me PATCH` contracts unchanged in `BackEnd/app/routers/auth_simple.py`.
4. Remove any dependency on advanced tenant-context/audit/impersonation flow (out of chosen scope).

## Phase 4: Minimal Authorization + Limits (No Advanced RBAC Engine)
1. Recreate `BackEnd/app/modules/rbac.py` with `require_permission(permission)` minimal behavior:
- enforce authenticated user.
- enforce scope by permission prefix (`platform:*` requires `user_type=platform`; `hotel:*` allows hotel/platform).
2. Recreate `BackEnd/app/modules/limits.py` with current plan cap checks:
- `check_user_limit`
- `check_role_limit`
- `check_room_limit`
3. Keep permission-related router endpoints live (`BackEnd/app/routers/permissions.py`, `BackEnd/app/routers/roles.py`) using restored role/permission tables.

## Phase 5: Router/Service Import Cleanup
1. Normalize imports in all routers/services to canonical modules (or compatibility shim where migration is staged).
2. Remove stale imports to deleted modules across:
- `BackEnd/app/routers/*.py`
- `BackEnd/app/services/hotel_service.py`
3. Replace `print`/`traceback.print_exc()` patterns with structured logging for all router exception paths.
4. Keep existing URL and payload contracts stable (no frontend-breaking route changes).

## Phase 6: Migration + Manual Bootstrap (No Seeds)
1. Fix `BackEnd/alembic/env.py` model imports to restored canonical model files.
2. Ensure `target_metadata` includes all active models.
3. Add manual bootstrap instructions to `BackEnd/README.md`:
- create at least one plan row
- create one platform tenant linked to plan
- create one platform admin user with hashed password
- optionally create baseline permissions/roles
4. Do not restore seed scripts/data (per your choice).

## Phase 7: Verification And Acceptance
1. Structural checks:
- import graph resolves (no missing `app.*` modules).
- `python -m compileall BackEnd/app` passes.
2. Startup checks:
- app imports and starts successfully.
- `/health` returns 200.
3. Auth checks:
- `/auth/login` works with valid/invalid credentials.
- `/auth/me` requires auth and returns current user.
4. Core CRUD checks:
- hotels/plans/users/roles/rooms/subscriptions routers all load and execute basic happy paths.
5. Permission checks:
- platform-only endpoints reject hotel user.
- hotel-scope endpoints reject unauthenticated user.

## Public API/Interface Changes
1. No endpoint removals planned.
2. Existing router paths and payload shapes remain the compatibility target.
3. Internal auth/permission enforcement becomes minimal and deterministic (scope-based), not advanced role-graph driven.
4. Seed endpoints/scripts remain removed; bootstrap becomes manual/documented.

## Assumptions And Defaults (Locked)
1. Scope is `CRUD only, minimal auth`.
2. No seed restoration; manual DB/bootstrap only.
3. API stability is prioritized; internal cleanup is allowed without changing existing contracts.
4. Advanced features deleted by you (tenant-context middleware stack, audit, impersonation, refresh-token family engine) stay out of scope unless explicitly re-requested.
