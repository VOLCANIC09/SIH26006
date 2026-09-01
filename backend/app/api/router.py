from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.connection import get_db
from backend.app.schemas.recommendation_schema import RouteResponse
from backend.app.database import crud
from backend.app.api.routes import port, vessel, forecast, risk, recommendation, pre_mc, decision, quant

api_router = APIRouter()

api_router.include_router(port.router, prefix="/ports", tags=["ports"])
api_router.include_router(vessel.router, prefix="/vessels", tags=["vessels"])
api_router.include_router(forecast.router, prefix="/forecast", tags=["forecast"])
api_router.include_router(risk.router, prefix="/risks", tags=["risks"])
api_router.include_router(recommendation.router, prefix="/recommendations", tags=["recommendations"])

@api_router.get("/routes", response_model=List[RouteResponse], tags=["routes"])
def read_routes_alias(db: Session = Depends(get_db)):
    routes = crud.get_routes(db)
    return [
        {
            "id": r.id,
            "origin": r.origin_id,
            "destination": r.destination_id,
            "commodity": r.commodity,
            "distance": r.distance,
            "originName": r.origin.name if r.origin else r.origin_id,
            "destinationName": r.destination.name if r.destination else r.destination_id
        }
        for r in routes
    ]

api_router.include_router(pre_mc.router, prefix="/pre-mc", tags=["pre-monte-carlo"])
api_router.include_router(decision.router, prefix="/decision-engine", tags=["decision-engine"])

api_router.include_router(quant.router, prefix="/quant", tags=["quantitative-engine"] )
