# Monte Carlo Risk + Decision Engine

## Purpose
This layer converts the validated forecast and voyage assumptions into a probabilistic cost distribution, then ranks feasible vessels using a risk-aware objective.

## Simulation
Each run generates 20,000 default scenarios. Freight, coal/fuel and market shocks are correlated; freight and fuel use positive multiplicative shocks. Port waiting time is right-skewed rather than Gaussian because operational delays cannot be negative and tail events matter. Demurrage is bounded by the documented India coal contractual reference proxy.

For each scenario:

`Total Cost = Freight Rate × Cargo + Fuel Consumption × Fuel Price + Waiting Days × Demurrage Rate`

The engine reports expected cost, median, VaR95, CVaR95, P99, tail probabilities, component costs and distribution bins.

## Risk measures
- **VaR95:** 95th percentile of simulated total cost.
- **CVaR95:** average cost in the worst 5% of scenarios.
- **P(>15%) / P(>20%):** probability total cost exceeds the simulated expected cost by those percentages.

## Decision engine
For every physically feasible vessel:

`Risk Score = (1 - λ) × E[Cost] + λ × CVaR95`

where `λ` is the user-selected risk aversion in [0,1]. The vessel with the lowest risk score is recommended. This makes the recommendation sensitive to tail risk rather than only average cost.

## Important provenance
Australia→Paradip freight remains a **derived proxy** from the validated BDI forecast. Fuel is a **Brent-linked proxy**, and demurrage is a bounded contractual-reference proxy. Replace these with licensed live fixture/bunker/charter-party observations for production deployment.

## API
- `GET /api/risks/monte-carlo`
- `GET /api/decision-engine`
- `GET /api/pre-mc`

Example:
`/api/decision-engine?routeId=aus-par&parcelSize=70000&simulations=20000&riskAversion=0.35`
