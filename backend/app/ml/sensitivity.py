"""One-factor-at-a-time sensitivity and stress analysis around Monte Carlo inputs."""
from __future__ import annotations
from backend.app.ml.monte_carlo import simulate_voyage


def sensitivity(base_kwargs: dict, factors=(0.8, 0.9, 1.0, 1.1, 1.2), simulations=5000) -> dict:
    names = {
        'freight': 'base_freight_usd_t',
        'fuel': 'fuel_price_usd_t',
        'waiting': 'waiting_days',
    }
    out = []
    defaults = {'fuel_price_usd_t': 250.0, 'waiting_days': 3.0}
    for name, key in names.items():
        for factor in factors:
            kw = dict(base_kwargs)
            base_value = kw.get(key, defaults.get(key))
            kw[key] = float(base_value) * float(factor)
            kw['num_simulations'] = simulations
            kw['seed'] = int(base_kwargs.get('seed', 42) + round(factor * 1000) + len(out))
            mc = simulate_voyage(**kw)
            out.append({'factor': name, 'multiplier': factor, 'expected_total_cost_usd': mc['expected_total_cost_usd'], 'cvar95_usd': mc['cvar_total_cost_usd']})
    baseline = next(x for x in out if x['factor'] == 'freight' and x['multiplier'] == 1.0)
    impacts = []
    for name in names:
        row = [x for x in out if x['factor'] == name]
        impacts.append({'factor': name, 'range_usd': round(max(x['expected_total_cost_usd'] for x in row) - min(x['expected_total_cost_usd'] for x in row), 2), 'down_20pct_usd': next(x['expected_total_cost_usd'] for x in row if x['multiplier'] == .8), 'up_20pct_usd': next(x['expected_total_cost_usd'] for x in row if x['multiplier'] == 1.2)})
    impacts.sort(key=lambda x: x['range_usd'], reverse=True)
    return {'scenarios': out, 'ranked_drivers': impacts, 'baseline_expected_cost_usd': baseline['expected_total_cost_usd']}
