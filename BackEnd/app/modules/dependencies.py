from __future__ import annotations

from fastapi import Depends
from fastapi import HTTPException
from fastapi import Request

from app.core.config import get_settings
from app.modules.auth.tokens import AccessTokenClaims
from app.modules.auth.tokens import AccessTokenError
from app.modules.auth.tokens import decode_access_token


def get_access_token_claims(request: Request) -> AccessTokenClaims | None:
    existing = getattr(request.state, "access_token_claims", None)
    if isinstance(existing, AccessTokenClaims):
        return existing

    settings = get_settings()
    token = request.cookies.get(settings.access_token_cookie_name)
    if not token:
        return None

    try:
        claims = decode_access_token(token, jwt_secret=settings.jwt_secret)
    except AccessTokenError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc

    request.state.access_token_claims = claims
    return claims


def require_access_token_claims(claims: AccessTokenClaims | None = Depends(get_access_token_claims)) -> AccessTokenClaims:
    if claims is None:
        raise HTTPException(status_code=401, detail="Access token is required.")
    return claims
