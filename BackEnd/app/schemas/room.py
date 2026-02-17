from uuid import UUID
from pydantic import BaseModel, Field
from typing import List, Optional


class BuildingBase(BaseModel):
    name: str


class BuildingCreate(BuildingBase):
    pass


class BuildingResponse(BuildingBase):
    id: int
    hotel_id: UUID = Field(validation_alias="tenant_id")

    class Config:
        from_attributes = True


class RoomCategoryBase(BaseModel):
    id: str
    name: str
    rate: float
    occupancy: int
    amenities: List[str]


class RoomCategoryCreate(RoomCategoryBase):
    pass


class RoomCategoryResponse(RoomCategoryBase):
    hotel_id: UUID = Field(validation_alias="tenant_id")

    class Config:
        from_attributes = True


class RoomBase(BaseModel):
    id: str
    floor: int
    status: str
    type: str
    building_id: int
    category_id: str


class RoomCreate(RoomBase):
    pass


class RoomUpdate(BaseModel):
    floor: Optional[int] = None
    status: Optional[str] = None
    type: Optional[str] = None
    building_id: Optional[int] = None
    category_id: Optional[str] = None


class RoomResponse(RoomBase):
    hotel_id: UUID = Field(validation_alias="tenant_id")
    building: Optional[str] = Field(None, validation_alias="building_name")
    category: Optional[str] = Field(None, validation_alias="category_name")

    class Config:
        from_attributes = True
