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
        tenant_type = getattr(request.state, "tenant_type", "hotel")
        if tenant_id is not None:
            try:
                db.execute(text(f"SET LOCAL app.tenant_id = '{tenant_id}'"))
                db.execute(text(f"SET LOCAL app.tenant_type = '{tenant_type}'"))
            except Exception as e:
                print(f"Failed to set tenant context: {e}")

    try:
        yield db
    finally:
        db.close()
