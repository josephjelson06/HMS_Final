from uuid import UUID
from pydantic import BaseModel, EmailStr
from app.schemas.base import ORMBase


# ---------- TENANT ----------


class TenantCreate(BaseModel):
    hotel_name: str
    address: str | None = None
    plan_id: UUID | None = None
    owner_name: str | None = None
    owner_email: EmailStr | None = None
    owner_phone: str | None = None


class TenantRead(ORMBase):
    id: UUID
    hotel_name: str
    address: str | None
    plan_id: UUID | None
    owner_user_id: UUID | None
    status: bool
    image_url_1: str | None = None
    image_url_2: str | None = None
    image_url_3: str | None = None
