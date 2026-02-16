from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import get_settings
from fastapi import Request

settings = get_settings()

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


# Request is optional because seeds might use it without request
def get_db(request: Request = None):
    db = SessionLocal()

    # Apply RLS if request context has tenant_id
    if request and hasattr(request, "state"):
        tenant_id = getattr(request.state, "tenant_id", None)
        if tenant_id:
            # Check if tenant_id is int or uuid.
            # Our Hotel ID is int.
            # Postgres SET LOCAL usually takes string.
            # RLS Policy: USING (tenant_id = current_setting('app.tenant_id')::integer)
            try:
                db.execute(text(f"SET LOCAL app.tenant_id = '{tenant_id}'"))
            except Exception as e:
                print(f"Failed to set tenant context: {e}")

    try:
        yield db
    finally:
        db.close()
