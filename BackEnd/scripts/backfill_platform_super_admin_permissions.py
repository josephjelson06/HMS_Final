"""
Backfill platform permissions to Super Admin role and assign a platform admin user.

Idempotent:
- Creates missing platform Permission rows.
- Creates (or updates) a global "Super Admin" role.
- Creates missing RolePermission links for that role.
- Assigns the role to a target platform user (defaults to admin@atc.com).

Run (from repo root):
  python BackEnd/scripts/backfill_platform_super_admin_permissions.py

Optional env:
  PLATFORM_ADMIN_EMAIL=admin@atc.com
"""

from __future__ import annotations

import os
import sys


def _bootstrap_import_path() -> None:
    here = os.path.abspath(os.path.dirname(__file__))
    backend_root = os.path.abspath(os.path.join(here, ".."))
    if backend_root not in sys.path:
        sys.path.insert(0, backend_root)


_bootstrap_import_path()

from fastapi import HTTPException  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.database import SessionLocal  # noqa: E402
from app.models.hotel import Tenant  # noqa: E402
from app.models.role import Permission, Role, RolePermission, UserRole  # noqa: E402
from app.models.user import User  # noqa: E402


PLATFORM_ADMIN_EMAIL = os.getenv("PLATFORM_ADMIN_EMAIL", "admin@atc.com")


PLATFORM_PERMISSIONS: dict[str, str] = {
    "platform:hotels:read": "View hotels",
    "platform:hotels:write": "Manage hotels",
    "platform:plans:read": "View plans",
    "platform:plans:write": "Manage plans",
    "platform:users:read": "View platform users",
    "platform:users:write": "Manage platform users",
    "platform:roles:read": "View platform roles",
    "platform:roles:write": "Manage platform roles",
    "platform:subscriptions:read": "View subscriptions",
    "platform:subscriptions:write": "Manage subscriptions",
    "platform:invoices:read": "View invoices",
    "platform:invoices:write": "Manage invoices",
}


def ensure_platform_permissions(db: Session) -> dict[str, Permission]:
    keys = list(PLATFORM_PERMISSIONS.keys())
    existing = {
        p.permission_key: p
        for p in db.query(Permission).filter(Permission.permission_key.in_(keys)).all()
    }

    created = 0
    for key, desc in PLATFORM_PERMISSIONS.items():
        if key in existing:
            continue
        perm = Permission(permission_key=key, description=desc)
        db.add(perm)
        db.flush()
        existing[key] = perm
        created += 1

    if created:
        print(f"Created {created} missing platform Permission rows.")
    return existing


def ensure_super_admin_role(db: Session) -> Role:
    role = db.query(Role).filter(Role.tenant_id.is_(None), Role.name == "Super Admin").first()
    if role:
        # keep consistent baseline defaults
        role.color = role.color or "red"
        role.status = role.status or "Active"
        db.flush()
        return role

    role = Role(
        tenant_id=None,
        name="Super Admin",
        description="Global platform administrator",
        color="red",
        status="Active",
    )
    db.add(role)
    db.flush()
    print("Created global role: Super Admin")
    return role


def ensure_role_permissions(db: Session, role: Role, perms_by_key: dict[str, Permission]) -> None:
    existing_perm_ids = {
        rp.permission_id
        for rp in db.query(RolePermission).filter(RolePermission.role_id == role.id).all()
    }

    added = 0
    for perm in perms_by_key.values():
        if perm.id in existing_perm_ids:
            continue
        db.add(RolePermission(role_id=role.id, permission_id=perm.id))
        added += 1

    print(f"Super Admin role permissions added: {added}")


def ensure_platform_admin_assignment(db: Session, role: Role, email: str) -> None:
    user = db.query(User).filter(User.email == email, User.user_type == "platform").first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"Platform user '{email}' not found",
        )

    if not user.tenant_id:
        platform_tenant = db.query(Tenant).filter(Tenant.tenant_type == "platform").first()
        if not platform_tenant:
            raise HTTPException(status_code=400, detail="Platform tenant not found")
        user.tenant_id = platform_tenant.id
        db.flush()

    exists = (
        db.query(UserRole)
        .filter(
            UserRole.user_id == user.id,
            UserRole.role_id == role.id,
            UserRole.tenant_id == user.tenant_id,
        )
        .first()
    )
    if exists:
        print(f"UserRole already exists for {email} -> Super Admin")
        return

    db.add(
        UserRole(
            tenant_id=user.tenant_id,
            user_id=user.id,
            role_id=role.id,
        )
    )
    print(f"Assigned Super Admin role to {email}")


def main() -> int:
    db = SessionLocal()
    try:
        perms = ensure_platform_permissions(db)
        super_admin = ensure_super_admin_role(db)
        ensure_role_permissions(db, super_admin, perms)
        ensure_platform_admin_assignment(db, super_admin, PLATFORM_ADMIN_EMAIL)
        db.commit()
        print("Platform RBAC backfill completed.")
        return 0
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
