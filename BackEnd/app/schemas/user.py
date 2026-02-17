from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional, Any
from datetime import datetime


class UserBase(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    mobile: Optional[str] = None
    department: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: Optional[str] = None
    hotel_id: Optional[UUID] = None


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    department: Optional[str] = None
    password: Optional[str] = None


class User(UserBase):
    id: UUID
    employee_id: Optional[str] = None
    hotel_id: Optional[UUID] = Field(None, validation_alias="tenant_id")
    user_type: Optional[str] = None
    avatar: Optional[str] = None
    status: Optional[str] = None
    date_added: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def map_model_fields(cls, data: Any) -> Any:
        # Handle SQLAlchemy model objects (from_attributes mode)
        if hasattr(data, "__dict__"):
            # Convert is_active boolean to status string
            is_active = getattr(data, "is_active", None)
            if is_active is not None and not hasattr(data, "status"):
                # Can't set on the model directly, so we'll convert to dict
                d = {}
                for key in [
                    "id",
                    "email",
                    "name",
                    "employee_id",
                    "tenant_id",
                    "user_type",
                    "avatar",
                    "mobile",
                    "department",
                    "is_active",
                    "created_at",
                ]:
                    d[key] = getattr(data, key, None)
                d["status"] = "Active" if d.get("is_active") else "Inactive"
                created = d.get("created_at")
                if isinstance(created, datetime):
                    d["date_added"] = created.strftime("%Y-%m-%d")
                return d
        return data

    class Config:
        from_attributes = True
        populate_by_name = True


class RoleSchema(BaseModel):
    name: str
    desc: str
    color: str
    userCount: int
    status: str
