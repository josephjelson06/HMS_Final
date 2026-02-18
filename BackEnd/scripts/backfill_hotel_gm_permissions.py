"""
Backfill baseline hotel permissions to existing "General Manager" roles.

Idempotent:
- Creates any missing baseline Permission rows (by permission_key).
- Creates missing RolePermission rows for each GM role (skips existing).

Run (from repo root):
  python BackEnd/scripts/backfill_hotel_gm_permissions.py
"""

from __future__ import annotations

import os
import sys


def _bootstrap_import_path() -> None:
    # Allow `import app.*` when running as a script from repo root.
    here = os.path.abspath(os.path.dirname(__file__))
    backend_root = os.path.abspath(os.path.join(here, ".."))
    if backend_root not in sys.path:
        sys.path.insert(0, backend_root)


_bootstrap_import_path()

from sqlalchemy.orm import Session  # noqa: E402

from app.database import SessionLocal  # noqa: E402
from app.models.hotel import Tenant  # noqa: E402
from app.models.role import Permission, Role, RolePermission  # noqa: E402


BASELINE_HOTEL_PERMISSIONS: dict[str, str] = {
    # read permissions used by hotel pages
    "hotel:dashboard:read": "View hotel dashboard",
    "hotel:guests:read": "View guest registry",
    "hotel:rooms:read": "View rooms",
    "hotel:incidents:read": "View incidents",
    "hotel:users:read": "View hotel staff",
    "hotel:reports:read": "View hotel reports",
    "hotel:settings:read": "View hotel settings",
    "hotel:rates:read": "View rates",
    "hotel:bookings:read": "View bookings",
    "hotel:billing:read": "View billing",
    # write permissions needed for common actions
    "hotel:rooms:write": "Manage rooms",
    "hotel:users:write": "Manage hotel staff",
    "hotel:settings:write": "Manage hotel settings",
}


def ensure_baseline_permissions(db: Session) -> dict[str, Permission]:
    keys = list(BASELINE_HOTEL_PERMISSIONS.keys())
    existing = {
        p.permission_key: p
        for p in db.query(Permission).filter(Permission.permission_key.in_(keys)).all()
    }

    created = 0
    for key, desc in BASELINE_HOTEL_PERMISSIONS.items():
        if key in existing:
            continue
        perm = Permission(permission_key=key, description=desc)
        db.add(perm)
        db.flush()
        existing[key] = perm
        created += 1

    if created:
        print(f"Created {created} missing Permission rows.")
    return existing


def backfill_gm_roles(db: Session, perms_by_key: dict[str, Permission]) -> None:
    gm_roles = (
        db.query(Role)
        .join(Tenant, Tenant.id == Role.tenant_id)
        .filter(Role.name == "General Manager")
        .filter(Tenant.tenant_type == "hotel")
        .all()
    )

    if not gm_roles:
        print('No "General Manager" roles found for hotel tenants. Nothing to do.')
        return

    perm_ids = {p.id for p in perms_by_key.values()}

    roles_updated = 0
    role_perms_added = 0
    for role in gm_roles:
        existing_perm_ids = {
            rp.permission_id
            for rp in db.query(RolePermission)
            .filter(RolePermission.role_id == role.id)
            .all()
        }
        missing = perm_ids - existing_perm_ids
        if not missing:
            continue

        for pid in missing:
            db.add(RolePermission(role_id=role.id, permission_id=pid))
            role_perms_added += 1
        roles_updated += 1

    print(
        f'Updated {roles_updated}/{len(gm_roles)} GM roles; added {role_perms_added} RolePermission rows.'
    )


def main() -> int:
    db = SessionLocal()
    try:
        perms = ensure_baseline_permissions(db)
        backfill_gm_roles(db, perms)
        db.commit()
        return 0
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())

