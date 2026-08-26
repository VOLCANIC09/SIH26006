import os
import pandas as pd
from sqlalchemy.orm import Session
from backend.app.database.models import Port, Vessel, Route, RiskAlert, Recommendation, FreightRate

def seed_database(db: Session):
    # Seed Ports
    if db.query(Port).count() == 0:
        print("Seeding ports...")
        df = pd.read_csv("backend/data/ports.csv")
        for _, row in df.iterrows():
            port = Port(
                id=row["id"],
                name=row["name"],
                type=row["type"],
                draft=float(row["draft"]),
                loa=float(row["loa"]),
                beam=float(row["beam"]),
                capacity=float(row["capacity"]),
                handling_rate=float(row["handling_rate"]),
                congestion_index=row["congestion_index"],
                waiting_days=float(row["waiting_days"]),
                transit_days=float(row["transit_days"]),
                notes=row["notes"] if not pd.isna(row["notes"]) else None
            )
            db.add(port)
        db.commit()

    # Seed Vessels
    if db.query(Vessel).count() == 0:
        print("Seeding vessels...")
        df = pd.read_csv("backend/data/vessels.csv")
        for _, row in df.iterrows():
            vessel = Vessel(
                id=row["id"],
                name=row["name"],
                capacity=row["capacity"],
                draft_limit=float(row["draft_limit"]),
                loa_limit=float(row["loa_limit"]),
                beam_limit=float(row["beam_limit"]),
                suitability=row["suitability"] if not pd.isna(row["suitability"]) else None,
                cost_factor=float(row["cost_factor"])
            )
            db.add(vessel)
        db.commit()

    # Seed Routes
    if db.query(Route).count() == 0:
        print("Seeding routes...")
        routes_data = [
            {"id": "aus-par", "origin_id": "newcastle", "destination_id": "paradip", "commodity": "Metallurgical Coal", "distance": 5400.0},
            {"id": "us-viz", "origin_id": "baltimore", "destination_id": "vizag", "commodity": "Thermal Coal", "distance": 9800.0},
            {"id": "moz-gan", "origin_id": "nacala", "destination_id": "gangavaram", "commodity": "Thermal Coal", "distance": 4100.0},
            {"id": "rus-gop", "origin_id": "vladivostok", "destination_id": "gopalpur", "commodity": "Coking Coal", "distance": 4500.0},
            {"id": "ind-hal", "origin_id": "samarinda", "destination_id": "haldia", "commodity": "Thermal Coal", "distance": 2200.0}
        ]
        for r in routes_data:
            route = Route(
                id=r["id"],
                origin_id=r["origin_id"],
                destination_id=r["destination_id"],
                commodity=r["commodity"],
                distance=r["distance"]
            )
            db.add(route)
        db.commit()

    # Seed Risk Alerts
    if db.query(RiskAlert).count() == 0:
        print("Seeding risk alerts...")
        risks_data = [
            {
                "id": "r1",
                "title": "Bay of Bengal Monsoon Disruption",
                "category": "Weather",
                "severity": "High",
                "routes": "aus-par,moz-gan,ind-hal",
                "impact": "Dwell times at Haldia and Paradip projected to increase by 4-6 days due to wind speed and tidal waves.",
                "status": "Active",
                "updated_at": "12 hrs ago"
            },
            {
                "id": "r2",
                "title": "Panamax Freight Market Volatility Spike",
                "category": "Market",
                "severity": "Critical",
                "routes": "aus-par,us-viz",
                "impact": "Strong demand in South East Asian coal exports has triggered a 15% increase in Panamax spot rates over 10 days.",
                "status": "Active",
                "updated_at": "2 hrs ago"
            },
            {
                "id": "r3",
                "title": "Haldia Berthing Waiting Queue Congestion",
                "category": "Port Operational",
                "severity": "High",
                "routes": "ind-hal",
                "impact": "Siltation in Hooghly river has cut max draft allowance to 8.2m this week, creating a backlog of 9 Handysize vessels.",
                "status": "Active",
                "updated_at": "1 day ago"
            },
            {
                "id": "r4",
                "title": "Panama Canal Transit Restraints",
                "category": "Geopolitical / Canal",
                "severity": "Medium",
                "routes": "us-viz",
                "impact": "Transit quotas raised but daily vessel limit still caps US-East Coast India shipping routes via Cape of Good Hope.",
                "status": "Ongoing",
                "updated_at": "3 days ago"
            }
        ]
        for r in risks_data:
            risk = RiskAlert(
                id=r["id"],
                title=r["title"],
                category=r["category"],
                severity=r["severity"],
                routes=r["routes"],
                impact=r["impact"],
                status=r["status"],
                updated_at=r["updated_at"]
            )
            db.add(risk)
        db.commit()

    # Seed Recommendations
    if db.query(Recommendation).count() == 0:
        print("Seeding recommendations...")
        recs_data = [
            {
                "id": "rec1",
                "title": "Lock 3-Month Panamax Contracts for Australia-Paradip Route",
                "action": "Secure Contract",
                "route_id": "aus-par",
                "vessel_id": "panamax",
                "confidence": 94.0,
                "details": "Freight rates are forecasted to rise by 14% over the next 60 days due to Australian output hikes. Securing a 3-month contract now avoids spot surges.",
                "savings": "$135,000 per voyage",
                "vessel_advice": "Utilize Panamax (75k DWT) to stay within Paradip draft limits while maximizing economy."
            },
            {
                "id": "rec2",
                "title": "Optimize US-Vizag Shipments to Capesize (Part-Load) via Outer Harbor",
                "action": "Vessel Optimization",
                "route_id": "us-viz",
                "vessel_id": "capesize",
                "confidence": 87.0,
                "details": "Instead of two Panamax shipments, run a single Cape-size (150k DWT) vessel. Discharge 120k tons at Outer Harbor Vizag and the rest at Gopalpur to bypass inner draft caps.",
                "savings": "$320,000 combined",
                "vessel_advice": "Capesize offers a 20% lower freight per ton compared to Panamax, even with dual-port discharge charges."
            },
            {
                "id": "rec3",
                "title": "Delay Spot Booking for Indonesia-Haldia route by 10 Days",
                "action": "Wait / Market Entry",
                "route_id": "ind-hal",
                "vessel_id": "handysize",
                "confidence": 82.0,
                "details": "Indonesia coal production is temporarily halted for local holiday celebrations. Short-term barge shipping rates will decline post-celebrations when backlog eases.",
                "savings": "$42,000 per voyage",
                "vessel_advice": "Stick to Handysize (28k DWT) with high-capacity grab unloaders to counter Haldia discharge delays."
            }
        ]
        for r in recs_data:
            rec = Recommendation(
                id=r["id"],
                title=r["title"],
                action=r["action"],
                route_id=r["route_id"],
                vessel_id=r["vessel_id"],
                confidence=r["confidence"],
                details=r["details"],
                savings=r["savings"],
                vessel_advice=r["vessel_advice"]
            )
            db.add(rec)
        db.commit()

    # Seed Freight Rates
    if db.query(FreightRate).count() == 0:
        print("Seeding freight rates...")
        df = pd.read_csv("backend/data/freight_rates.csv")
        for _, row in df.iterrows():
            rate = FreightRate(
                route_id=row["route_id"],
                vessel_id=row["vessel_id"],
                month=row["month"],
                rate=float(row["rate"]),
                type=row["type"],
                upper=float(row["upper"]) if not pd.isna(row.get("upper")) else None,
                lower=float(row["lower"]) if not pd.isna(row.get("lower")) else None
            )
            db.add(rate)
        db.commit()

def get_ports(db: Session):
    return db.query(Port).all()

def get_vessels(db: Session):
    return db.query(Vessel).all()

def get_routes(db: Session):
    return db.query(Route).all()

def get_risks(db: Session):
    return db.query(RiskAlert).all()

def get_recommendations(db: Session):
    return db.query(Recommendation).all()

def get_rates_for_route_vessel(db: Session, route_id: str, vessel_id: str):
    return db.query(FreightRate).filter(
        FreightRate.route_id == route_id,
        FreightRate.vessel_id == vessel_id
    ).all()
