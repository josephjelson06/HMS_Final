from pydantic import BaseModel


class KioskBase(BaseModel):
    serial_number: str
    location: str


class KioskCreate(KioskBase):
    pass


class Kiosk(KioskBase):
    id: int
    hotel_id: int

    class Config:
        from_attributes = True
