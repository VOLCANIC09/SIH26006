from fastapi import APIRouter, Query
from backend.app.ml.monte_carlo import stress_test
from backend.app.ml.model_tournament import tournament
from backend.app.ml.regime import current_regime
from backend.app.ml.sensitivity import sensitivity
from backend.app.services.quant_optimizer import optimize
from backend.app.services.decision_engine import evaluate
from backend.app.ml.prediction import forecast_route

router = APIRouter()

@router.get('/overview')
def quantitative_overview():
    return {'regime': current_regime(), 'model_tournament': tournament()}

@router.get('/sensitivity')
def quantitative_sensitivity(parcelSize: float = Query(70000, gt=0), simulations: int = Query(5000, ge=1000, le=30000), riskAversion: float = Query(.35, ge=0, le=1)):
    f=forecast_route('panamax',1)[0]
    base={'vessel_id':'panamax','parcel_size_t':parcelSize,'base_freight_usd_t':f['route_freight_proxy_usd_t'],'distance_nm':5400,'transit_days':18,'load_rate_t_day':35000,'discharge_rate_t_day':25000,'waiting_days':3,'fuel_price_usd_t':250,'seed':42}
    return sensitivity(base, simulations=simulations)

@router.get('/stress')
def quantitative_stress(parcelSize: float = Query(70000, gt=0), simulations: int = Query(10000, ge=1000, le=30000)):
    f=forecast_route('panamax',1)[0]
    return stress_test(vessel_id='panamax', parcel_size_t=parcelSize, base_freight_usd_t=f['route_freight_proxy_usd_t'], distance_nm=5400, transit_days=18, load_rate_t_day=35000, discharge_rate_t_day=25000, waiting_days=3, num_simulations=simulations, seed=42)

@router.get('/optimize')
def quantitative_optimize(parcelSize: float = Query(70000, gt=0), riskAversion: float = Query(.35, ge=0, le=1), simulations: int = Query(5000, ge=1000, le=30000), stepT: int = Query(5000, ge=1000, le=20000)):
    return optimize(parcelSize, riskAversion, simulations, step_t=stepT)
