# Real-data pipeline and pre-Monte-Carlo boundary

## Data hierarchy

1. **Market observations:** BDI, Australian coal benchmark, Brent benchmark.
2. **Operational constraints:** Paradip berth LOA/beam/draft.
3. **Derived features:** returns, lags, rolling BDI z-score, seasonal terms.
4. **Route target:** transparent Australia→Paradip freight proxy.
5. **Forecast:** walk-forward Gradient Boosting model.
6. **Uncertainty:** out-of-sample residual distribution + q05/q50/q95.
7. **Feasibility:** vessel dimensions versus berth constraints.
8. **Cost coefficients:** parcel size, baseline waiting, demurrage.
9. **Boundary:** `backend/app/ml/pre_mc.py` produces the complete input state for Monte Carlo; it performs no random simulation.

## Why a proxy is necessary

A clean, free historical Australia→Paradip monthly fixture series is not exposed by the public sources used here. Baltic Exchange publishes dry-bulk assessments and historical data, but detailed commercial route data is generally licensed. Therefore the system uses the real BDI as the freight-market signal and maps it to a route-specific $/t proxy using documented elasticities and legacy MVP calibration. This is deliberately separated from real observations.

## Important modelling choice

The crude series is **not** called bunker price. It is a bunker-cost proxy. If a licensed Singapore marine-fuel series becomes available, replace `fuel_proxy_usd_t` without changing the rest of the pipeline.

## Port constraint correction

The original MVP used 17.5m draft for Paradip. For thermal-coal berth feasibility, the data layer now uses the current Paradip Port Authority berth specifications: several coal berths list 14.5m admissible draft, 300m LOA and 46m beam. The Port Authority also reports Cape-size handling under specific conditions, so the model treats a standard 18.2m-draft Capesize as infeasible without lightering/high-tide/special approval rather than silently accepting it.
