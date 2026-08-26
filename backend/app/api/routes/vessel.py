from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.connection import get_db
from backend.app.schemas.vessel_schema import VesselResponse, OptimizationResponse
from backend.app.services import vessel_service, optimization_service

router = APIRouter()

@router.get("", response_model=List[VesselResponse])
def read_vessels(db: Session = Depends(get_db)):
    return vessel_service.get_all_vessels(db)

@router.get("/optimize", response_model=OptimizationResponse)
def optimize_vessel(
    originId: str = Query(..., description="ID of origin load port"),
    destId: str = Query(..., description="ID of destination discharge port"),
    parcelSize: float = Query(..., description="Cargo parcel size in tons"),
    db: Session = Depends(get_db)
):
    return optimization_service.optimize_shipping_vessel(db, originId, destId, parcelSize)
