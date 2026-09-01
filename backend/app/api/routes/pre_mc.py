from fastapi import APIRouter, Query
from backend.app.ml.pre_mc import build
router=APIRouter()
@router.get('')
def pre_monte_carlo(parcelSize: float = Query(70000, gt=0)):
    return build(parcelSize)
