from pydantic import BaseModel
from typing import List, Optional

class RecommendationResponse(BaseModel):
    id: str
    title: str
    action: str
    routeId: str
    vesselId: str
    confidence: float
    details: str
    savings: str
    vesselAdvice: str
    routeLabel: str

    class Config:
        from_attributes = True

class RiskResponse(BaseModel):
    id: str
    title: str
    category: str
    severity: str
    routes: List[str]
    impact: str
    status: str
    updatedAt: str

    class Config:
        from_attributes = True

class RouteResponse(BaseModel):
    id: str
    origin: str
    destination: str
    commodity: str
    distance: float
    originName: str
    destinationName: str

    class Config:
        from_attributes = True
