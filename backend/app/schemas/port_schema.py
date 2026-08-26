from pydantic import BaseModel
from typing import Optional, List

class DischargePortResponse(BaseModel):
    id: str
    name: str
    draft: float
    loa: float
    beam: float
    capacity: float
    handlingRate: float
    congestionIndex: str
    waitingDays: float
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class LoadPortResponse(BaseModel):
    id: str
    name: str
    draft: float
    loa: float
    beam: float
    handlingRate: float
    transitDays: float
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class PortsResponse(BaseModel):
    discharge: List[DischargePortResponse]
    load: List[LoadPortResponse]
