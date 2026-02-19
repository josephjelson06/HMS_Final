from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Union

from jose import jwt
from passlib.context import CryptContext

from app.core.config import get_settings


settings = get_settings()

SECRET_KEY = settings.jwt_secret
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(
    subject: Union[str, Any],
    user_table: str,  # "platform" or "tenant"
    role_id: str,  # UUID str
    tenant_id: Union[str, Any] | None = None,
) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(subject),
        "user_table": user_table,
        "role_id": str(role_id),
        "exp": expire,
    }
    if tenant_id:
        payload["tenant_id"] = str(tenant_id)

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
