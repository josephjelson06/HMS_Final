from __future__ import annotations

from contextvars import ContextVar
from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.modules.tenant.context import AuthContext


@dataclass(frozen=True)
class AuditRuntimeContext:
    db: Session
    auth_context: AuthContext | None


_audit_runtime_context: ContextVar[AuditRuntimeContext | None] = ContextVar(
    "audit_runtime_context",
    default=None,
)


def set_audit_runtime_context(*, db: Session, auth_context: AuthContext | None) -> object:
    return _audit_runtime_context.set(AuditRuntimeContext(db=db, auth_context=auth_context))


def reset_audit_runtime_context(token: object) -> None:
    _audit_runtime_context.reset(token)  # type: ignore[arg-type]


def get_audit_runtime_context() -> AuditRuntimeContext | None:
    return _audit_runtime_context.get()
