from pydantic import BaseModel
from typing import List, Optional

class ForecastItem(BaseModel):
    month: str
    rate: float
    upper: Optional[float] = None
    lower: Optional[float] = None
    type: str

    class Config:
        from_attributes = True

class ForecastResponse(BaseModel):
    history: List[ForecastItem]
    forecast: List[ForecastItem]
