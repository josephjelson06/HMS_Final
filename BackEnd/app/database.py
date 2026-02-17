from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from app.core.config import get_settings
from fastapi import Request

settings = get_settings()

engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# Request is optional because seeds might use it without request
def get_db(request: Request = None):
    db = SessionLocal()

    # Apply RLS if request context has tenant_id
    if request and hasattr(request, "state"):
        tenant_id = getattr(request.state, "tenant_id", None)
        tenant_type = getattr(request.state, "tenant_type", "hotel")

        if tenant_id is not None:
            # print(f"DEBUG: Setting RLS context for {tenant_id} ({tenant_type})")
            try:
                # Set session-local variables for RLS
                db.execute(
                    text("SELECT set_config('app.tenant_id', :tenant_id, true)"),
                    {"tenant_id": str(tenant_id)},
                )
                db.execute(
                    text("SELECT set_config('app.tenant_type', :tenant_type, true)"),
                    {"tenant_type": str(tenant_type)},
                )
            except Exception as e:
                # We log but don't crash here to allow health checks/auth routes
                print(f"Failed to set tenant context: {e}")

    try:
        yield db
    finally:
        db.close()
