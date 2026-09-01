# V7 Quantitative Engine

V7 adds four decision-quality layers on top of the validated V6 backend:

1. **Market regime detection** — labels the current BDI state using rolling return volatility and level relative to the long-run mean.
2. **Model tournament** — compares persistence, the V3 ensemble, the V6 blend and seasonal Holt-Winters on locked out-of-sample predictions; the 2023-2025 holdout remains untouched for V6 tuning.
3. **Risk decomposition, sensitivity and stress testing** — Monte Carlo now reports component contributions and deterministic freight/fuel/waiting shocks.
4. **Constrained quantitative optimization** — searches feasible vessel and parcel-size combinations and minimizes risk-adjusted expected cost per ton.

## Important data discipline

The forecast target remains the **real BDI**. Australia-Newcastle to Paradip freight remains a **derived proxy** because an open, long historical fixture series is not bundled. Baltic C18/P9 are route benchmark references, not fabricated historical observations.

## New API endpoints

- `/api/quant/overview`
- `/api/quant/sensitivity`
- `/api/quant/stress`
- `/api/quant/optimize`
- Existing `/api/decision-engine` and `/api/risks/monte-carlo` remain available.

## Interpretation

The optimizer is a quantitative decision aid. It does not replace live fixture quotes, bunker assessments, port notices or charter-party terms.
