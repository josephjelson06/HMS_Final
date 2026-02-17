from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC
from datetime import datetime
from typing import Literal
from uuid import UUID

from sqlalchemy import func
from sqlalchemy import select
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.auth import RefreshTokenFamily
from app.models.auth import Role
from app.models.auth import Tenant
from app.models.auth import User
from app.models.auth import UserRole
from app.modules.auth.rbac import FIXED_ROLES
from app.modules.auth.passwords import PasswordValidationError
from app.modules.auth.passwords import generate_temporary_password
from app.modules.auth.passwords import hash_password
from app.modules.auth.passwords import verify_password_constant_time
from app.modules.auth.schemas import CredentialCheckRequest
from app.modules.auth.tokens import AccessTokenClaims
from app.modules.auth.tokens import create_access_token


class UserServiceError(Exception):
    status_code = 400

    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class UserConflictError(UserServiceError):
    status_code = 409


class UserNotFoundError(UserServiceError):
    status_code = 404


class InvalidCredentialsError(UserServiceError):
    status_code = 401


class PasswordRuleError(UserServiceError):
    status_code = 422


@dataclass(frozen=True)
class InviteUserResult:
    user_id: UUID
    tenant_id: UUID
    user_type: Literal["platform", "hotel"]
    must_reset_password: bool
    temporary_password: str


@dataclass(frozen=True)
class PasswordResetResult:
    user_id: UUID
    must_reset_password: bool
    revoked_family_count: int
    temporary_password: str


@dataclass(frozen=True)
class PasswordChangeResult:
    user_id: UUID
    must_reset_password: bool
    revoked_family_count: int


@dataclass(frozen=True)
class CredentialCheckResult:
    authenticated: bool
    user_id: UUID | None
    must_reset_password: bool


@dataclass(frozen=True)
class AccessTokenIssueResult:
    token: str
    claims: AccessTokenClaims
    must_reset_password: bool


@dataclass(frozen=True)
class RoleAssignmentResult:
    user_id: UUID
    tenant_id: UUID
    role_name: str
    created: bool


def invite_user(
    db: Session,
    *,
    tenant_id: UUID,
    tenant_type: Literal["platform", "hotel"],
    email: str,
    username: str,
    domain: str | None,
    user_type: Literal["platform", "hotel"],
) -> InviteUserResult:
    _validate_user_type_for_tenant(tenant_type=tenant_type, user_type=user_type)

    temporary_password = generate_temporary_password()
    password_hash = _hash_with_rules(temporary_password)

    user = User(
        tenant_id=tenant_id,
        email=_normalize_email(email),
        username=_normalize_username(username),
        domain=_normalize_domain(domain),
        password_hash=password_hash,
        user_type=user_type,
        must_reset_password=True,
        is_active=True,
    )
    db.add(user)

    try:
        db.flush()
    except IntegrityError as exc:
        raise UserConflictError(
            "User with same email or username already exists in this tenant."
        ) from exc

    return InviteUserResult(
        user_id=user.id,
        tenant_id=tenant_id,
        user_type=user_type,
        must_reset_password=True,
        temporary_password=temporary_password,
    )


def reset_password(
    db: Session,
    *,
    target_user_id: UUID,
) -> PasswordResetResult:
    user = db.get(User, target_user_id)
    if user is None:
        raise UserNotFoundError("User not found.")

    temporary_password = generate_temporary_password()
    password_hash = _hash_with_rules(temporary_password)

    user.password_hash = password_hash
    user.must_reset_password = True
    user.updated_at = datetime.now(UTC)

    revoked_family_count = revoke_all_refresh_token_families(
        db,
        user_id=user.id,
        reason="password_reset",
    )

    db.flush()

    return PasswordResetResult(
        user_id=user.id,
        must_reset_password=True,
        revoked_family_count=revoked_family_count,
        temporary_password=temporary_password,
    )


def change_password(
    db: Session,
    *,
    user_id: UUID,
    current_password: str,
    new_password: str,
) -> PasswordChangeResult:
    user = db.get(User, user_id)
    if user is None:
        verify_password_constant_time(current_password, None)
        raise InvalidCredentialsError("Invalid credentials.")

    if not verify_password_constant_time(current_password, user.password_hash):
        raise InvalidCredentialsError("Invalid credentials.")

    if verify_password_constant_time(new_password, user.password_hash):
        raise PasswordRuleError("New password must be different from current password.")

    user.password_hash = _hash_with_rules(new_password)
    user.must_reset_password = False
    user.updated_at = datetime.now(UTC)

    revoked_family_count = revoke_all_refresh_token_families(
        db,
        user_id=user.id,
        reason="password_change",
    )
    db.flush()

    return PasswordChangeResult(
        user_id=user.id,
        must_reset_password=False,
        revoked_family_count=revoked_family_count,
    )


def check_credentials(
    db: Session,
    *,
    request: CredentialCheckRequest,
) -> CredentialCheckResult:
    user = _find_user_for_login(db, request=request)
    password_hash = user.password_hash if user is not None else None
    authenticated = verify_password_constant_time(request.password, password_hash)

    if not authenticated or user is None:
        return CredentialCheckResult(
            authenticated=False, user_id=None, must_reset_password=False
        )

    return CredentialCheckResult(
        authenticated=True,
        user_id=user.id,
        must_reset_password=user.must_reset_password,
    )


def revoke_all_refresh_token_families(
    db: Session,
    *,
    user_id: UUID,
    reason: str,
) -> int:
    stmt = (
        update(RefreshTokenFamily)
        .where(RefreshTokenFamily.user_id == user_id)
        .where(RefreshTokenFamily.revoked_at.is_(None))
        .values(
            revoked_at=func.now(),
            revoke_reason=reason,
            updated_at=func.now(),
        )
    )
    result = db.execute(stmt)
    return int(result.rowcount or 0)


def issue_access_token_for_credentials(
    db: Session,
    *,
    tenant_id: UUID,
    tenant_type: Literal["platform", "hotel"],
    request: CredentialCheckRequest,
    jwt_secret: str,
    access_token_minutes: int,
    actor_user_id: UUID | None = None,
    acting_as_user_id: UUID | None = None,
) -> AccessTokenIssueResult:
    credential_result = check_credentials(db, request=request)
    if not credential_result.authenticated or credential_result.user_id is None:
        raise InvalidCredentialsError("Invalid credentials.")

    user = db.get(User, credential_result.user_id)
    if user is None:
        raise InvalidCredentialsError("Invalid credentials.")

    token, claims = issue_access_token_for_user(
        db,
        user_id=user.id,
        tenant_id=tenant_id,
        tenant_type=tenant_type,
        jwt_secret=jwt_secret,
        access_token_minutes=access_token_minutes,
        actor_user_id=actor_user_id,
        acting_as_user_id=acting_as_user_id,
    )
    return AccessTokenIssueResult(
        token=token,
        claims=claims,
        must_reset_password=user.must_reset_password,
    )


def list_user_roles(db: Session, *, user_id: UUID, tenant_id: UUID) -> list[str]:
    stmt = (
        select(Role.name)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id)
        .where(UserRole.tenant_id == tenant_id)
        .order_by(Role.name)
    )
    return list(db.execute(stmt).scalars().all())


def issue_access_token_for_user(
    db: Session,
    *,
    user_id: UUID,
    tenant_id: UUID,
    tenant_type: Literal["platform", "hotel"],
    jwt_secret: str,
    access_token_minutes: int,
    actor_user_id: UUID | None = None,
    acting_as_user_id: UUID | None = None,
) -> tuple[str, AccessTokenClaims]:
    roles = list_user_roles(db, user_id=user_id, tenant_id=tenant_id)
    return create_access_token(
        user_id=user_id,
        tenant_id=tenant_id,
        tenant_type=tenant_type,
        roles=roles,
        jwt_secret=jwt_secret,
        access_token_minutes=access_token_minutes,
        actor_user_id=actor_user_id,
        acting_as_user_id=acting_as_user_id,
    )


def issue_impersonation_access_token_for_user(
    db: Session,
    *,
    actor_user_id: UUID,
    acting_as_user_id: UUID,
    tenant_id: UUID,
    tenant_type: Literal["hotel"],
    jwt_secret: str,
    access_token_minutes: int,
) -> tuple[str, AccessTokenClaims]:
    if actor_user_id == acting_as_user_id:
        raise UserServiceError(
            "Impersonation actor and target user cannot be the same."
        )

    return issue_access_token_for_user(
        db,
        user_id=acting_as_user_id,
        tenant_id=tenant_id,
        tenant_type=tenant_type,
        jwt_secret=jwt_secret,
        access_token_minutes=access_token_minutes,
        actor_user_id=actor_user_id,
        acting_as_user_id=acting_as_user_id,
    )


def assign_role_to_user(
    db: Session,
    *,
    tenant_id: UUID,
    tenant_type: Literal["platform", "hotel"],
    target_user_id: UUID,
    role_name: str,
    assigned_by_user_id: UUID | None,
) -> RoleAssignmentResult:
    normalized_role_name = role_name.strip().lower()
    if normalized_role_name not in FIXED_ROLES:
        raise UserServiceError("Unknown role name.")

    user = db.get(User, target_user_id)
    if user is None or user.tenant_id != tenant_id:
        raise UserNotFoundError("User not found.")

    role = db.execute(
        select(Role).where(Role.name == normalized_role_name)
    ).scalar_one_or_none()
    if role is None:
        raise UserServiceError("Role is not available.")
    if role.scope != tenant_type:
        raise UserServiceError("Role scope does not match tenant scope.")

    existing = db.execute(
        select(UserRole)
        .where(UserRole.tenant_id == tenant_id)
        .where(UserRole.user_id == target_user_id)
        .where(UserRole.role_id == role.id)
    ).scalar_one_or_none()
    if existing is not None:
        return RoleAssignmentResult(
            user_id=target_user_id,
            tenant_id=tenant_id,
            role_name=normalized_role_name,
            created=False,
        )

    assignment = UserRole(
        tenant_id=tenant_id,
        user_id=target_user_id,
        role_id=role.id,
        assigned_by_user_id=assigned_by_user_id,
    )
    db.add(assignment)
    db.flush()

    return RoleAssignmentResult(
        user_id=target_user_id,
        tenant_id=tenant_id,
        role_name=normalized_role_name,
        created=True,
    )


def get_tenant_type(db: Session, *, tenant_id: UUID) -> Literal["platform", "hotel"]:
    tenant = db.get(Tenant, tenant_id)
    if tenant is None:
        raise UserServiceError("Tenant not found.")
    if tenant.tenant_type not in {"platform", "hotel"}:
        raise UserServiceError("Tenant type is invalid.")
    return tenant.tenant_type


def _find_user_for_login(
    db: Session, *, request: CredentialCheckRequest
) -> User | None:
    if request.email:
        stmt = select(User).where(
            func.lower(User.email) == _normalize_email(request.email)
        )
        return db.execute(stmt).scalar_one_or_none()

    stmt = (
        select(User)
        .where(func.lower(User.username) == _normalize_username(request.username or ""))
        .where(func.lower(User.domain) == _normalize_domain(request.domain or ""))
    )
    return db.execute(stmt).scalar_one_or_none()


def _hash_with_rules(password: str) -> str:
    try:
        return hash_password(password)
    except PasswordValidationError as exc:
        raise PasswordRuleError(str(exc)) from exc


def _validate_user_type_for_tenant(*, tenant_type: str, user_type: str) -> None:
    if tenant_type == "platform" and user_type != "platform":
        raise UserServiceError("Platform tenant can only create platform users.")
    if tenant_type == "hotel" and user_type != "hotel":
        raise UserServiceError("Hotel tenant can only create hotel users.")


def _normalize_email(value: str) -> str:
    return value.strip().lower()


def _normalize_username(value: str) -> str:
    return value.strip().lower()


def _normalize_domain(value: str | None) -> str | None:
    if value is None:
        return None
    normalized = value.strip().lower()
    return normalized or None
