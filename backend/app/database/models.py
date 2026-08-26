from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.connection import Base

class Port(Base):
    __tablename__ = "ports"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # 'load' or 'discharge'
    draft = Column(Float, nullable=False)
    loa = Column(Float, nullable=False)
    beam = Column(Float, nullable=False)
    capacity = Column(Float, nullable=False)  # max capacity or size handled
    handling_rate = Column(Float, nullable=False)
    congestion_index = Column(String, nullable=False)
    waiting_days = Column(Float, nullable=False)
    transit_days = Column(Float, nullable=False, default=0.0)
    notes = Column(String, nullable=True)

class Vessel(Base):
    __tablename__ = "vessels"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    capacity = Column(String, nullable=False)  # capacity description (e.g. 120,000 - 180,000 DWT)
    draft_limit = Column(Float, nullable=False)
    loa_limit = Column(Float, nullable=False)
    beam_limit = Column(Float, nullable=False)
    suitability = Column(String, nullable=True)
    cost_factor = Column(Float, nullable=False, default=1.0)

class Route(Base):
    __tablename__ = "routes"

    id = Column(String, primary_key=True, index=True)
    origin_id = Column(String, ForeignKey("ports.id"), nullable=False)
    destination_id = Column(String, ForeignKey("ports.id"), nullable=False)
    commodity = Column(String, nullable=False)
    distance = Column(Float, nullable=False)

    origin = relationship("Port", foreign_keys=[origin_id])
    destination = relationship("Port", foreign_keys=[destination_id])

class RiskAlert(Base):
    __tablename__ = "risk_alerts"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)
    severity = Column(String, nullable=False)
    routes = Column(String, nullable=False)  # Comma-separated route IDs, e.g. "aus-par,moz-gan"
    impact = Column(String, nullable=False)
    status = Column(String, nullable=False)
    updated_at = Column(String, nullable=False)

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    action = Column(String, nullable=False)
    route_id = Column(String, ForeignKey("routes.id"), nullable=False)
    vessel_id = Column(String, ForeignKey("vessels.id"), nullable=False)
    confidence = Column(Float, nullable=False)
    details = Column(String, nullable=False)
    savings = Column(String, nullable=False)
    vessel_advice = Column(String, nullable=False)

    route = relationship("Route")
    vessel = relationship("Vessel")

class FreightRate(Base):
    __tablename__ = "freight_rates"

    id = Column(Integer, primary_key=True, autoincrement=True)
    route_id = Column(String, ForeignKey("routes.id"), nullable=False)
    vessel_id = Column(String, ForeignKey("vessels.id"), nullable=False)
    month = Column(String, nullable=False)
    rate = Column(Float, nullable=False)
    type = Column(String, nullable=False)  # 'Historical' or 'Forecast'
    upper = Column(Float, nullable=True)
    lower = Column(Float, nullable=True)

    route = relationship("Route")
    vessel = relationship("Vessel")
