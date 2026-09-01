"""Validated scenario state immediately before Monte Carlo.

Important: route freight is a DERIVED PROXY. The real forecast target is BDI, which is
backtested on held-out historical observations. Route-specific Baltic C18/P9 are used
as benchmark definitions/calibration references, not fabricated historical fixtures.
"""
import json, pandas as pd, numpy as np
from pathlib import Path
from backend.app.ml.prediction import forecast_route
ROOT=Path(__file__).resolve().parents[3]
VESSELS=(ROOT/'backend/data/vessels.csv').resolve(); DEM=(ROOT/'backend/data/demurrage_basis.csv').resolve(); PORTS=(ROOT/'backend/data/ports.csv').resolve()

def paradip_limits(): return {'loa':300.0,'beam':46.0,'draft':14.5,'source':'project reference; verify against current Paradip Port Authority specifications before production use'}

def demurrage_for(vessel_id,tce_proxy=None):
    d=pd.read_csv(DEM).set_index('vessel_id').loc[vessel_id]
    base=float(d.india_coal_reference_usd_day)
    estimate=base if tce_proxy is None else base*max(float(tce_proxy),1)/15000.0
    estimate=float(np.clip(estimate,float(d.lower_bound_usd_day),float(d.upper_bound_usd_day)))
    return {'expected_usd_day':round(estimate,2),'lower_usd_day':float(d.lower_bound_usd_day),'upper_usd_day':float(d.upper_bound_usd_day),'india_reference_usd_day':base,'basis':str(d.market_link_method),'source':str(d.source)}

def build(parcel_size:float=70000):
    forecasts=forecast_route('panamax',3)
    lim=paradip_limits(); vdf=pd.read_csv(VESSELS); vessels=[]
    for _,v in vdf.iterrows():
        feasible=(float(v.draft_limit)<=lim['draft'] and float(v.loa_limit)<=lim['loa'] and float(v.beam_limit)<=lim['beam'] and float(v.benchmark_dwt)>=parcel_size)
        dem=demurrage_for(str(v.id))
        vessels.append({'vessel_id':str(v.id),'name':str(v['name']),'benchmark_dwt':float(v.benchmark_dwt),'dwt_range_t':[float(v.dwt_min),float(v.dwt_max)],'draft_m':float(v.draft_limit),'loa_m':float(v.loa_limit),'beam_m':float(v.beam_limit),'speed_laden_kn':float(v.speed_laden_kn),'speed_ballast_kn':float(v.speed_ballast_kn),'fuel_laden_mt_day':float(v.fuel_laden_mt_day),'fuel_ballast_mt_day':float(v.fuel_ballast_mt_day),'feasible':bool(feasible),'demurrage':dem,'source':str(v.source)})
    return {'route_id':'aus-par','parcel_size_t':parcel_size,'forecast_horizon_months':forecasts,'forecast_target':'BDI (real, walk-forward validated)','route_freight_status':'DERIVED_PROXY','route_proxy_note':'Australia-Paradip is not represented by a bundled historical public fixture series; use Baltic C18/P9 as route benchmark definitions and replace the proxy with licensed fixture data when available.','vessels':vessels,'cost_inputs':{'demurrage_is_fixed':False,'demurrage_model':'India coal contractual reference + bounded market-linked proxy','waiting_days_baseline_source':'ports.csv prototype baseline; replace with observed port-call/queue data when available'},'mc_input_ready':True,'mc_run':False}

if __name__=='__main__': print(json.dumps(build(),indent=2))
