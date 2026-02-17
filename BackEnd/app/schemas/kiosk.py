from uuid import UUID
from pydantic import BaseModel


class KioskBase(BaseModel):
    serial_number: str
    location: str


class KioskCreate(KioskBase):
    pass


class Kiosk(KioskBase):
    id: UUID
    hotel_id: UUID

    class Config:
        from_attributes = True
