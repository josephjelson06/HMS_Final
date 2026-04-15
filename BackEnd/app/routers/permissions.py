from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.permissions import PermissionRead
from app.services.permission_service import PermissionService
from app.modules.rbac import require_permission

router = APIRouter(prefix="/api/permissions", tags=["Permissions"])


@router.get("", response_model=List[PermissionRead])
def get_permissions(
    db: Session = Depends(get_db),
    _=Depends(
        require_permission(["platform:roles:read", "hotel:roles:read"])
    ),  # Allow both platform and hotel admins to see permissions list for role management
):
    service = PermissionService(db)
    return service.get_all()
