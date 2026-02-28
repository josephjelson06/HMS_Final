from app.database import SessionLocal
from app.models.billing import Subscription, Plan
from app.models.tenant import Tenant
import json

db = SessionLocal()
try:
    subs = db.query(Subscription).all()
    plans = db.query(Plan).all()
    tenants = db.query(Tenant).all()

    data = {
        "subscriptions": [
            {
                "id": str(s.id),
                "tenant_id": str(s.tenant_id),
                "plan_id": str(s.plan_id),
                "status": s.status,
            }
            for s in subs
        ],
        "plans": [{"id": str(p.id), "name": p.name, "price": p.price} for p in plans],
        "tenants": [{"id": str(t.id), "name": t.hotel_name} for t in tenants],
    }
    print(json.dumps(data, indent=2))

finally:
    db.close()
