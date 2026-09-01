import numpy as np
from backend.app.ml.monte_carlo import simulate_voyage

def calculate_voyage_days(size: float, load_rate: float, discharge_rate: float, transit_days: float, waiting_days: float) -> dict:
    load_days = round(size / max(load_rate, 1.0), 2)
    discharge_days = round(size / max(discharge_rate, 1.0), 2)
    total_days = round(transit_days + load_days + discharge_days + waiting_days, 1)
    return {"load_days": load_days, "discharge_days": discharge_days, "transit_days": transit_days, "waiting_days": waiting_days, "total_days": total_days}

def run_monte_carlo_cost_simulation(base_rate, rate_volatility, demurrage_rate, waiting_days, parcel_size, confidence_level=0.95, num_simulations=5000):
    # Backward-compatible generic calculator. The production decision engine uses simulate_voyage().
    rng = np.random.default_rng(42)
    rates = np.maximum(rng.lognormal(np.log(max(base_rate, 1)) - 0.5*rate_volatility**2, rate_volatility, num_simulations), 1.0)
    waits = rng.lognormal(np.log(max(waiting_days, .25)) - .5*.4**2, .4, num_simulations)
    costs = rates * parcel_size + waits * demurrage_rate
    q = float(np.quantile(costs, confidence_level)); tail = costs[costs >= q]
    hist, edges = np.histogram(costs, bins=10)
    return {"expected_cost": round(float(costs.mean()),2), "var_95": round(q,2), "cvar_95": round(float(tail.mean()),2), "high_cost_probability": round(float(np.mean(costs > costs.mean()*1.15)),4), "cost_distribution":[{"bin":f"${int(edges[i]/1000)}k - ${int(edges[i+1]/1000)}k","frequency":int(hist[i])} for i in range(len(hist))]}
