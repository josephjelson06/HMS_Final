import json
import os
import sys

# Add the project root to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app.models.plan import Plan


def seed_plans():
    # Drop and recreate plans table for clean schema update
    from sqlalchemy import text

    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS plans CASCADE"))
        conn.commit()

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # Clear existing plans for a clean re-seed
        db.query(Plan).delete()

        with open("plans_data.json", "r") as f:
            plans_data = json.load(f)

        for p_data in plans_data:
            plan = Plan(
                name=p_data["name"],
                price=p_data["price"],
                rooms=p_data["rooms"],
                kiosks=p_data["kiosks"],
                subscribers=p_data["subscribers"],
                support=p_data["support"],
                included=p_data["included"],
                theme=p_data["theme"],
            )
            db.add(plan)

        db.commit()
        print(f"Successfully seeded {len(plans_data)} plans.")
    except Exception as e:
        print(f"Error seeding plans: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_plans()
