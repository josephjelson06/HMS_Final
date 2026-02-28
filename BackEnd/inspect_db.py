from app.database import SessionLocal
from app.models.billing import Subscription, Plan
from app.models.tenant import Tenant

db = SessionLocal()
try:
    subs = db.query(Subscription).all()
    plans = db.query(Plan).all()
    tenants = db.query(Tenant).all()

    print(f"DEBUG: Found {len(subs)} subscriptions")
    for s in subs:
        print(
            f"  Sub ID: {s.id}, Tenant: {s.tenant_id}, PlanID: {s.plan_id}, Status: {s.status}"
        )

    print(f"DEBUG: Found {len(plans)} plans")
    for p in plans:
        print(f"  Plan ID: {p.id}, Name: {p.name}")

    print(f"DEBUG: Found {len(tenants)} tenants")
    for t in tenants:
        print(f"  Tenant ID: {t.id}, Name: {t.hotel_name}")

finally:
    db.close()
