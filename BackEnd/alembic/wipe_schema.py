import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from sqlalchemy import text

print("Wiping database schema...")
with engine.begin() as conn:
    conn.execute(
        text(
            "DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO public;"
        )
    )
print("Schema wiped successfully.")
