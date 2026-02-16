from __future__ import annotations

from uuid import UUID

from fastapi import HTTPException
from fastapi import Request

from app.modules.tenant.context import AuthContext


def get_auth_context(request: Request) -> AuthContext | None:
    auth_context = getattr(request.state, "auth_context", None)
    if isinstance(auth_context, AuthContext):
        return auth_context
    return None


def require_auth_context(request: Request) -> AuthContext:
    auth_context = get_auth_context(request)
    if auth_context is None:
        raise HTTPException(status_code=401, detail="Authentication context is required.")
    return auth_context


def require_authenticated_user_id(request: Request) -> UUID:
    auth_context = require_auth_context(request)
    if auth_context.user_id is None:
        raise HTTPException(status_code=401, detail="Authenticated user context is required.")
    return auth_context.user_id
