# Real-data freight pipeline (stops immediately before Monte Carlo)

This pipeline replaces the original hand-generated market series with a reproducible data layer and a transparent route-freight proxy.

## What is real vs proxy

**Real public data**
- Australian coal benchmark: IMF Primary Commodity Prices via FRED (`PCOALAUUSDM`), monthly.
- Crude oil benchmark used as a bunker-cost proxy: IMF/FRED Brent (`POILBREUSDM`), monthly.
- Baltic Dry Index: ÅSUB PxWeb monthly series, 2011–2025. The BDI is a real dry-bulk freight-market index.
- Paradip port berth constraints: Paradip Port Authority official berth specifications.
- Vessel reference dimensions: Baltic Exchange Capesize benchmark plus conservative class-level engineering assumptions for Panamax/Supramax/Handysize.

**Proxy / modelled**
- Australia → Paradip spot freight is not publicly available as a clean, freely redistributable historical monthly fixture series. We therefore construct a *route-freight proxy* from BDI + fuel proxy + Australian coal price, calibrated to the legacy route-rate scale already present in the MVP. The output is explicitly tagged `proxy_target=true`.
- Port waiting time is modelled from a configurable baseline until a public historical port-call/queue series is supplied.

## Pipeline

`raw sources -> validation -> monthly alignment -> lag/return features -> route freight proxy -> walk-forward ML forecast -> residual/conformal uncertainty -> vessel/port feasibility -> pre-Monte-Carlo scenario inputs`

The pipeline deliberately does **not** perform Monte Carlo simulation. Its final artifact is a scenario-ready distribution specification: forecast mean, uncertainty scale, empirical residual quantiles, feasible vessel set, voyage-day assumptions, and cost coefficients.

## Run

```bash
pip install -r backend/requirements.txt
python -m data_pipeline.build_dataset --start 2011-01-01 --end 2025-12-01
python -m backend.app.ml.training.train_freight_real
```

If a source is unavailable, the downloader records the failure in `data/raw/market/source_status.json`; it does not silently label generated data as real.
