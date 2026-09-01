# Validation methodology

Run `python tests/run_validation.py` from the project root. The suite performs:

1. Raw-data integrity: row counts, missing values, positive values, unique dates.
2. Feature construction: non-empty dataset and no NaNs.
3. Walk-forward BDI forecast backtest: MAE, RMSE, MAPE, persistence baseline, improvement, directional accuracy.
4. Residual 90% interval coverage.
5. Vessel reference checks for benchmark Panamax particulars.
6. Deterministic voyage-day calculation check.
7. Demurrage boundedness checks for all four vessel classes.
8. Pre-Monte-Carlo integration: forecast, vessels, demurrage, MC-ready flag.

Important: a route-freight proxy is not scored against itself. The old architecture trained a model to reproduce a hand-written proxy target; that was removed from the headline validation.

## Interpreting accuracy
- MAE/RMSE are in BDI index points.
- Directional accuracy is the percentage of out-of-sample month-to-month direction changes predicted correctly.
- Baseline improvement compares against persistence (next month = current month).
- Interval coverage tests whether the empirical residual 90% interval captures roughly 80-98% of held-out observations.
- Vessel and formula tests are deterministic correctness tests, not statistical accuracy.
