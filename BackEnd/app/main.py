from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.auth.middleware import TenantContextMiddleware
from app.routers import (
    auth_simple,  # New simplified auth
    hotels,
    subscriptions,
    plans,
    users,
    roles,
    rooms,
    incidents,
    tickets,
    settings,
    # auth, # Disable old auth
)
from app.database import engine, Base
import app.models.kiosk  # noqa: F401
import app.models.invoice  # noqa: F401
import app.models.plan  # noqa: F401
import app.models.user  # noqa: F401
import app.models.role  # noqa: F401
import app.models.room  # noqa: F401
import app.models.incident  # noqa: F401
import app.models.ticket  # noqa: F401

# Create all tables in the database
# In production, uses Alebmic for migrations
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HMS Backend API",
    description="Backend API for Hotel Management System",
    version="1.0.0",
)

# Add Tenant Context Middleware
app.add_middleware(TenantContextMiddleware)

# Configure CORS to allow requests from the frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(hotels.router)
# app.include_router(kiosk.router, prefix="/api/kiosks", tags=["kiosks"])
app.include_router(
    subscriptions.router, prefix="/api/subscriptions", tags=["subscriptions"]
)
app.include_router(plans.router, prefix="/api/plans", tags=["plans"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(roles.router, prefix="/api/roles", tags=["roles"])
app.include_router(rooms.router, prefix="/api", tags=["rooms"])
app.include_router(incidents.router, prefix="/api", tags=["incidents"])
app.include_router(tickets.router, prefix="/api", tags=["tickets"])
app.include_router(settings.router, prefix="/api/settings", tags=["settings"])
app.include_router(auth_simple.router)  # Mounts at /auth/login etc.


@app.get("/")
async def root():
    return {"message": "Welcome to HMS Backend API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
