from __future__ import annotations

import os
import sys


def _bootstrap_path() -> None:
    script_dir = os.path.abspath(os.path.dirname(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)


_bootstrap_path()

from app.database import SessionLocal
from app.models.user import User
from app.models.role import Role, Permission, RolePermission, UserRole


def main() -> int:
    db = SessionLocal()
    try:
        gm_users = db.query(User).filter(User.email.like("gm@%")).all()
        if not gm_users:
            print("No GM users found.")
            return 0

        for user in gm_users:
            print("=" * 40)
            print(f"GM user {user.email} (tenant {user.tenant_id})")
            ur_records = (
                db.query(UserRole).filter(UserRole.user_id == user.id).all()
            )
            if not ur_records:
                print("  -> No roles assigned.")
                continue

            for ur in ur_records:
                role = db.query(Role).filter(Role.id == ur.role_id).one()
                print(f"  Role {role.name} ({role.id})")
                perms = (
                    db.query(Permission.permission_key)
                    .join(RolePermission, RolePermission.permission_id == Permission.id)
                    .filter(RolePermission.role_id == role.id)
                    .all()
                )
                if not perms:
                    print("    -> No permissions assigned.")
                    continue

                print(f"    -> {len(perms)} permissions")
                for perm in perms:
                    print("     ", perm[0])
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    raise SystemExit(main())
