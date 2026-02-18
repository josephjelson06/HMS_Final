from __future__ import annotations

from fastapi import Depends, HTTPException, status

from app.core.auth.dependencies import get_current_user
from app.models.user import User


def require_permission(permission: str):
    """Minimal scope-based gate.

    - Requires authentication.
    - `platform:*` requires `user_type=platform`.
    - `hotel:*` allows `user_type=hotel` and `user_type=platform`.
    """

    required_scope = permission.split(":", 1)[0].lower() if ":" in permission else ""

    def dependency(current_user: User = Depends(get_current_user)) -> User:
        user_type = (current_user.user_type or "").lower()

        if required_scope == "platform" and user_type != "platform":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Platform scope required",
            )

        if required_scope == "hotel" and user_type not in {"hotel", "platform"}:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Hotel scope required",
            )

        return current_user

    return dependency
