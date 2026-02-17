import json
import os
import sys
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import get_settings
from app.models.plan import Plan

# Setup DB connection
settings = get_settings()
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()


def load_json(filename):
    path = os.path.join(os.path.dirname(__file__), "seeds", filename)
    with open(path, "r") as f:
        return json.load(f)


def seed_plans():
    print("Checking for existing plans...")
    existing_count = db.query(Plan).count()
    if existing_count > 0:
        print(f"Plans already exist ({existing_count}). Skipping.")
        return

    print("Seeding plans from plans_data.json...")
    try:
        p_data_list = load_json("plans_data.json")
        for p_data in p_data_list:
            plan = Plan(
                name=p_data["name"],
                price=p_data["price"],
                rooms=p_data["rooms"],
                kiosks=p_data["kiosks"],
                # subscribers removed
                support=p_data["support"],
                included=p_data["included"],
                theme=p_data["theme"],
            )
            db.add(plan)
        db.commit()
        print("Plans seeded successfully.")
    except Exception as e:
        print(f"Error seeding plans: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_plans()
