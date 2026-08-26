# SIH26006 — MVP Specification

## 1. Problem

Bulk-cargo importers need to decide how and when to secure
shipping capacity. Freight rates and operating conditions are
uncertain, while vessel and port constraints limit the available
options.

Our system will provide a quantitative decision-support tool that
estimates future shipping costs, evaluates uncertainty and risk,
and recommends a suitable shipping strategy.

---

## 2. Initial Scenario

For the first prototype we will model:

- Commodity: Coal
- Origin: Australia
- Destination: Paradip Port, India
- Planning horizon: 3 months
- Decision: When and how much shipping capacity to secure

The architecture should eventually be generalizable to other
commodities, origins and destinations.

---

## 3. System Objectives

The system will:

1. Forecast future freight rates.
2. Estimate uncertainty around the forecast.
3. Evaluate vessel and port feasibility.
4. Generate possible future market scenarios.
5. Estimate the cost of different shipping strategies.
6. Quantify financial risk.
7. Optimize the shipping decision.
8. Provide a risk-adjusted recommendation.

---

## 4. User Inputs

The prototype will accept:

- Commodity
- Cargo quantity
- Origin
- Destination
- Delivery period
- Risk tolerance
- Optional preferred vessel type

---

## 5. System Outputs

The prototype will provide:

### Freight forecast
- Expected freight rate
- Lower forecast range
- Upper forecast range

### Vessel recommendation
- Suitable vessel class
- Feasible alternatives
- Relevant constraints

### Cost analysis
- Expected shipping cost
- Cost distribution under uncertainty

### Risk analysis
- Value at Risk (VaR)
- Conditional Value at Risk (CVaR)
- Probability of high-cost outcomes

### Decision recommendation
- Recommended shipping strategy
- Recommended quantity/capacity to secure
- Expected cost
- Risk associated with the strategy

---

## 6. Quantitative Methods

The prototype may use:

- Time-series analysis
- Statistical forecasting
- Machine learning
- Probabilistic forecasting
- Monte Carlo simulation
- Value at Risk (VaR)
- Conditional Value at Risk (CVaR)
- Constrained optimization
- Historical backtesting

---

## 7. Success Criteria

The prototype should:

1. Produce a reproducible freight-rate forecast.
2. Quantify forecast uncertainty.
3. Generate realistic cost scenarios.
4. Compare alternative shipping strategies.
5. Demonstrate that the recommended strategy performs
   better than at least one simple baseline under historical
   backtesting.

   ## 8. Decision Variables

The optimization component will determine:

- Amount of cargo/shipping capacity secured now
- Amount secured later
- Vessel/chartering option selected
- Allocation between available options where applicable.