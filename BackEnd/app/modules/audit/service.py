from __future__ import annotations

from typing import Any
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.auth import AuditLog


def append_audit_log(
    db: Session,
    *,
    tenant_id: UUID,
    action: str,
    metadata: dict[str, Any] | None = None,
    actor_user_id: UUID | None = None,
    acting_as_user_id: UUID | None = None,
) -> AuditLog:
    row = AuditLog(
        tenant_id=tenant_id,
        actor_user_id=actor_user_id,
        acting_as_user_id=acting_as_user_id,
        action=action,
        metadata_json=metadata or {},
    )
    db.add(row)
    db.flush()
    return row


def list_audit_logs(
    db: Session,
    *,
    tenant_id: UUID,
    limit: int,
) -> list[AuditLog]:
    stmt = (
        select(AuditLog)
        .where(AuditLog.tenant_id == tenant_id)
        .order_by(AuditLog.created_at.desc())
        .limit(limit)
    )
    return list(db.execute(stmt).scalars().all())
