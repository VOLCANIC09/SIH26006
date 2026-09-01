"""Risk-aware vessel/contract decision engine built on Monte Carlo outputs."""
from __future__ import annotations
import pandas as pd
from pathlib import Path
from backend.app.ml.prediction import forecast_route
from backend.app.ml.monte_carlo import simulate_voyage

ROOT = Path(__file__).resolve().parents[3]
VESSEL_FILE = ROOT / "backend" / "data" / "vessels.csv"
PORT_FILE = ROOT / "backend" / "data" / "ports.csv"


def _feasible(v, origin, dest, parcel):
    return (
        float(v.draft_limit) <= min(float(origin.draft), float(dest.draft))
        and float(v.loa_limit) <= float(dest.loa)
        and float(v.beam_limit) <= float(dest.beam)
        and float(v.benchmark_dwt) >= parcel
    )


def evaluate(route_id: str = "aus-par", parcel_size_t: float = 70000, horizon_months: int = 1,
             simulations: int = 20000, risk_aversion: float = 0.35, seed: int = 42) -> dict:
    if route_id != "aus-par":
        raise ValueError("The validated MC decision engine currently supports aus-par only.")
    ports = pd.read_csv(PORT_FILE).set_index("id")
    vessels = pd.read_csv(VESSEL_FILE).set_index("id")
    origin, dest = ports.loc["newcastle"], ports.loc["paradip"]
    forecast = forecast_route("panamax", horizon_months)[0]
    results = []

    for vessel_id, v in vessels.iterrows():
        if not _feasible(v, origin, dest, parcel_size_t):
            continue
        rate = float(forecast["route_freight_proxy_usd_t"])
        # Vessel scaling around the Panamax forecast keeps route proxy consistent across classes.
        scale = {"capesize": 0.88, "panamax": 1.00, "supramax": 1.16, "handysize": 1.38}[vessel_id]
        rate *= scale
        mc = simulate_voyage(
            vessel_id=vessel_id,
            parcel_size_t=parcel_size_t,
            base_freight_usd_t=rate,
            distance_nm=5400,
            transit_days=float(origin.transit_days),
            load_rate_t_day=float(origin.handling_rate),
            discharge_rate_t_day=float(dest.handling_rate),
            waiting_days=float(dest.waiting_days),
            num_simulations=simulations,
            seed=seed + list(vessels.index).index(vessel_id),
        )
        # Risk score is an interpretable normalized blend of expected cost and CVaR.
        risk_score = (1 - risk_aversion) * mc["expected_total_cost_usd"] + risk_aversion * mc["cvar_total_cost_usd"]
        results.append({
            "vessel_id": vessel_id,
            "vessel_name": v["name"],
            "base_freight_proxy_usd_t": round(rate, 2),
            "expected_cost_usd": mc["expected_total_cost_usd"],
            "var95_usd": mc["var_total_cost_usd"],
            "cvar95_usd": mc["cvar_total_cost_usd"],
            "expected_cost_per_t_usd": round(mc["expected_total_cost_usd"] / parcel_size_t, 2),
            "risk_score_usd": round(risk_score, 2),
            "probability_gt_15pct_expected": mc["probability_gt_15pct_expected"],
            "waiting_p95_days": mc["waiting_days_p95"],
            "mc": mc,
        })
    results.sort(key=lambda x: x["risk_score_usd"])
    if not results:
        raise ValueError("No feasible vessel for the requested parcel size and port constraints")
    best = results[0]
    second = results[1] if len(results) > 1 else None
    margin = None if second is None else max(0.0, (second["risk_score_usd"] - best["risk_score_usd"]) / second["risk_score_usd"])
    confidence = min(0.99, max(0.50, 0.60 + (margin or 0) * 2.0))

    return {
        "route_id": route_id,
        "decision": "SELECT_VESSEL",
        "recommended_vessel": best["vessel_id"],
        "confidence": round(confidence, 3),
        "reason": "Lowest risk-adjusted simulated voyage cost among physically feasible vessels.",
        "forecast": forecast,
        "risk_aversion": risk_aversion,
        "parcel_size_t": parcel_size_t,
        "ranked_vessels": results,
        "decision_note": "Recommendation is a quantitative decision aid, not a chartering instruction; verify live fixture, bunker, port and charter-party terms before execution.",
    }
