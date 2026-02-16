from typing import Annotated
from fastapi import Depends, HTTPException, status, Request
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.core.auth.security import SECRET_KEY, ALGORITHM


async def get_current_user(request: Request, db: Session = Depends(get_db)):
    # 1. Extract Token from Cookie
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    # Remove 'Bearer ' prefix if present (cookie might just be the token)
    if token.startswith("Bearer "):
        token = token.split(" ")[1]

    try:
        # 2. Decode Token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        tenant_id: int = payload.get("tenant_id")
        tenant_type: str = payload.get("tenant_type")

        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")

        # 3. Set Request State for Middleware
        request.state.tenant_id = tenant_id
        request.state.tenant_type = tenant_type
        request.state.user_id = user_id

        # 4. Fetch User from DB
        user = db.query(User).filter(User.id == int(user_id)).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
