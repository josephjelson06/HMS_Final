from __future__ import annotations

import hmac
import secrets
from collections.abc import Awaitable
from collections.abc import Callable
from urllib.parse import urlparse

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.config import get_settings

SAFE_HTTP_METHODS = frozenset({"GET", "HEAD", "OPTIONS", "TRACE"})
CSRF_EXEMPT_PATHS = frozenset(
    {
        "/auth/access-token",
        "/auth/refresh",
    }
)
CSRF_TOKEN_BYTES = 32


class CSRFValidationError(ValueError):
    status_code = 403

    def __init__(self, detail: str) -> None:
        super().__init__(detail)
        self.detail = detail


class CSRFMiddleware(BaseHTTPMiddleware):
    def __init__(self, app) -> None:
        super().__init__(app)
        self.settings = get_settings()
        self.allowed_origins = set(self.settings.get_csrf_allowed_origins())
        self.csrf_header_name = self.settings.csrf_header_name.lower()

    async def dispatch(self, request: Request, call_next: Callable[[Request], Awaitable[Response]]) -> Response:
        if request.method not in SAFE_HTTP_METHODS:
            try:
                self._validate_origin_or_referer(request)
                if not self._is_exempt_path(request.url.path):
                    self._validate_double_submit_token(request)
            except CSRFValidationError as exc:
                response = JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
                self._ensure_csrf_cookie(request, response)
                return response

        response = await call_next(request)
        self._ensure_csrf_cookie(request, response)
        return response

    def _validate_origin_or_referer(self, request: Request) -> None:
        # Origin/Referer validation prevents cross-site posts from untrusted origins.
        origin = request.headers.get("origin")
        referer = request.headers.get("referer")
        candidate: str | None = None

        if origin:
            candidate = origin.rstrip("/")
        elif referer:
            parsed = urlparse(referer)
            if parsed.scheme and parsed.netloc:
                candidate = f"{parsed.scheme}://{parsed.netloc}".rstrip("/")
            else:
                raise CSRFValidationError("Invalid Referer header.")

        if not candidate:
            raise CSRFValidationError("Origin or Referer header is required.")

        if candidate not in self.allowed_origins:
            raise CSRFValidationError("Origin is not allowed.")

    def _validate_double_submit_token(self, request: Request) -> None:
        # Double-submit: request must prove browser received the CSRF cookie value.
        cookie_token = request.cookies.get(self.settings.csrf_cookie_name)
        header_token = request.headers.get(self.csrf_header_name)

        if not cookie_token:
            raise CSRFValidationError("CSRF cookie is required.")
        if not header_token:
            raise CSRFValidationError("CSRF header token is required.")
        if not hmac.compare_digest(cookie_token, header_token):
            raise CSRFValidationError("CSRF token mismatch.")

    def _is_exempt_path(self, path: str) -> bool:
        normalized = path.rstrip("/") or "/"
        return normalized in CSRF_EXEMPT_PATHS

    def _ensure_csrf_cookie(self, request: Request, response: Response) -> None:
        existing_token = request.cookies.get(self.settings.csrf_cookie_name)
        if existing_token:
            return

        csrf_token = secrets.token_urlsafe(CSRF_TOKEN_BYTES)
        response.set_cookie(
            key=self.settings.csrf_cookie_name,
            value=csrf_token,
            httponly=False,
            secure=self.settings.cookie_secure,
            samesite=self.settings.csrf_cookie_samesite,
            path=self.settings.csrf_cookie_path,
            domain=self.settings.csrf_cookie_domain,
        )
