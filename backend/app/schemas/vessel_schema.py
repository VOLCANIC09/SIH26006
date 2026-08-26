from pydantic import BaseModel
from typing import Optional, List

class VesselResponse(BaseModel):
    id: str
    name: str
    capacity: str
    draftLimit: float
    loaLimit: float
    beamLimit: float
    suitability: Optional[str] = None
    costFactor: float

    class Config:
        from_attributes = True

class ConstraintItem(BaseModel):
    allowed: float
    required: float
    ok: bool

class VesselConstraints(BaseModel):
    draft: ConstraintItem
    loa: ConstraintItem
    beam: ConstraintItem

class OptimizationResultItem(BaseModel):
    vesselId: str
    vesselName: str
    feasible: bool
    constraints: VesselConstraints
    efficiencyScore: int
    loadDays: float
    dischargeDays: float
    transitDays: float
    waitingDays: float
    totalDays: float
    costPerTon: float
    totalCost: int

class OptimizationPortItem(BaseModel):
    id: str
    name: str
    draft: float
    loa: float
    beam: float
    handlingRate: float
    transitDays: Optional[float] = None
    waitingDays: Optional[float] = None

class OptimizationResponse(BaseModel):
    results: List[OptimizationResultItem]
    recommendedVessel: Optional[OptimizationResultItem] = None
    originPort: OptimizationPortItem
    destPort: OptimizationPortItem
