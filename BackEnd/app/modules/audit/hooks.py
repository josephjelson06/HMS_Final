from __future__ import annotations

import logging
from typing import Any
from uuid import UUID

from app.modules.audit.context import get_audit_runtime_context
from app.modules.audit.service import append_audit_log

logger = logging.getLogger(__name__)


def _coerce_uuid(value: UUID | str | None) -> UUID | None:
    if value is None:
        return None
    if isinstance(value, UUID):
        return value
    return UUID(str(value))


def audit_event_stub(
    *,
    action: str,
    metadata: dict[str, Any] | None = None,
    tenant_id: UUID | str | None = None,
    actor_user_id: UUID | str | None = None,
    acting_as_user_id: UUID | str | None = None,
) -> None:
    runtime_context = get_audit_runtime_context()
    if runtime_context is None:
        logger.info("audit_no_runtime_context action=%s metadata=%s", action, metadata or {})
        return

    auth_context = runtime_context.auth_context
    resolved_tenant_id = _coerce_uuid(tenant_id) or (auth_context.tenant_id if auth_context else None)
    if resolved_tenant_id is None:
        logger.warning("audit_event_dropped_missing_tenant action=%s metadata=%s", action, metadata or {})
        return

    resolved_actor_user_id = _coerce_uuid(actor_user_id)
    resolved_acting_as_user_id = _coerce_uuid(acting_as_user_id)

    if auth_context is not None:
        if resolved_actor_user_id is None:
            resolved_actor_user_id = auth_context.actor_user_id or auth_context.user_id
        if resolved_acting_as_user_id is None:
            resolved_acting_as_user_id = auth_context.acting_as_user_id

    append_audit_log(
        runtime_context.db,
        tenant_id=resolved_tenant_id,
        action=action,
        metadata=metadata or {},
        actor_user_id=resolved_actor_user_id,
        acting_as_user_id=resolved_acting_as_user_id,
    )
