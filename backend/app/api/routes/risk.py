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

@router.get("/monte-carlo")
def production_monte_carlo(
    vesselId: str = Query("panamax"),
    parcelSize: float = Query(70000.0, gt=0),
    baseRate: float = Query(22.0, gt=0),
    distanceNm: float = Query(5400.0, gt=0),
    waitingDays: float = Query(3.0, ge=0),
    simulations: int = Query(20000, ge=1000, le=100000),
    seed: int = Query(42, ge=0),
):
    from backend.app.ml.monte_carlo import simulate_voyage
    return simulate_voyage(
        vessel_id=vesselId,
        parcel_size_t=parcelSize,
        base_freight_usd_t=baseRate,
        distance_nm=distanceNm,
        transit_days=18.0,
        load_rate_t_day=35000.0,
        discharge_rate_t_day=25000.0,
        waiting_days=waitingDays,
        num_simulations=simulations,
        seed=seed,
    )
