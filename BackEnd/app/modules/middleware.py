from __future__ import annotations

from collections.abc import Awaitable
from collections.abc import Callable

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.modules.auth.rbac import AuthorizationError
from app.modules.auth.rbac import ensure_user_type_scope
from app.modules.tenant.context import TenantContextResolutionError
from app.modules.tenant.context import resolve_auth_context


class AuthorizationScopeMiddleware(BaseHTTPMiddleware):
    """
    Enforce role scope consistency (platform vs hotel) for authenticated contexts.
    """

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        try:
            auth_context = resolve_auth_context(request)
            if auth_context is not None:
                ensure_user_type_scope(auth_context)
        except TenantContextResolutionError as exc:
            return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
        except AuthorizationError as exc:
            return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})

        return await call_next(request)
