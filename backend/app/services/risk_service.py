from sqlalchemy.orm import Session
from backend.app.database import crud

def get_active_risks(db: Session) -> list:
    risks = crud.get_risks(db)
    result = []
    
    for r in risks:
        result.append({
            "id": r.id,
            "title": r.title,
            "category": r.category,
            "severity": r.severity,
            "routes": r.routes.split(",") if r.routes else [],
            "impact": r.impact,
            "status": r.status,
            "updatedAt": r.updated_at
        })
        
    return result
