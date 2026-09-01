import os, sys, json
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from backend.app.ml.monte_carlo import simulate_voyage
from backend.app.services.decision_engine import evaluate


def main():
    r = simulate_voyage(vessel_id='panamax', parcel_size_t=70000, base_freight_usd_t=22, distance_nm=5400,
                        transit_days=18, load_rate_t_day=35000, discharge_rate_t_day=25000,
                        waiting_days=3, num_simulations=5000, seed=42)
    assert r['simulations'] == 5000
    assert r['expected_total_cost_usd'] > 0
    assert r['median_total_cost_usd'] <= r['var_total_cost_usd'] <= r['p99_total_cost_usd']
    assert r['cvar_total_cost_usd'] >= r['var_total_cost_usd']
    assert 0 <= r['probability_gt_15pct_expected'] <= 1
    assert r['waiting_days_p95'] > r['waiting_days_p50']
    d = evaluate(parcel_size_t=70000, simulations=3000, risk_aversion=.35, seed=42)
    assert d['decision'] == 'SELECT_VESSEL'
    assert d['recommended_vessel'] == 'panamax'
    assert len(d['ranked_vessels']) == 1
    d2 = evaluate(parcel_size_t=50000, simulations=3000, risk_aversion=.9, seed=42)
    assert d2['recommended_vessel'] in {'panamax','supramax'}
    print(json.dumps({'passed': 1, 'monte_carlo': 'PASS', 'decision_engine': 'PASS', 'recommended_70kt': d['recommended_vessel']}, indent=2))

if __name__ == '__main__': main()
