from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.routers import (
    auth_simple,
    tenants,
    subscriptions,
    plans,
    users,
    roles,
    permissions,
    support,
    onboarding,
    kiosk,
)

app = FastAPI(
    title="HMS Backend API",
    description="Backend API for Hotel Management System",
    version="2.0.0",
)

# Ensure uploads directory exists
os.makedirs("uploads/tenants", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Configure CORS to allow requests from the frontend
origins = [
    # HMS Frontend (Next.js)
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    # Kiosk (Vite / Express dev)
    "http://localhost:4000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:4000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(tenants.router)
app.include_router(subscriptions.router)
app.include_router(plans.router)
app.include_router(users.router)
app.include_router(roles.router)
app.include_router(permissions.router)
app.include_router(auth_simple.router)
app.include_router(support.router)
app.include_router(onboarding.router)
app.include_router(kiosk.router)


@app.get("/")
async def root():
    return {"message": "Welcome to HMS Backend API v2"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
