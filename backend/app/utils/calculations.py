import numpy as np

def calculate_voyage_days(size: float, load_rate: float, discharge_rate: float, transit_days: float, waiting_days: float) -> dict:
    """
    Calculates time spent in loading, discharging, and transit.
    """
    load_days = round(size / max(load_rate, 1.0), 2)
    discharge_days = round(size / max(discharge_rate, 1.0), 2)
    total_days = round(transit_days + load_days + discharge_days + waiting_days, 1)
    
    return {
        "load_days": load_days,
        "discharge_days": discharge_days,
        "transit_days": transit_days,
        "waiting_days": waiting_days,
        "total_days": total_days
    }

def run_monte_carlo_cost_simulation(
    base_rate: float,
    rate_volatility: float,
    demurrage_rate: float,
    waiting_days: float,
    parcel_size: float,
    confidence_level: float = 0.95,
    num_simulations: int = 5000
) -> dict:
    """
    Runs a Monte Carlo simulation of voyage costs to estimate expected costs, 
    Value at Risk (VaR), and Conditional Value at Risk (CVaR).
    """
    np.random.seed(42)
    
    # Standard deviation of the freight rate based on predicted volatility
    # If volatility is e.g. 0.15, standard deviation is base_rate * 0.15
    rate_std = max(0.5, base_rate * rate_volatility)
    
    # Simulate freight rates (Gaussian distribution, bound at a minimum rate)
    simulated_rates = np.random.normal(base_rate, rate_std, num_simulations)
    simulated_rates = np.maximum(simulated_rates, 5.0)  # Freight rate cannot go below $5/ton
    
    # Simulate waiting days (Lognormal or truncated normal distribution to ensure waiting days >= 0)
    # We assume standard deviation of waiting days is roughly 40% of the average waiting days
    waiting_std = max(0.5, waiting_days * 0.4)
    simulated_waiting = np.random.normal(waiting_days, waiting_std, num_simulations)
    simulated_waiting = np.maximum(simulated_waiting, 0.0)
    
    # Calculate costs for each simulation
    # Total Cost = Freight Cost + Demurrage Cost
    freight_costs = simulated_rates * parcel_size
    demurrage_costs = simulated_waiting * demurrage_rate
    total_costs = freight_costs + demurrage_costs
    
    # Expected cost
    expected_cost = float(np.mean(total_costs))
    
    # Sort costs to compute VaR and CVaR
    sorted_costs = np.sort(total_costs)
    
    # Value at Risk (VaR) at confidence level (e.g. 95th percentile)
    var_index = int(confidence_level * num_simulations)
    var_value = float(sorted_costs[var_index])
    
    # Conditional Value at Risk (CVaR) - average of the tail outcomes exceeding VaR
    cvar_value = float(np.mean(sorted_costs[var_index:]))
    
    # Probability of high-cost outcomes (e.g. costs exceeding expected cost by 15% or more)
    threshold = expected_cost * 1.15
    high_cost_prob = float(np.mean(total_costs > threshold))
    
    # Distribution data for chart rendering (binning into 10 intervals)
    hist, bin_edges = np.histogram(total_costs, bins=10)
    cost_distribution = []
    for i in range(len(hist)):
        cost_distribution.append({
            "bin": f"${int(bin_edges[i]/1000)}k - ${int(bin_edges[i+1]/1000)}k",
            "frequency": int(hist[i])
        })
        
    return {
        "expected_cost": round(expected_cost, 2),
        "var_95": round(var_value, 2),
        "cvar_95": round(cvar_value, 2),
        "high_cost_probability": round(high_cost_prob, 4),
        "cost_distribution": cost_distribution
    }
