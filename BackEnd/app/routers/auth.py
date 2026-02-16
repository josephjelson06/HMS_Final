from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.database import get_db
from app.models.user import User

router = APIRouter()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    hotel_id: Optional[int] = None


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()

    if not user or user.password != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    # In a real app, we would return a JWT token here.
    # For now, we return user details as requested.
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": "super"
        if user.role in ["Super Admin", "Finance", "Operations", "Support"]
        else "hotel",
        "hotel_id": user.hotel_id,
    }
