import os
import pandas as pd
import numpy as np

# Ensure data directory exists
os.makedirs("backend/data", exist_ok=True)

# 1. Generate ports.csv
ports_data = [
    # Discharge Ports
    {"id": "paradip", "name": "Paradip Port", "type": "discharge", "draft": 17.5, "loa": 280.0, "beam": 45.0, "capacity": 150000.0, "handling_rate": 25000.0, "congestion_index": "Medium", "waiting_days": 3.0, "transit_days": 0.0, "notes": "Capesize vessels handled at deep berths. High demand."},
    {"id": "vizag", "name": "Visakhapatnam (Vizag)", "type": "discharge", "draft": 14.5, "loa": 230.0, "beam": 32.5, "capacity": 80000.0, "handling_rate": 18000.0, "congestion_index": "High", "waiting_days": 5.0, "transit_days": 0.0, "notes": "Inner harbor restricted to Panamax. Outer harbor can take larger drafts."},
    {"id": "gangavaram", "name": "Gangavaram Port", "type": "discharge", "draft": 19.5, "loa": 300.0, "beam": 48.0, "capacity": 200000.0, "handling_rate": 30000.0, "congestion_index": "Low", "waiting_days": 1.0, "transit_days": 0.0, "notes": "Deepest port on the East Coast. Capesize standard berthing."},
    {"id": "gopalpur", "name": "Gopalpur Port", "type": "discharge", "draft": 12.5, "loa": 220.0, "beam": 32.0, "capacity": 70000.0, "handling_rate": 12000.0, "congestion_index": "Low", "waiting_days": 2.0, "transit_days": 0.0, "notes": "Mainly Supramax and Handysize. Upgrades in progress."},
    {"id": "dhamra", "name": "Dhamra Port", "type": "discharge", "draft": 18.0, "loa": 290.0, "beam": 45.0, "capacity": 180000.0, "handling_rate": 28000.0, "congestion_index": "Medium", "waiting_days": 2.5, "transit_days": 0.0, "notes": "Deep draft. Well connected, handles Cape size and Panamax."},
    {"id": "sandheads", "name": "Sagar-Sandheads", "type": "discharge", "draft": 9.5, "loa": 180.0, "beam": 28.0, "capacity": 30000.0, "handling_rate": 8000.0, "congestion_index": "Medium", "waiting_days": 4.0, "transit_days": 0.0, "notes": "Mainly lighterage operations. High swell risks."},
    {"id": "haldia", "name": "Haldia Dock Complex", "type": "discharge", "draft": 8.5, "loa": 170.0, "beam": 25.0, "capacity": 25000.0, "handling_rate": 10000.0, "congestion_index": "Very High", "waiting_days": 7.0, "transit_days": 0.0, "notes": "Severe river draft restrictions. Requires tide assistance."},
    # Load Ports
    {"id": "newcastle", "name": "Newcastle (Australia)", "type": "load", "draft": 16.5, "loa": 290.0, "beam": 45.0, "capacity": 0.0, "handling_rate": 35000.0, "congestion_index": "Low", "waiting_days": 0.0, "transit_days": 18.0, "notes": "Newcastle coal loader."},
    {"id": "baltimore", "name": "Baltimore (US)", "type": "load", "draft": 15.2, "loa": 270.0, "beam": 42.0, "capacity": 0.0, "handling_rate": 20000.0, "congestion_index": "Medium", "waiting_days": 0.0, "transit_days": 32.0, "notes": "US East Coast port."},
    {"id": "nacala", "name": "Nacala (Mozambique)", "type": "load", "draft": 14.0, "loa": 230.0, "beam": 32.5, "capacity": 0.0, "handling_rate": 15000.0, "congestion_index": "Low", "waiting_days": 0.0, "transit_days": 14.0, "notes": "Mozambique coal loader."},
    {"id": "vladivostok", "name": "Vladivostok (Russia)", "type": "load", "draft": 13.5, "loa": 225.0, "beam": 32.2, "capacity": 0.0, "handling_rate": 18000.0, "congestion_index": "Low", "waiting_days": 0.0, "transit_days": 12.0, "notes": "Russian Far East coal port."},
    {"id": "samarinda", "name": "Samarinda (Indonesia)", "type": "load", "draft": 12.0, "loa": 200.0, "beam": 32.2, "capacity": 0.0, "handling_rate": 22000.0, "congestion_index": "Low", "waiting_days": 0.0, "transit_days": 9.0, "notes": "Indonesian barge loader."}
]
pd.DataFrame(ports_data).to_csv("backend/data/ports.csv", index=False)

# 2. Generate vessels.csv
vessels_data = [
    {"id": "capesize", "name": "Capesize", "capacity": "120,000 - 180,000 DWT", "draft_limit": 18.5, "loa_limit": 290.0, "beam_limit": 45.0, "suitability": "Heavy coal, iron ore. Best for Paradip & Gangavaram deep berths only.", "cost_factor": 1.0},
    {"id": "panamax", "name": "Panamax", "capacity": "60,000 - 80,000 DWT", "draft_limit": 14.5, "loa_limit": 225.0, "beam_limit": 32.2, "suitability": "Coal, grains. Highly versatile, accepted at most East Coast ports.", "cost_factor": 1.3},
    {"id": "supramax", "name": "Supramax / Ultramax", "capacity": "50,000 - 60,000 DWT", "draft_limit": 12.8, "loa_limit": 200.0, "beam_limit": 32.2, "suitability": "Bulk cargo, gears onboard. Excellent for smaller draft ports like Haldia.", "cost_factor": 1.5},
    {"id": "handysize", "name": "Handysize", "capacity": "15,000 - 35,000 DWT", "draft_limit": 10.0, "loa_limit": 170.0, "beam_limit": 27.0, "suitability": "General dry bulk. Essential for Sagar-Sandheads lighterage and Haldia.", "cost_factor": 1.8}
]
pd.DataFrame(vessels_data).to_csv("backend/data/vessels.csv", index=False)

# 3. Generate freight_rates.csv (Historical rates)
# Generate monthly historical data for 36 months, e.g. Sep 23 to Aug 26
months = [
    # 2023
    "Sep 23", "Oct 23", "Nov 23", "Dec 23",
    # 2024
    "Jan 24", "Feb 24", "Mar 24", "Apr 24", "May 24", "Jun 24", "Jul 24", "Aug 24", "Sep 24", "Oct 24", "Nov 24", "Dec 24",
    # 2025
    "Jan 25", "Feb 25", "Mar 25", "Apr 25", "May 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Oct 25", "Nov 25", "Dec 25",
    # 2026
    "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26", "Jul 26", "Aug 26"
]

routes = [
    {"id": "aus-par", "origin": "newcastle", "destination": "paradip", "commodity": "Metallurgical Coal", "distance": 5400},
    {"id": "us-viz", "origin": "baltimore", "destination": "vizag", "commodity": "Thermal Coal", "distance": 9800},
    {"id": "moz-gan", "origin": "nacala", "destination": "gangavaram", "commodity": "Thermal Coal", "distance": 4100},
    {"id": "rus-gop", "origin": "vladivostok", "destination": "gopalpur", "commodity": "Coking Coal", "distance": 4500},
    {"id": "ind-hal", "origin": "samarinda", "destination": "haldia", "commodity": "Thermal Coal", "distance": 2200}
]

base_rates = {
    "aus-par": {"capesize": 18.5, "panamax": 24.2, "supramax": 29.8, "handysize": 38.0},
    "us-viz": {"capesize": 29.0, "panamax": 36.5, "supramax": 44.0, "handysize": 58.0},
    "moz-gan": {"capesize": 16.2, "panamax": 21.0, "supramax": 26.5, "handysize": 35.0},
    "rus-gop": {"capesize": 21.5, "panamax": 28.0, "supramax": 34.2, "handysize": 45.0},
    "ind-hal": {"capesize": 11.0, "panamax": 15.5, "supramax": 19.8, "handysize": 27.5}
}

rates_rows = []
np.random.seed(42)

for route_id, vessels_dict in base_rates.items():
    for vessel_id, base in vessels_dict.items():
        for idx, month in enumerate(months):
            # Introduce seasonal variations and trend
            seasonal = np.sin((idx / 12) * np.pi * 2) * 1.5
            trend = (idx / 36) * 3.5  # gradual upward trend
            noise = np.random.normal(0, 0.6)
            rate = round(base + seasonal + trend + noise, 2)
            rates_rows.append({
                "route_id": route_id,
                "vessel_id": vessel_id,
                "month": month,
                "rate": rate,
                "type": "Historical"
            })

pd.DataFrame(rates_rows).to_csv("backend/data/freight_rates.csv", index=False)

# 4. Generate market_data.csv (BDI and macroeconomic indices)
market_rows = []
for idx, month in enumerate(months):
    # Simulating Baltic Dry Index (BDI) and bunker price
    bdi_base = 1200
    bdi_seasonal = np.sin((idx / 12) * np.pi * 2) * 200
    bdi_trend = (idx / 36) * 400
    bdi_noise = np.random.normal(0, 50)
    bdi = int(bdi_base + bdi_seasonal + bdi_trend + bdi_noise)
    
    bunker_base = 500
    bunker_trend = (idx / 36) * 100
    bunker_noise = np.random.normal(0, 15)
    bunker = round(bunker_base + bunker_trend + bunker_noise, 2)
    
    market_rows.append({
        "month": month,
        "bdi": bdi,
        "bunker_price": bunker,
        "coal_price_index": round(110.0 + (idx / 36) * 15.0 + np.random.normal(0, 3.0), 2)
    })

pd.DataFrame(market_rows).to_csv("backend/data/market_data.csv", index=False)

# 5. Generate congestion.csv
congestion_rows = []
ports = ["paradip", "vizag", "gangavaram", "gopalpur", "dhamra", "sandheads", "haldia"]
for idx, month in enumerate(months):
    for port in ports:
        base_days = {"paradip": 3.0, "vizag": 5.0, "gangavaram": 1.0, "gopalpur": 2.0, "dhamra": 2.5, "sandheads": 4.0, "haldia": 7.0}[port]
        # Congestion fluctuates seasonally (monsoons in summer/monsoon months)
        month_num = (idx + 9) % 12  # Sep is month 9
        monsoon_factor = 2.0 if month_num in [5, 6, 7] else 0.0 # Jun, Jul, Aug
        noise = np.random.normal(0, 0.4)
        waiting_days = max(0.5, round(base_days + monsoon_factor + noise, 1))
        congestion_rows.append({
            "port_id": port,
            "month": month,
            "waiting_days": waiting_days,
            "queue_count": int(waiting_days * 2 + np.random.randint(0, 3))
        })

pd.DataFrame(congestion_rows).to_csv("backend/data/congestion.csv", index=False)

print("Generated all CSVs under backend/data successfully!")
