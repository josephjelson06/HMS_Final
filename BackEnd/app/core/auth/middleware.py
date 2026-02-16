from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from sqlalchemy import text
from app.database import get_db


class TenantContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Extract tenant_id from request state (set by Auth dependency)
        tenant_id = getattr(request.state, "tenant_id", None)

        # We need to set the RLS policy if a tenant_id is present
        # This requires a DB session. We'll use a manually created session
        # or rely on the dependency injection system if possible,
        # but middleware runs outside the normal DI scope.

        # In the simplified plan, we'll assume the Auth Router/Dependency sets the
        # DB session configuration or we handle it here.

        return await call_next(request)
