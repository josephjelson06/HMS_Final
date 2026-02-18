from uuid import UUID
from typing import List, Optional

from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str | None = None
    role: str | None = None
    user_type: str
    tenant_id: UUID | None = None
    tenant_type: str
    access_token: str | None = None
    permissions: List[str] = []
    mobile: str | None = None
    employee_id: str | None = None
    status: str | None = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    mobile: Optional[str] = None
    password: Optional[str] = None
