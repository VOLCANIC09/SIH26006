from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.connection import get_db
from backend.app.schemas.recommendation_schema import RiskResponse
from backend.app.services import risk_service
from backend.app.utils import calculations

router = APIRouter()

@router.get("", response_model=List[RiskResponse])
def read_risks(db: Session = Depends(get_db)):
    return risk_service.get_active_risks(db)

@router.get("/simulate")
def simulate_risk(
    baseRate: float = Query(..., description="Base freight rate per ton"),
    volatility: float = Query(0.15, description="Rate volatility"),
    demurrageRate: float = Query(22000.0, description="Daily demurrage cost in USD/day"),
    waitingDays: float = Query(4.0, description="Average waiting days at port"),
    parcelSize: float = Query(70000.0, description="Cargo size in tons")
):
    return calculations.run_monte_carlo_cost_simulation(
        base_rate=baseRate,
        rate_volatility=volatility,
        demurrage_rate=demurrageRate,
        waiting_days=waitingDays,
        parcel_size=parcelSize
    )
