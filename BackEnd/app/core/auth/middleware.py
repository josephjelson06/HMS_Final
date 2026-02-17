from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from jose import jwt, JWTError
from app.core.auth.security import SECRET_KEY, ALGORITHM
from app.modules.tenant.context import AuthContext, TenantType


class TenantContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # 1. Extract Token from Cookie or Authorization header
        token = request.cookies.get("access_token")
        if not token:
            auth_header = request.headers.get("authorization")
            if auth_header:
                token = auth_header

        # Initialize state
        request.state.tenant_id = None
        request.state.tenant_type = "platform"  # Default if not set
        request.state.user_id = None
        request.state.auth_context = None

        if token:
            if token.startswith("Bearer "):
                token = token.split(" ")[1]

            try:
                # 2. Decode Token
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

                # 3. Set Request State for RLS in database.get_db()
                tenant_id = payload.get("tenant_id")
                tenant_type = payload.get("tenant_type", "hotel")
                user_id = payload.get("sub")

                request.state.tenant_id = tenant_id
                request.state.tenant_type = tenant_type
                request.state.user_id = user_id

                # print(f"DEBUG Middleware: Decoded token for user {user_id} tenant {tenant_id}")

                # Create and set AuthContext
                if tenant_id:
                    from uuid import UUID

                    try:
                        tid = UUID(tenant_id)
                        ttype = TenantType(tenant_type)
                        uid = UUID(user_id) if user_id else None

                        ctx = AuthContext(
                            tenant_id=tid,
                            tenant_type=ttype,
                            user_id=uid,
                            roles=tuple(payload.get("roles", [])),
                        )
                        request.state.auth_context = ctx
                    except Exception as e:
                        print(f"Auth Context Creation Failed: {e}")

            except JWTError:
                # Invalid token - we don't block here, let dependencies handle 401
                pass

        return await call_next(request)
