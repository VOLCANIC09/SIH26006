"""Monte Carlo risk engine for freight-voyage decisions.

All stochastic inputs are explicit and labelled. Route freight is a derived proxy,
not an observed fixture series. The engine is designed to sit immediately before
production Monte Carlo and to expose assumptions for auditability.
"""
from __future__ import annotations
import math
from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
MARKET = ROOT / "data" / "processed" / "market_features.csv"
VESSELS = ROOT / "backend" / "data" / "vessels.csv"
DEM = ROOT / "backend" / "data" / "demurrage_basis.csv"


def _positive_lognormal(mean: float, cv: float, rng: np.random.Generator, n: int) -> np.ndarray:
    mean = max(float(mean), 1e-6)
    cv = max(float(cv), 1e-6)
    sigma2 = math.log(1 + cv * cv)
    sigma = math.sqrt(sigma2)
    mu = math.log(mean) - sigma2 / 2
    return rng.lognormal(mu, sigma, n)


def _market_stats() -> dict:
    df = pd.read_csv(MARKET, parse_dates=["date"]).sort_values("date")
    bdi_ret = df["bdi"].pct_change().replace([np.inf, -np.inf], np.nan).dropna()
    coal_ret = df["coal_price_usd_t"].pct_change().replace([np.inf, -np.inf], np.nan).dropna()
    brent_ret = df["brent_usd_bbl"].pct_change().replace([np.inf, -np.inf], np.nan).dropna()
    # Robustly cap extreme historical observations when translating monthly shocks to one voyage.
    return {
        "bdi_return_vol": float(np.clip(bdi_ret.std(), 0.05, 0.45)),
        "coal_return_vol": float(np.clip(coal_ret.std(), 0.03, 0.40)),
        "brent_return_vol": float(np.clip(brent_ret.std(), 0.03, 0.45)),
        "latest_coal": float(df["coal_price_usd_t"].iloc[-1]),
        "latest_brent": float(df["brent_usd_bbl"].iloc[-1]),
    }


def _demurrage(vessel_id: str) -> dict:
    d = pd.read_csv(DEM).set_index("vessel_id").loc[vessel_id]
    return {
        "base": float(d.india_coal_reference_usd_day),
        "lower": float(d.lower_bound_usd_day),
        "upper": float(d.upper_bound_usd_day),
    }


def simulate_voyage(
    *,
    vessel_id: str,
    parcel_size_t: float,
    base_freight_usd_t: float,
    distance_nm: float,
    transit_days: float,
    load_rate_t_day: float,
    discharge_rate_t_day: float,
    waiting_days: float,
    num_simulations: int = 20000,
    confidence_level: float = 0.95,
    fuel_price_usd_t: float | None = None,
    seed: int = 42,
) -> dict:
    if parcel_size_t <= 0 or base_freight_usd_t <= 0 or distance_nm <= 0:
        raise ValueError("parcel_size_t, base_freight_usd_t and distance_nm must be positive")
    if not 0.5 <= confidence_level < 1:
        raise ValueError("confidence_level must be in [0.5, 1)")

    vessels = pd.read_csv(VESSELS).set_index("id")
    if vessel_id not in vessels.index:
        raise ValueError(f"Unknown vessel: {vessel_id}")
    v = vessels.loc[vessel_id]
    market = _market_stats()
    dem = _demurrage(vessel_id)
    rng = np.random.default_rng(seed)

    # Joint market shock: freight, coal and fuel move together but not perfectly.
    corr = np.array([[1.0, 0.45, 0.55], [0.45, 1.0, 0.50], [0.55, 0.50, 1.0]])
    z = rng.multivariate_normal(np.zeros(3), corr, size=num_simulations)
    freight_shock = z[:, 0] * market["bdi_return_vol"]
    coal_shock = z[:, 1] * market["coal_return_vol"]
    fuel_shock = z[:, 2] * market["brent_return_vol"]

    # Lognormal rate shock keeps rates positive and reproduces multiplicative market moves.
    # Coal demand shock is a secondary demand signal; keep its loading deliberately modest.
    simulated_rate = base_freight_usd_t * np.exp(
        freight_shock + 0.10 * coal_shock - 0.5 * market["bdi_return_vol"] ** 2
    )
    simulated_rate = np.clip(simulated_rate, 1.0, None)

    # Waiting is right-skewed: operational delays cannot be negative and tail events matter.
    congestion_cv = 0.35 if waiting_days <= 3 else 0.50 if waiting_days <= 5 else 0.65
    simulated_waiting = _positive_lognormal(max(waiting_days, 0.25), congestion_cv, rng, num_simulations)

    # Small correlation between freight congestion and waiting risk.
    simulated_waiting *= np.exp(0.12 * np.clip(freight_shock, -2.0, 2.0))

    base_fuel = fuel_price_usd_t if fuel_price_usd_t is not None else max(250.0, market["latest_brent"] * 1.10)
    simulated_fuel_price = np.clip(base_fuel * np.exp(fuel_shock - 0.5 * market["brent_return_vol"] ** 2), 120.0, None)

    load_days = parcel_size_t / max(float(load_rate_t_day), 1.0)
    discharge_days = parcel_size_t / max(float(discharge_rate_t_day), 1.0)
    # Distance is nautical miles; speed is knots = nautical miles/day.
    sea_days = distance_nm / max(float(v.speed_laden_kn), 1.0)
    operational_days = sea_days + load_days + discharge_days

    fuel_mt = sea_days * float(v.fuel_laden_mt_day)
    fuel_cost = fuel_mt * simulated_fuel_price
    freight_cost = simulated_rate * parcel_size_t
    demurrage_rate = np.clip(
        dem["base"] * np.exp(0.20 * fuel_shock), dem["lower"], dem["upper"]
    )
    demurrage_cost = simulated_waiting * demurrage_rate
    total_cost = freight_cost + fuel_cost + demurrage_cost

    q = np.quantile(total_cost, [0.50, confidence_level, 0.99])
    tail = total_cost[total_cost >= q[1]]
    expected = float(total_cost.mean())
    p95 = float(q[1])
    cvar = float(tail.mean()) if len(tail) else p95
    baseline = parcel_size_t * base_freight_usd_t + fuel_mt * base_fuel + waiting_days * dem["base"]
    p15 = float(np.mean(total_cost > expected * 1.15))
    p20 = float(np.mean(total_cost > expected * 1.20))
    component_means = {'freight': float(freight_cost.mean()), 'fuel': float(fuel_cost.mean()), 'demurrage': float(demurrage_cost.mean())}
    component_total = max(sum(component_means.values()), 1e-9)
    risk_contribution = {k: round(v / component_total, 4) for k, v in component_means.items()}

    hist, edges = np.histogram(total_cost, bins=12)
    distribution = [
        {"lower_usd": round(float(edges[i]), 2), "upper_usd": round(float(edges[i + 1]), 2), "frequency": int(hist[i])}
        for i in range(len(hist))
    ]

    return {
        "simulations": int(num_simulations),
        "seed": int(seed),
        "confidence_level": confidence_level,
        "expected_total_cost_usd": round(expected, 2),
        "median_total_cost_usd": round(float(q[0]), 2),
        "var_total_cost_usd": round(p95, 2),
        "cvar_total_cost_usd": round(cvar, 2),
        "p99_total_cost_usd": round(float(q[2]), 2),
        "probability_gt_15pct_expected": round(p15, 4),
        "probability_gt_20pct_expected": round(p20, 4),
        "baseline_cost_usd": round(float(baseline), 2),
        "fuel_cost_expected_usd": round(float(fuel_cost.mean()), 2),
        "freight_cost_expected_usd": round(float(freight_cost.mean()), 2),
        "demurrage_cost_expected_usd": round(float(demurrage_cost.mean()), 2),
        "waiting_days_p50": round(float(np.quantile(simulated_waiting, 0.50)), 2),
        "waiting_days_p95": round(float(np.quantile(simulated_waiting, 0.95)), 2),
        "freight_rate_p50_usd_t": round(float(np.quantile(simulated_rate, 0.50)), 2),
        "freight_rate_p95_usd_t": round(float(np.quantile(simulated_rate, 0.95)), 2),
        "fuel_price_p95_usd_t": round(float(np.quantile(simulated_fuel_price, 0.95)), 2),
        "operational_days_ex_waiting": round(float(operational_days), 2),
        "distribution": distribution,
        "risk_contribution": risk_contribution,
        "assumptions": {
            "route_freight": "derived proxy from validated BDI forecast; not observed fixture data",
            "fuel": "Brent-linked fuel proxy; replace with bunker benchmark when licensed/available",
            "waiting": "right-skewed operational-delay proxy calibrated from project port baseline",
            "demurrage": "bounded India coal contractual reference proxy; charter-party terms should replace it",
            "market_shocks": "correlated lognormal shocks using historical monthly return volatility; coal demand shock has a modest freight loading",
        },
    }


def stress_test(**kwargs) -> dict:
    """Evaluate named market/operations shocks with deterministic seeds."""
    base = dict(kwargs)
    base.pop('num_simulations', None)
    scenarios = {
        'base': {},
        'freight_plus_25pct': {'base_freight_usd_t': float(base['base_freight_usd_t']) * 1.25},
        'fuel_plus_30pct': {'fuel_price_usd_t': float(base.get('fuel_price_usd_t') or 250.0) * 1.30},
        'waiting_plus_3_days': {'waiting_days': float(base['waiting_days']) + 3.0},
        'combined_stress': {
            'base_freight_usd_t': float(base['base_freight_usd_t']) * 1.25,
            'fuel_price_usd_t': float(base.get('fuel_price_usd_t') or 250.0) * 1.30,
            'waiting_days': float(base['waiting_days']) + 3.0,
        },
    }
    rows = []
    for i, (name, overrides) in enumerate(scenarios.items()):
        kw = dict(base); kw.update(overrides); kw['num_simulations'] = 10000; kw['seed'] = int(base.get('seed', 42) + i * 100)
        mc = simulate_voyage(**kw)
        rows.append({'scenario': name, 'expected_total_cost_usd': mc['expected_total_cost_usd'], 'var95_usd': mc['var_total_cost_usd'], 'cvar95_usd': mc['cvar_total_cost_usd'], 'probability_gt_15pct_expected': mc['probability_gt_15pct_expected']})
    base_cost = rows[0]['expected_total_cost_usd']
    for r in rows:
        r['delta_vs_base_usd'] = round(r['expected_total_cost_usd'] - base_cost, 2)
    return {'scenarios': rows, 'base_expected_cost_usd': base_cost, 'method': 'deterministic scenario shocks over the same stochastic voyage engine'}
