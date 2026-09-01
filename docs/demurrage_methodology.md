# Demurrage methodology

Demurrage is not a universal static vessel attribute. It is a negotiated charter-party rate and depends on vessel class, market conditions, port, cargo, laytime and fixture terms.

The model therefore no longer hard-codes a single USD 22,000/day value.

## Inputs
- India coal contractual reference: an NTPC tender states that demurrage shall not exceed USD 15,000/day for Panamax/Capesize vessels, with dispatch at half the demurrage rate.
- Baltic Exchange standard vessel classes and dry-bulk market benchmarks provide the market context and vessel-size basis.
- Class-specific bounds are used as transparent model bands where public route-specific demurrage fixtures are unavailable.

## Model
For each vessel class:
1. Start from the India coal contractual reference.
2. Scale the reference using the current market earnings proxy when available.
3. Clip the result to the class-specific uncertainty band.
4. Monte Carlo should sample the demurrage rate within this band rather than treating it as deterministic.

This is explicitly a **demurrage exposure proxy**, not an observed historical Australia-Paradip demurrage series.

## Sources
- Baltic Exchange dry bulk market information: https://www.balticexchange.com/en/data-services/market-information0/dry-services.html
- Baltic Exchange route/vessel specifications: https://www.balticexchange.com/en/data-services/routes.html
- NTPC tender contractual reference: public tender document (demurrage cap USD 15,000/day for Panamax/Capesize).
