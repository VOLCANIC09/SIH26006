from pathlib import Path
import pandas as pd
from sqlalchemy.orm import Session
from backend.app.database import crud
from backend.app.ml import prediction
from backend.app.ml.route_proxy import route_freight_proxy

ROOT=Path(__file__).resolve().parents[3]

def get_forecast_data(db: Session, route_id: str, vessel_id: str) -> dict:
    # Australia-Paradip uses the reproducible real-data pipeline. The displayed route rate
    # is a derived proxy, not a historical observed fixture.
    if route_id == "aus-par":
        market=pd.read_csv(ROOT/"data/processed/market_features.csv",parse_dates=["date"]).sort_values("date")
        hist=market.tail(24)
        history=[]
        for _,r in hist.iterrows():
            rate=route_freight_proxy(r.bdi,vessel_id)
            history.append({"month":r.date.strftime("%Y-%m"),"rate":round(rate,2),"upper":None,"lower":None,"type":"DerivedProxy"})
        future=prediction.forecast_route(vessel_id,3)
        forecast=[]
        for f in future:
            lo=route_freight_proxy(f["bdi_p05"],vessel_id); hi=route_freight_proxy(f["bdi_p95"],vessel_id)
            forecast.append({"month":f["month"],"rate":f["route_freight_proxy_usd_t"],"upper":round(hi,2),"lower":round(lo,2),"type":"ForecastProxy"})
        return {"history":history,"forecast":forecast,"target_status":"DERIVED_PROXY","forecast_target":"BDI real; route freight derived"}

    # Legacy/non-primary routes use the database-backed records.
    db_rates=crud.get_rates_for_route_vessel(db,route_id,vessel_id)
    history=[{"month":r.month,"rate":r.rate,"type":r.type} for r in db_rates if r.type in ("Historical","DerivedProxy")]
    return {"history":history,"forecast":[]}
