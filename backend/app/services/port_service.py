from sqlalchemy.orm import Session
from backend.app.database import crud

def get_all_ports(db: Session) -> dict:
    ports = crud.get_ports(db)
    discharge = []
    load = []
    
    for p in ports:
        port_dict = {
            "id": p.id,
            "name": p.name,
            "draft": p.draft,
            "loa": p.loa,
            "beam": p.beam,
            "capacity": p.capacity,
            "handlingRate": p.handling_rate,
            "congestionIndex": p.congestion_index,
            "waitingDays": p.waiting_days,
            "notes": p.notes
        }
        if p.type == "load":
            port_dict["transitDays"] = p.transit_days
            load.append(port_dict)
        else:
            discharge.append(port_dict)
            
    return {
        "discharge": discharge,
        "load": load
    }
