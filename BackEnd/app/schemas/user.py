from pydantic import BaseModel, EmailStr
from typing import Optional


class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str
    status: Optional[str] = "Active"
    mobile: Optional[str] = None
    department: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    role: Optional[str] = None
    mobile: Optional[str] = None
    department: Optional[str] = None


class User(UserBase):
    id: int
    employee_id: str
    last_login: Optional[str] = None
    date_added: str
    avatar: Optional[str] = None

    class Config:
        from_attributes = True


class RoleSchema(BaseModel):
    name: str
    desc: str
    color: str
    userCount: int
    status: str
