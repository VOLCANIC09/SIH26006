from fastapi import APIRouter, Query
from backend.app.services.decision_engine import evaluate

router = APIRouter()

@router.get("")
def decision_engine(
    routeId: str = Query("aus-par"),
    parcelSize: float = Query(70000, gt=0),
    horizonMonths: int = Query(1, ge=1, le=6),
    simulations: int = Query(20000, ge=1000, le=100000),
    riskAversion: float = Query(0.35, ge=0, le=1),
    seed: int = Query(42, ge=0),
):
    return evaluate(routeId, parcelSize, horizonMonths, simulations, riskAversion, seed)
