from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.connection import get_db
from backend.app.schemas.recommendation_schema import RecommendationResponse, RouteResponse
from backend.app.services import recommendation_service
from backend.app.database import crud

router = APIRouter()

@router.get("", response_model=List[RecommendationResponse])
def read_recommendations(db: Session = Depends(get_db)):
    return recommendation_service.get_recommendations_with_labels(db)

@router.get("/routes", response_model=List[RouteResponse])
def read_routes(db: Session = Depends(get_db)):
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
