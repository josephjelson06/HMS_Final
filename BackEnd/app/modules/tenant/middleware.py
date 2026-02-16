from __future__ import annotations

from collections.abc import Awaitable
from collections.abc import Callable

from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.db.session import create_session
from app.modules.audit.context import reset_audit_runtime_context
from app.modules.audit.context import set_audit_runtime_context
from app.modules.tenant.context import AuthContext
from app.modules.tenant.context import TenantContextResolutionError
from app.modules.tenant.context import resolve_auth_context


class TenantContextError(Exception):
    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class TenantContextMiddleware(BaseHTTPMiddleware):
    """
    Request-scoped DB session + DB tenant context propagation.

    This middleware runs after authentication in the final architecture.
    Until auth is implemented, auth context is resolved from header-based stub.
    """

    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Awaitable[Response]]
    ) -> Response:
        session = create_session()
        request.state.db = session
        audit_context_token = None

        try:
            with session.begin():
                session.execute(text("SET LOCAL ROLE auth_runtime;"))
                auth_context = resolve_auth_context(request)
                audit_context_token = set_audit_runtime_context(
                    db=session, auth_context=auth_context
                )
                if auth_context is not None:
                    self._validate_tenant_scope(session, auth_context)
                    session.execute(
                        text("SELECT set_config('app.tenant_id', :tenant_id, true);"),
                        {"tenant_id": str(auth_context.tenant_id)},
                    )

                response = await call_next(request)
                return response
        except TenantContextResolutionError as exc:
            session.rollback()
            return JSONResponse(
                status_code=exc.status_code, content={"detail": exc.detail}
            )
        except TenantContextError as exc:
            session.rollback()
            return JSONResponse(
                status_code=exc.status_code, content={"detail": exc.message}
            )
        except SQLAlchemyError:
            session.rollback()
            raise
        except Exception:
            session.rollback()
            raise
        finally:
            if audit_context_token is not None:
                reset_audit_runtime_context(audit_context_token)
            session.close()

    @staticmethod
    def _validate_tenant_scope(session, auth_context: AuthContext) -> None:
        row = session.execute(
            text("SELECT tenant_type FROM tenants WHERE id = :tenant_id"),
            {"tenant_id": str(auth_context.tenant_id)},
        ).first()

        if row is None:
            raise TenantContextError(
                "Authenticated tenant was not found.", status_code=401
            )

        tenant_type_in_db = row[0]
        if tenant_type_in_db != auth_context.tenant_type.value:
            raise TenantContextError(
                "Authenticated tenant scope mismatch between context and database.",
                status_code=403,
            )
