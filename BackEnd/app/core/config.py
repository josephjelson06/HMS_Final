from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Literal
from urllib.parse import urlparse

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


KNOWN_WEAK_SECRETS = {
    "",
    "changeme",
    "change-me",
    "default",
    "jwt-secret",
    "secret",
    "password",
    "dev-secret",
    "replace-with-at-least-32-random-characters",
}

BACKEND_ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    """Central typed configuration for the Auth service."""

    model_config = SettingsConfigDict(
        env_file=str(BACKEND_ROOT / ".env"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_env: Literal["development", "production"] = Field(
        default="development", validation_alias="APP_ENV"
    )
    app_name: str = Field(default="Auth Module API", validation_alias="APP_NAME")
    database_url: str = Field(validation_alias="DATABASE_URL")

    jwt_secret: str = Field(validation_alias="JWT_SECRET")
    cookie_secure: bool = Field(default=False, validation_alias="COOKIE_SECURE")
    seed_data: bool = Field(default=False, validation_alias="SEED_DATA")

    access_token_minutes: int = Field(
        default=10, validation_alias="ACCESS_TOKEN_MINUTES"
    )
    access_token_cookie_name: str = Field(
        default="access_token", validation_alias="ACCESS_TOKEN_COOKIE_NAME"
    )
    access_token_cookie_path: str = Field(
        default="/", validation_alias="ACCESS_TOKEN_COOKIE_PATH"
    )
    access_token_cookie_samesite: Literal["lax", "strict", "none"] = Field(
        default="lax",
        validation_alias="ACCESS_TOKEN_COOKIE_SAMESITE",
    )
    access_token_cookie_domain: str | None = Field(
        default=None, validation_alias="ACCESS_TOKEN_COOKIE_DOMAIN"
    )
    refresh_token_days: int = Field(default=14, validation_alias="REFRESH_TOKEN_DAYS")
    refresh_token_cookie_name: str = Field(
        default="refresh_token", validation_alias="REFRESH_TOKEN_COOKIE_NAME"
    )
    refresh_token_cookie_path: str = Field(
        default="/", validation_alias="REFRESH_TOKEN_COOKIE_PATH"
    )
    refresh_token_cookie_samesite: Literal["lax", "strict", "none"] = Field(
        default="lax",
        validation_alias="REFRESH_TOKEN_COOKIE_SAMESITE",
    )
    refresh_token_cookie_domain: str | None = Field(
        default=None, validation_alias="REFRESH_TOKEN_COOKIE_DOMAIN"
    )

    csrf_cookie_name: str = Field(
        default="csrf_token", validation_alias="CSRF_COOKIE_NAME"
    )
    csrf_cookie_path: str = Field(default="/", validation_alias="CSRF_COOKIE_PATH")
    csrf_cookie_samesite: Literal["lax", "strict", "none"] = Field(
        default="lax",
        validation_alias="CSRF_COOKIE_SAMESITE",
    )
    csrf_cookie_domain: str | None = Field(
        default=None, validation_alias="CSRF_COOKIE_DOMAIN"
    )
    csrf_header_name: str = Field(
        default="x-csrf-token", validation_alias="CSRF_HEADER_NAME"
    )
    csrf_allowed_origins: str = Field(
        default=(
            "http://localhost:3000,http://127.0.0.1:3000,"
            "http://localhost:3001,http://127.0.0.1:3001,"
            "http://localhost:8000,http://127.0.0.1:8000,"
            "http://testserver"
        ),
        validation_alias="CSRF_ALLOWED_ORIGINS",
    )

    def validate_startup_guards(self) -> None:
        # This secret protects JWT integrity and must never be guessable.
        normalized_secret = self.jwt_secret.strip().lower()
        if len(self.jwt_secret.strip()) < 32 or normalized_secret in KNOWN_WEAK_SECRETS:
            raise ValueError(
                "JWT_SECRET is weak. Use a high-entropy secret of at least 32 characters."
            )

        if self.app_env == "production" and not self.cookie_secure:
            raise ValueError("COOKIE_SECURE must be true in production.")

        if self.app_env == "production" and self.seed_data:
            raise ValueError("SEED_DATA must be false in production.")

        if not 5 <= self.access_token_minutes <= 10:
            raise ValueError("ACCESS_TOKEN_MINUTES must be between 5 and 10.")

        if self.access_token_cookie_samesite == "none" and not self.cookie_secure:
            raise ValueError(
                "ACCESS_TOKEN_COOKIE_SAMESITE=none requires COOKIE_SECURE=true."
            )

        if self.refresh_token_days <= 0:
            raise ValueError("REFRESH_TOKEN_DAYS must be greater than 0.")

        if self.refresh_token_cookie_samesite == "none" and not self.cookie_secure:
            raise ValueError(
                "REFRESH_TOKEN_COOKIE_SAMESITE=none requires COOKIE_SECURE=true."
            )

        if self.csrf_cookie_samesite == "none" and not self.cookie_secure:
            raise ValueError("CSRF_COOKIE_SAMESITE=none requires COOKIE_SECURE=true.")

        if self.access_token_cookie_name == self.refresh_token_cookie_name:
            raise ValueError(
                "ACCESS_TOKEN_COOKIE_NAME and REFRESH_TOKEN_COOKIE_NAME must be different."
            )

        if self.csrf_cookie_name in {
            self.access_token_cookie_name,
            self.refresh_token_cookie_name,
        }:
            raise ValueError(
                "CSRF_COOKIE_NAME must be different from auth cookie names."
            )

        for cookie_path in (
            self.access_token_cookie_path,
            self.refresh_token_cookie_path,
            self.csrf_cookie_path,
        ):
            if not cookie_path.startswith("/"):
                raise ValueError("Cookie paths must start with '/'.")

        if not self.csrf_header_name.lower().startswith("x-"):
            raise ValueError(
                "CSRF_HEADER_NAME must be an x- prefixed custom header name."
            )

        allowed_origins = self.get_csrf_allowed_origins()
        if not allowed_origins:
            raise ValueError("CSRF_ALLOWED_ORIGINS must contain at least one origin.")
        for origin in allowed_origins:
            if "*" in origin:
                raise ValueError(
                    "CSRF_ALLOWED_ORIGINS must not contain wildcard origins."
                )
            parsed = urlparse(origin)
            if parsed.scheme not in {"http", "https"} or not parsed.netloc:
                raise ValueError(f"Invalid origin in CSRF_ALLOWED_ORIGINS: {origin}")
            if self.app_env == "production" and parsed.scheme != "https":
                raise ValueError("Production CSRF_ALLOWED_ORIGINS must use https.")

    def get_csrf_allowed_origins(self) -> tuple[str, ...]:
        values = []
        for raw in self.csrf_allowed_origins.split(","):
            candidate = raw.strip()
            if not candidate:
                continue
            values.append(candidate.rstrip("/"))
        return tuple(values)


@lru_cache
def get_settings() -> Settings:
    return Settings()
