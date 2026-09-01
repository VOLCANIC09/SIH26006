import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from backend.app.ml.regime import current_regime
from backend.app.ml.model_tournament import tournament
from backend.app.ml.monte_carlo import simulate_voyage, stress_test
from backend.app.ml.prediction import forecast_route
from backend.app.ml.sensitivity import sensitivity
from backend.app.services.quant_optimizer import optimize


def main():
    r=current_regime(); assert r['regime'] in {'FREIGHT_SHOCK','HIGH_VOLATILITY','LOW_DEMAND','NORMAL'}
    t=tournament(); assert t['winner']=='v6_blend' and len(t['models'])==4
    f=forecast_route('panamax',1)[0]
    kw=dict(vessel_id='panamax',parcel_size_t=70000,base_freight_usd_t=f['route_freight_proxy_usd_t'],distance_nm=5400,transit_days=18,load_rate_t_day=35000,discharge_rate_t_day=25000,waiting_days=3,num_simulations=3000,seed=11)
    mc=simulate_voyage(**kw); assert abs(sum(mc['risk_contribution'].values())-1)<0.001
    st=stress_test(**kw); assert st['scenarios'][-1]['expected_total_cost_usd']>st['scenarios'][0]['expected_total_cost_usd']
    se=sensitivity(kw, simulations=1500); assert se['ranked_drivers'][0]['range_usd']>=se['ranked_drivers'][-1]['range_usd']
    op=optimize(70000,.35,1000,step_t=10000); assert op['recommended']['vessel_id']=='panamax'
    print('V7 QUANT TESTS PASSED')

if __name__=='__main__': main()
