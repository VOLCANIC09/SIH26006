"""Quantitative constrained optimizer: vessel x parcel size x risk appetite."""
from __future__ import annotations
from pathlib import Path
import pandas as pd
from backend.app.ml.prediction import forecast_route
from backend.app.ml.monte_carlo import simulate_voyage

ROOT = Path(__file__).resolve().parents[3]
VESSEL_FILE = ROOT / 'backend' / 'data' / 'vessels.csv'
PORT_FILE = ROOT / 'backend' / 'data' / 'ports.csv'
SCALE = {'capesize': .88, 'panamax': 1.00, 'supramax': 1.16, 'handysize': 1.38}


def optimize(parcel_size_t=70000, risk_aversion=.35, simulations=5000, min_parcel_t=None, max_parcel_t=None, step_t=5000, seed=42):
    ports = pd.read_csv(PORT_FILE).set_index('id'); vessels = pd.read_csv(VESSEL_FILE).set_index('id')
    origin, dest = ports.loc['newcastle'], ports.loc['paradip']
    min_parcel_t = float(min_parcel_t or max(10000, parcel_size_t * .75)); max_parcel_t = float(max_parcel_t or min(parcel_size_t * 1.25, 150000))
    forecast = forecast_route('panamax', 1)[0]
    candidates=[]
    for size in range(int(min_parcel_t), int(max_parcel_t)+1, int(step_t)):
        for vid,v in vessels.iterrows():
            feasible=(float(v.draft_limit)<=float(dest.draft) and float(v.loa_limit)<=float(dest.loa) and float(v.beam_limit)<=float(dest.beam) and float(v.benchmark_dwt)>=size)
            if not feasible: continue
            rate=float(forecast['route_freight_proxy_usd_t'])*SCALE[vid]
            mc=simulate_voyage(vessel_id=vid, parcel_size_t=size, base_freight_usd_t=rate, distance_nm=5400, transit_days=float(origin.transit_days), load_rate_t_day=float(origin.handling_rate), discharge_rate_t_day=float(dest.handling_rate), waiting_days=float(dest.waiting_days), num_simulations=simulations, seed=seed+size+list(vessels.index).index(vid))
            score=(1-risk_aversion)*mc['expected_total_cost_usd']+risk_aversion*mc['cvar_total_cost_usd']
            candidates.append({'vessel_id':vid,'vessel_name':v['name'],'parcel_size_t':size,'risk_score_usd':round(score,2),'expected_cost_usd':mc['expected_total_cost_usd'],'cvar95_usd':mc['cvar_total_cost_usd'],'expected_cost_per_t_usd':round(mc['expected_total_cost_usd']/size,2),'risk_adjusted_cost_per_t_usd':round(score/size,2),'budget_breach_probability_15pct':mc['probability_gt_15pct_expected']})
    if not candidates: raise ValueError('No feasible vessel/parcel combination')
    candidates.sort(key=lambda x:x['risk_adjusted_cost_per_t_usd'])
    best=candidates[0]
    return {'objective':'minimize risk-adjusted cost per ton','risk_aversion':risk_aversion,'recommended':best,'top_candidates':candidates[:10],'forecast':forecast,'constraints':{'route':'newcastle->paradip','parcel_range_t':[min_parcel_t,max_parcel_t],'step_t':step_t,'physical_constraints':'draft/LOA/beam/benchmark DWT'}}
