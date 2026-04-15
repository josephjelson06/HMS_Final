from app.database import SessionLocal
from app.models.billing import Subscription, Plan
from app.models.tenant import Tenant
import datetime

db = SessionLocal()
try:
    # 1. Get default plan
    default_plan = (
        db.query(Plan).filter(Plan.name == "Professional").first()
        or db.query(Plan).first()
    )
    if not default_plan:
        print("Error: No plans found to assign.")
        exit(1)

    print(f"Using plan for healing: {default_plan.name} ({default_plan.id})")

    # 2. Heal Tenants and Subscriptions
    tenants = db.query(Tenant).all()
    print(f"Total Tenants in DB: {len(tenants)}")

    for t in tenants:
        modified = False

        # Ensure Tenant record has plan_id
        if not t.plan_id:
            t.plan_id = default_plan.id
            modified = True
            print(f"  -> Assigned plan_id to Tenant: {t.hotel_name}")

        # Ensure Subscription exists
        sub = db.query(Subscription).filter(Subscription.tenant_id == t.id).first()
        if not sub:
            sub = Subscription(
                tenant_id=t.id,
                plan_id=t.plan_id,
                start_date=datetime.datetime.utcnow(),
                end_date=datetime.datetime.utcnow() + datetime.timedelta(days=30),
                status="active",
            )
            db.add(sub)
            modified = True
            print(
                f"  -> Created missing subscription for: {t.hotel_name} (Status: active)"
            )
        else:
            # Ensure sub.plan_id matches t.plan_id
            if not sub.plan_id:
                sub.plan_id = t.plan_id
                modified = True
                print(f"  -> Fixed missing plan_id in existing sub for: {t.hotel_name}")

        # Always ensure status is 'active' for demo purposes if it was missing
        if not sub.status:
            sub.status = "active"
            modified = True

    db.commit()
    print("Optimization complete. All hotels now synchronized.")

finally:
    db.close()
