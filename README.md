
> V7 Quantitative Engine: regime detection, model tournament, stress/sensitivity analysis, risk decomposition, and constrained optimization.
# SIH26006 — Bulk Cargo Procurement & Vessel Chartering Decision Support System

## What is real vs proxy
- **Real and backtested:** monthly BDI forecast.
- **Real explanatory inputs:** Australian coal benchmark and Brent crude benchmark.
- **Real reference data:** Baltic benchmark vessel particulars, Paradip constraints, India-coal demurrage contractual reference.
- **Real route references:** Baltic C18/P9 Gladstone-Dhamra benchmarks (public from 2026).
- **Derived proxy:** Australia -> Paradip freight estimate. There is no bundled historical open fixture series, so this is never presented as observed freight.

## Reproducible pipeline
1. `python -m data_pipeline.download_data` — use bundled real snapshots; no network required.
2. `python -m data_pipeline.build_dataset` — build features and derived route proxy.
3. `python -m backend.app.ml.training.train_freight_real` — train and walk-forward validate BDI forecast.
4. `python tests/run_validation.py` — run the complete pre-Monte-Carlo validation suite.
5. `python -m backend.app.ml.pre_mc` — inspect the validated scenario state immediately before Monte Carlo.

For live refresh, use `python -m data_pipeline.download_data --refresh --allow-failure`. The local snapshot remains available if an external source blocks automated requests.

## Current scenario
Commodity: Coal
Origin: Australia
Destination: Paradip
Planning horizon: 3 months

## Forecast engine v2 validation
The current bundled model uses richer lag/rolling market features and a 40% ML + 60% persistence ensemble. Executed walk-forward validation on 108 real monthly observations achieved MAE **329.54 BDI points** versus **346.07** for persistence, a **4.78% improvement**. Directional accuracy was **50.93%** and 90% residual coverage was **88.89%**. See `docs/model_improvement.md` and `docs/validation_report.md`.

## Forecast Engine v4

The latest tested forecast engine uses a leakage-controlled dynamic ensemble of the v3 ML/AR component and damped seasonal Holt-Winters. Walk-forward validation over 108 observations produced MAE 307.30 BDI points, RMSE 438.55, MASE 0.888, 11.20% improvement over persistence, 56.07% forecast directional accuracy, and 88.89% 90% interval coverage. The route freight estimate remains explicitly labelled DERIVED_PROXY.

## Monte Carlo + Risk Decision Engine (completed)

The project now includes the post-forecast quantitative risk layer:

1. **Monte Carlo voyage simulation** (`backend/app/ml/monte_carlo.py`)
   - 20,000 scenarios by default
   - correlated freight/commodity/fuel shocks
   - right-skewed port waiting delays
   - bounded demurrage proxy
   - expected cost, median, VaR95, CVaR95, P99 and tail probabilities
2. **Risk-aware decision engine** (`backend/app/services/decision_engine.py`)
   - filters vessels by physical feasibility
   - simulates each feasible vessel
   - ranks using `Risk Score = (1-λ)E[Cost] + λCVaR95`
   - returns recommendation, confidence and full vessel ranking
3. **API endpoints**
   - `GET /api/risks/monte-carlo`
   - `GET /api/decision-engine`
   - `GET /api/pre-mc`
4. **Validation**
   - `python tests/run_all_tests.py`
   - 40 legacy forecasting/validation checks + Monte Carlo/decision-engine checks passed

### Quick start

From the project root:

```powershell
pip install -r requirements.txt
python tests/run_all_tests.py
python -m uvicorn backend.app.main:app --reload --port 8000
```

Open `/docs` and try `decision-engine` or `risks/monte-carlo`.

**Audit note:** Australia→Paradip freight, fuel and demurrage inputs remain explicitly labelled proxies. The system must not be represented as using observed Australia→Paradip fixture prices unless licensed fixture data is supplied.
