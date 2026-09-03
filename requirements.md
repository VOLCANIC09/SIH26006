# SIH26006 — Data Requirements

## 1. Freight Data

Required:
- Date
- Route/origin
- Destination
- Vessel class
- Freight rate

Purpose:
Forecast future freight rates.

---

## 2. Fuel Data

Required:
- Date
- Bunker/fuel price

Purpose:
Capture changes in vessel operating costs.

---

## 3. Commodity Data

Required:
- Date
- Coal price
- Trade/import volume where available

Purpose:
Capture changes in commodity demand and market conditions.

---

## 4. Vessel Data

Required:
- Vessel class
- Deadweight tonnage
- Draft
- Length
- Beam
- Typical speed
- Fuel consumption where available

Purpose:
Determine vessel feasibility and estimate transportation costs.

---

## 5. Port Data -- Moreover a contratint than real data. (Draft[vessel] <= Draft[port]) New-Item docs\data_sources.csv -ItemType File

Required:
- Port
- Maximum draft
- Cargo handling information
- Vessel restrictions where available

Purpose:
Determine whether a vessel can realistically be used.

---

## 6. Calendar/Time Data

Required:
- Date
- Month
- Year
- Season

Purpose:
Capture seasonal patterns.

- httpx2>=2.0 (FastAPI/Starlette TestClient support)
