# V7 Validation Summary

Validated on the bundled 2011-2025 market snapshot.

- Existing V6 validation: **40/40 checks passed**.
- V7 quantitative suite: **passed**.
- FastAPI smoke tests for `/api/quant/overview`, `/api/quant/stress`, and `/api/quant/optimize`: **HTTP 200**.
- Model tournament winner on the locked 2023-2025 holdout: **V6 blend**.
- Current regime diagnostic: **HIGH_VOLATILITY** under the bundled historical snapshot.
- Monte Carlo risk contribution is reported for freight, fuel and demurrage.
- Stress testing covers freight +25%, fuel +30%, waiting +3 days, and a combined stress case.
- Constrained optimizer searches feasible vessel/parcel combinations and minimizes risk-adjusted cost per ton.

## Model-performance figures retained from V6

- Full walk-forward MAE: 304.25 BDI points.
- Full walk-forward RMSE: 439.02.
- Persistence MAE: 346.07.
- Improvement versus persistence: 12.09%.
- MASE: 0.879.
- Direction classifier accuracy: 59.81%.
- 90% interval coverage: 88.89%.
- Locked holdout MAE: 289.06.
- Locked holdout improvement versus persistence: 21.36%.

These are historical out-of-sample validation statistics, not guarantees of future performance.
