from sqlalchemy.orm import Session
from backend.app.database import crud

def get_recommendations_with_labels(db: Session) -> list:
    recs = crud.get_recommendations(db)
    result = []
    
    for r in recs:
        # Load associated route
        origin_name = r.route.origin.name if r.route and r.route.origin else ''
        dest_name = r.route.destination.name if r.route and r.route.destination else ''
        
        result.append({
            "id": r.id,
            "title": r.title,
            "action": r.action,
            "routeId": r.route_id,
            "vesselId": r.vessel_id,
            "confidence": r.confidence,
            "details": r.details,
            "savings": r.savings,
            "vesselAdvice": r.vessel_advice,
            "routeLabel": f"{origin_name} ➔ {dest_name}" if (origin_name and dest_name) else "Global Route"
        })
        
    return result
