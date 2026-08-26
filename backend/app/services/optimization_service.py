from sqlalchemy.orm import Session
from backend.app.database import crud
from backend.app.database.models import Port, Vessel, Route, FreightRate
from backend.app.utils.constants import DAILY_DEMURRAGE_RATES
from backend.app.utils.calculations import calculate_voyage_days

def optimize_shipping_vessel(db: Session, origin_id: str, dest_id: str, parcel_size: float) -> dict:
    # 1. Fetch ports
    ports = crud.get_ports(db)
    origin = next((p for p in ports if p.id == origin_id), None)
    dest = next((p for p in ports if p.id == dest_id), None)
    
    if not origin or not dest:
        raise ValueError("Invalid origin or destination port selected")
        
    vessels = crud.get_vessels(db)
    
    # 2. Find route if exists to fetch database freight rates
    routes = crud.get_routes(db)
    matching_route = next((r for r in routes if r.origin_id == origin_id and r.destination_id == dest_id), None)
    
    results = []
    
    for v in vessels:
        # Check physical feasibility constraints
        draft_ok = (v.draft_limit <= dest.draft) and (v.draft_limit <= origin.draft)
        loa_ok = (v.loa_limit <= dest.loa)
        beam_ok = (v.beam_limit <= dest.beam)
        feasible = draft_ok and loa_ok and beam_ok
        
        # Calculate turnaround days
        transit_days = origin.transit_days
        waiting_days = dest.waiting_days
        
        day_calcs = calculate_voyage_days(
            size=parcel_size,
            load_rate=origin.handling_rate,
            discharge_rate=dest.handling_rate,
            transit_days=transit_days,
            waiting_days=waiting_days
        )
        
        # Determine freight rate per ton
        freight_rate_per_ton = None
        if matching_route:
            # Get latest historical rate from DB
            db_rates = db.query(FreightRate).filter(
                FreightRate.route_id == matching_route.id,
                FreightRate.vessel_id == v.id,
                FreightRate.type == "Historical"
            ).all()
            if db_rates:
                # Get the last rate in chronological order
                from backend.app.ml.preprocessing import calculate_time_index
                db_rates.sort(key=lambda r: calculate_time_index(r.month))
                freight_rate_per_ton = db_rates[-1].rate
                
        if freight_rate_per_ton is None:
            # Fallback formula
            freight_rate_per_ton = 22.0 * v.cost_factor * (transit_days / 15.0)
            
        # Calculate costs
        demurrage_rate = DAILY_DEMURRAGE_RATES.get(v.id, 20000.0)
        demurrage_cost = waiting_days * demurrage_rate
        total_freight_cost = parcel_size * freight_rate_per_ton
        total_cost = total_freight_cost + demurrage_cost
        cost_per_ton = round(total_cost / parcel_size, 2)
        
        results.append({
            "vesselId": v.id,
            "vesselName": v.name,
            "feasible": feasible,
            "constraints": {
                "draft": {"allowed": dest.draft, "required": v.draft_limit, "ok": v.draft_limit <= dest.draft},
                "loa": {"allowed": dest.loa, "required": v.loa_limit, "ok": v.loa_limit <= dest.loa},
                "beam": {"allowed": dest.beam, "required": v.beam_limit, "ok": v.beam_limit <= dest.beam}
            },
            "efficiencyScore": int(round(100 / v.cost_factor)) if feasible else 0,
            "loadDays": day_calcs["load_days"],
            "dischargeDays": day_calcs["discharge_days"],
            "transitDays": day_calcs["transit_days"],
            "waitingDays": day_calcs["waiting_days"],
            "totalDays": day_calcs["total_days"],
            "costPerTon": cost_per_ton,
            "totalCost": int(round(total_cost))
        })
        
    # Sort feasible vessels by cost to find the recommended one
    feasible_sorted = sorted([r for r in results if r["feasible"]], key=lambda x: x["totalCost"])
    recommended = feasible_sorted[0] if feasible_sorted else None
    
    # Map origin and destination to frontend structure
    origin_mapped = {
        "id": origin.id,
        "name": origin.name,
        "draft": origin.draft,
        "loa": origin.loa,
        "beam": origin.beam,
        "handlingRate": origin.handling_rate,
        "transitDays": origin.transit_days
    }
    
    dest_mapped = {
        "id": dest.id,
        "name": dest.name,
        "draft": dest.draft,
        "loa": dest.loa,
        "beam": dest.beam,
        "handlingRate": dest.handling_rate,
        "waitingDays": dest.waiting_days
    }
    
    return {
        "results": results,
        "recommendedVessel": recommended,
        "originPort": origin_mapped,
        "destPort": dest_mapped
    }
