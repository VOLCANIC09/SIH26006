"""Generate backend-facing CSVs from the reproducible real-data pipeline.

The generated market file keeps legacy compatibility columns for the existing
training/UI code while adding the real-data fields used by V7.
"""
from pathlib import Path
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
BACK = ROOT / "backend" / "data"
PROC = ROOT / "data" / "processed"
LEGACY = ROOT / "backend" / "data" / "freight_rates.csv"

def main():
    BACK.mkdir(parents=True, exist_ok=True)
    market = pd.read_csv(PROC / "market_features.csv", parse_dates=["date"]).sort_values("date")
    market["month"] = market["date"].dt.strftime("%b %y")
    # Legacy names retained for compatibility; values are derived from the real-data snapshot.
    market["bunker_price"] = market["fuel_proxy_usd_t"]
    market["coal_price_index"] = market["coal_price_usd_t"]
    market[["month", "bdi", "bunker_price", "coal_price_index", "date", "brent_usd_bbl", "coal_price_usd_t", "fuel_proxy_usd_t"]].to_csv(BACK / "market_data.csv", index=False)

    proxy = pd.read_csv(PROC / "freight_proxy.csv")
    proxy = proxy[proxy["route_id"].eq("aus-par")].copy()
    proxy["month"] = pd.to_datetime(proxy["date"]).dt.strftime("%b %y")
    proxy["rate"] = proxy["rate_proxy"]
    proxy["type"] = "DerivedProxy"
    proxy = proxy[["route_id", "vessel_id", "month", "rate", "type"]]

    if LEGACY.exists():
        old = pd.read_csv(LEGACY)
        old = old[old["route_id"] != "aus-par"]
        rates = pd.concat([old, proxy], ignore_index=True)
    else:
        rates = proxy
    rates.to_csv(BACK / "freight_rates.csv", index=False)
    print("Generated backend/data/market_data.csv and freight_rates.csv from real/derived pipeline data.")

if __name__ == "__main__":
    main()
