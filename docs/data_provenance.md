# SIH26006 data provenance and modeling honesty

## Real data bundled
- Australian coal benchmark: IMF Primary Commodity Prices via FRED, series PCOALAUUSDM, monthly USD/metric tonne.
- Brent crude benchmark: IMF Primary Commodity Prices via FRED, series POILBREUSDM, monthly USD/barrel.
- BDI: monthly series published by Technology Industries of Finland (source noted as Macrobond; page states BDI is reported by Baltic Exchange). ÅSUB PxWeb is retained as an independent public reference table for 2011-2025.

The repository contains a reproducible 2011-2025 snapshot of these three real series because automated HTTP access to FRED/PxWeb can be reset or blocked. The downloader therefore uses local snapshots by default and supports `--refresh`.

## Route freight: proxy, not observed historical fixture
There is no bundled open historical Australia -> Paradip voyage-fixture series. The route estimate is therefore explicitly a derived proxy. It scales a vessel-class scenario anchor by the real BDI level. This is NOT a historical target and must not be used to claim freight forecast accuracy.

Baltic Exchange C18 and P9 are the closest public route-specific benchmark definitions: Gladstone -> Dhamra for Capesize and Panamax coal. They entered public trial in January 2026 and live publication in February 2026. They are used as route-definition/calibration references; no fake historical C18/P9 values are created.

## What is actually backtested
The ML forecast engine predicts the real BDI series using walk-forward validation. Reported MAE/RMSE/directional accuracy therefore describe **BDI forecasting**, not Australia-Paradip fixture pricing. The route freight number shown to the application is a transparent derived proxy.

## Demurrage
Demurrage is not treated as a static vessel attribute. The engine uses an India-coal contractual reference plus bounded market-linked scaling. It remains a proxy because actual charter-party demurrage is negotiated.
