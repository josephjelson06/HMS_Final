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

    print(f"Assigning default plan: {default_plan.name} ({default_plan.id})")

    # 2. Find tenants without subscriptions
    all_tenants = db.query(Tenant).all()
    created_count = 0
    for t in all_tenants:
        # Check if subscription exists
        sub_exists = (
            db.query(Subscription).filter(Subscription.tenant_id == t.id).first()
        )
        if not sub_exists:
            # Create one
            new_sub = Subscription(
                tenant_id=t.id,
                plan_id=default_plan.id,
                start_date=datetime.datetime.utcnow(),
                end_date=datetime.datetime.utcnow() + datetime.timedelta(days=30),
                status="active",
            )
            db.add(new_sub)
            created_count += 1
            print(f"Created subscription for tenant: {t.hotel_name}")

    db.commit()
    print(f"Successfully created {created_count} missing subscriptions.")

finally:
    db.close()
