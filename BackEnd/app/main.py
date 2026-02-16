from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import hotels
from app.database import engine, Base
import app.models.kiosk  # noqa: F401

# Create all tables in the database
# In production, uses Alebmic for migrations
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HMS Backend API",
    description="Backend API for Hotel Management System",
    version="1.0.0",
)

# Configure CORS to allow requests from the frontend
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(hotels.router)


@app.get("/")
async def root():
    return {"message": "Welcome to HMS Backend API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
