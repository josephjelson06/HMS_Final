from __future__ import annotations

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import Field
from pydantic import model_validator


class InviteUserRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    username: str = Field(min_length=3, max_length=120)
    domain: str | None = Field(default=None, max_length=120)
    user_type: Literal["platform", "hotel"]


class InviteUserResponse(BaseModel):
    user_id: UUID
    tenant_id: UUID
    user_type: Literal["platform", "hotel"]
    must_reset_password: bool
    temporary_password: str


class PasswordResetRequest(BaseModel):
    user_id: UUID


class PasswordResetResponse(BaseModel):
    user_id: UUID
    must_reset_password: bool
    revoked_family_count: int
    temporary_password: str


class RoleAssignmentRequest(BaseModel):
    role_name: str = Field(min_length=3, max_length=100)


class RoleAssignmentResponse(BaseModel):
    user_id: UUID
    tenant_id: UUID
    role_name: str
    created: bool


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=1)


class PasswordChangeResponse(BaseModel):
    user_id: UUID
    must_reset_password: bool
    revoked_family_count: int


class CredentialCheckRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: str | None = Field(default=None, min_length=3, max_length=320)
    username: str | None = Field(default=None, min_length=3, max_length=120)
    domain: str | None = Field(default=None, max_length=120)
    password: str = Field(min_length=1)

    @model_validator(mode="after")
    def validate_identity(self) -> "CredentialCheckRequest":
        if self.email and self.username:
            raise ValueError("Provide either email or username/domain, not both.")
        if not self.email and not self.username:
            raise ValueError("Either email or username must be provided.")
        if self.username and not self.domain:
            raise ValueError("Domain is required when username is used.")
        if self.email and self.domain:
            raise ValueError("Domain cannot be combined with email login.")
        return self


class CredentialCheckResponse(BaseModel):
    authenticated: bool
    user_id: UUID | None
    must_reset_password: bool


class AccessTokenIssueRequest(CredentialCheckRequest):
    pass


class AccessTokenIssueResponse(BaseModel):
    authenticated: bool
    user_id: UUID
    tenant_id: UUID
    tenant_type: Literal["platform", "hotel"]
    must_reset_password: bool
    roles: list[str]
    jti: UUID
    expires_at: datetime


class ImpersonationStartRequest(BaseModel):
    target_user_id: UUID
    reason: str | None = Field(default=None, max_length=2000)


class ImpersonationStartResponse(BaseModel):
    impersonation_session_id: UUID
    actor_user_id: UUID
    acting_as_user_id: UUID
    tenant_id: UUID
    tenant_type: Literal["hotel"]
    roles: list[str]
    jti: UUID
    expires_at: datetime
    refresh_family_id: UUID


class ImpersonationStopResponse(BaseModel):
    actor_user_id: UUID
    actor_tenant_id: UUID
    tenant_type: Literal["platform"]
    roles: list[str]
    jti: UUID
    expires_at: datetime
    revoked_token_count: int
    ended_session_id: UUID | None
