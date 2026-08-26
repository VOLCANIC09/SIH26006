from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.schemas.forecast_schema import ForecastResponse
from backend.app.services import forecast_service

router = APIRouter()

@router.get("", response_model=ForecastResponse)
def read_forecast(
    routeId: str = Query(..., description="Route ID"),
    vesselId: str = Query(..., description="Vessel ID"),
    db: Session = Depends(get_db)
):
    return forecast_service.get_forecast_data(db, routeId, vesselId)
