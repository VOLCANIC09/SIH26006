# Forecast Engine V6

V6 is the strongest validated version in this project. It retains the V4 architecture (locked V3 ML/AR component + independently fitted damped Holt-Winters seasonal component) but adds a leakage-controlled hyperparameter selection stage.

## Method

1. Generate the seasonal component independently for every historical forecast month using only observations available before that month.
2. Keep the V3 out-of-sample predictions locked; they are never regenerated using the test observation.
3. Tune only two ensemble hyperparameters on the first 72 walk-forward observations:
   - trailing error window: candidates 12, 18, 24, 30, 36, 42 months
   - initial V3 weight: 0.55 to 0.90 in 0.05 increments
4. Freeze the selected configuration before evaluating the remaining holdout.
5. For each subsequent forecast month, compute the V3/seasonal blend from the trailing observed errors only.
6. Fit the production HGB level model and direction classifier on all available historical real data after validation.

Selected configuration:

- blend window: 36 months
- initial V3 weight: 0.80
- locked holdout starts: 2023-01-01

## Validation

- Full 108-month walk-forward MAE: 304.25 BDI points
- Full RMSE: 439.02
- Persistence MAE: 346.07
- Improvement vs persistence: 12.09%
- MASE: 0.879
- Locked holdout MAE: 289.06
- Locked holdout RMSE: 407.52
- Locked holdout persistence MAE: 367.56
- Locked holdout improvement: 21.36%
- Direction classifier accuracy: 59.81%
- 90% residual interval coverage: 88.89%

The locked holdout is not used for hyperparameter selection.

## Limitations

The BDI is volatile and the data horizon is monthly. The result should be described as good out-of-sample predictive performance rather than perfect or guaranteed accuracy. Australia -> Paradip freight remains a derived proxy because an open, sufficiently long historical fixture dataset for that exact route is not bundled.
