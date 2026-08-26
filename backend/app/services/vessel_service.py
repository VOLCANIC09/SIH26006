from sqlalchemy.orm import Session
from backend.app.database import crud

def get_all_vessels(db: Session) -> list:
    vessels = crud.get_vessels(db)
    return [
        {
            "id": v.id,
            "name": v.name,
            "capacity": v.capacity,
            "draftLimit": v.draft_limit,
            "loaLimit": v.loa_limit,
            "beamLimit": v.beam_limit,
            "suitability": v.suitability,
            "costFactor": v.cost_factor
        }
        for v in vessels
    ]
