from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FarmCreateSchema(BaseModel):
    farmer_name: str = Field(..., example="Ramesh Kumar")
    location: str = Field(..., example="Punjab, India")
    land_area_acres: float = Field(..., gt=0, example=5.5)
    primary_crop: str = Field(..., example="Wheat")
    soil_ph: Optional[float] = Field(default=6.5, ge=0, le=14)
    nitrogen: float = Field(..., example=90.0)
    phosphorus: float = Field(..., example=42.0)
    potassium: float = Field(..., example=43.0)

class FarmResponseSchema(FarmCreateSchema):
    id: str
    created_at: datetime