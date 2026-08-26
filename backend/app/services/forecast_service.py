from sqlalchemy.orm import Session
from backend.app.database import crud
from backend.app.ml import prediction
from backend.app.ml.preprocessing import calculate_time_index

def get_forecast_data(db: Session, route_id: str, vessel_id: str) -> dict:
    # 1. Fetch historical rates from database
    db_rates = crud.get_rates_for_route_vessel(db, route_id, vessel_id)
    history = []
    
    for r in db_rates:
        if r.type == "Historical":
            history.append({
                "month": r.month,
                "rate": r.rate,
                "type": "Historical"
            })
            
    # Sort history chronologically
    history.sort(key=lambda x: calculate_time_index(x["month"]))
    
    # 2. Generate forecast using ML model for next 6 months
    forecast_months = ["Sep 26", "Oct 26", "Nov 26", "Dec 26", "Jan 27", "Feb 27"]
    forecast = []
    
    for month in forecast_months:
        try:
            pred = prediction.predict_rate(route_id, vessel_id, month)
            forecast.append(pred)
        except Exception as e:
            # Fallback simple generator if ML models are missing/erroring
            print(f"Error predicting rate with ML model: {e}. Using fallback.")
            base = 25.0
            if history:
                base = history[-1]["rate"]
            forecast.append({
                "month": month,
                "rate": round(base + 0.5, 2),
                "upper": round(base + 2.0, 2),
                "lower": round(base - 1.0, 2),
                "type": "Forecast"
            })
            
    return {
        "history": history,
        "forecast": forecast
    }
