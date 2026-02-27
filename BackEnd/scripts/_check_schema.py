import sys

sys.path.append("/app")
from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(
        text(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name='plans' ORDER BY ordinal_position"
        )
    )
    cols = [r[0] for r in result]
    print("plans columns:", cols)

    result2 = conn.execute(
        text(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema='public' ORDER BY table_name"
        )
    )
    tables = [r[0] for r in result2]
    print("tables:", tables)
