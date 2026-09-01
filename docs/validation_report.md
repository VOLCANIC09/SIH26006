# Validation Report — V6

## Forecasting

| Metric | V6 |
|---|---:|
| Walk-forward observations | 108 |
| MAE | 304.25 BDI points |
| RMSE | 439.02 |
| Persistence MAE | 346.07 |
| Improvement vs persistence | 12.09% |
| MASE | 0.879 |
| Direction classifier accuracy | 59.81% |
| 90% interval coverage | 88.89% |
| Locked holdout start | 2023-01 |
| Locked holdout MAE | 289.06 |
| Locked holdout persistence MAE | 367.56 |
| Locked holdout improvement | 21.36% |

## Monte Carlo / Risk

The risk engine was executed with 20,000 scenarios for a 70,000 t Panamax case.

- Expected total cost: $5.245M
- Median total cost: $5.137M
- VaR 95%: $6.819M
- CVaR 95%: $7.411M
- P99: $7.773M
- Probability of >15% cost over expected: 16.59%
- Probability of >20% cost over expected: 11.39%

A 5,000 vs 20,000 simulation reproducibility/convergence smoke test passed with <3% relative expected-cost difference.

## Decision Engine

For the validated 70,000 t Australia -> Paradip scenario, Panamax is the only vessel satisfying the current bundled port/vessel constraints, so the risk-adjusted decision engine selects Panamax. This is a feasibility/risk decision, not a claim about live charter availability.

## Test status

- Full validation suite: 40/40 passed
- One-command data/build/train/pre-MC pipeline: passed
- Monte Carlo execution: passed
- Decision engine execution: passed
- API smoke tests: passed
- Python compilation: passed
