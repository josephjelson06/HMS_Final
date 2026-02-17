from fastapi import Depends, HTTPException, status, Request
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.auth.security import SECRET_KEY, ALGORITHM
from app.modules.tenant.context import AuthContext, TenantType


async def get_current_user(request: Request, db: Session = Depends(get_db)):
    # 1. Extract Token from Cookie or Authorization header
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("authorization")
        if auth_header:
            token = auth_header
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    # Remove 'Bearer ' prefix if present
    if token.startswith("Bearer "):
        token = token.split(" ")[1]

    try:
        # 2. Decode Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        tenant_id = payload.get("tenant_id")
        tenant_type_str = payload.get("tenant_type")
        roles = payload.get("roles", [])

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # 3. Set Request State for RLS and Auth Context
        request.state.tenant_id = tenant_id
        request.state.tenant_type = tenant_type_str
        request.state.user_id = user_id

        try:
            request.state.auth_context = AuthContext(
                tenant_id=tenant_id,
                tenant_type=TenantType(tenant_type_str),
                user_id=user_id,
                roles=tuple(roles),
            )
        except Exception:
            pass

        # 4. Fetch User from DB
        # User is already aliased to auth.User in app/models/user.py
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
