from uuid import UUID
from app.database import SessionLocal
from app.models.auth import Role

db = SessionLocal()
role_id = UUID("6e907666-5bd1-4387-a2bf-3ad31b3bd373")
role = db.query(Role).filter(Role.id == role_id).first()

if role:
    print(f"Role found: {role.name}")
    print(f"ID: {role.id}")
    print(f"Tenant ID: {role.tenant_id}")
    print(f"Scope: {getattr(role, 'scope', 'N/A')}")
else:
    print("Role NOT found in DB")
