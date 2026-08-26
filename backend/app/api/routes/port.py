from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database.connection import get_db
from backend.app.schemas.port_schema import PortsResponse
from backend.app.services import port_service

router = APIRouter()

@router.get("", response_model=PortsResponse)
def read_ports(db: Session = Depends(get_db)):
    return port_service.get_all_ports(db)
