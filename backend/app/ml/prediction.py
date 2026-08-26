import os
import pickle
import numpy as np
import pandas as pd
from backend.app.ml.preprocessing import calculate_time_index, parse_month_string

# Paths relative to this file
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(CURRENT_DIR, "models", "freight_model.pkl")
SCALER_PATH = os.path.join(CURRENT_DIR, "models", "scaler.pkl")

# Load model and scaler lazily
_model = None
_scaler_info = None

def _load_models():
    global _model, _scaler_info
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}. Make sure to run training first.")
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
    if _scaler_info is None:
        if not os.path.exists(SCALER_PATH):
            raise FileNotFoundError(f"Scaler/metadata file not found at {SCALER_PATH}. Make sure to run training first.")
        with open(SCALER_PATH, "rb") as f:
            _scaler_info = pickle.load(f)

def predict_rate(route_id: str, vessel_id: str, month: str):
    """
    Predicts the expected freight rate along with upper and lower uncertainty bounds
    for a given route, vessel, and target month.
    """
    _load_models()
    
    # Calculate features
    t_idx = calculate_time_index(month, "Sep 23")
    m_int, _ = parse_month_string(month)
    
    month_sin = np.sin(2 * np.pi * m_int / 12.0)
    month_cos = np.cos(2 * np.pi * m_int / 12.0)
    
    input_df = pd.DataFrame([{
        "route_id": route_id,
        "vessel_id": vessel_id,
        "time_index": t_idx,
        "month_sin": month_sin,
        "month_cos": month_cos
    }])
    
    # Predict rate
    rate = float(_model.predict(input_df)[0])
    
    # Calculate confidence bands
    residual_std = _scaler_info["residual_std"]
    # Widen confidence bands as we project further into the future (beyond index 35)
    forecast_distance = max(1, t_idx - 35)
    uncertainty_multiplier = np.sqrt(forecast_distance) * 0.8
    deviation = residual_std * uncertainty_multiplier
    
    upper = round(rate + deviation, 2)
    lower = round(rate - deviation, 2)
    rate = round(rate, 2)
    
    return {
        "month": month,
        "rate": rate,
        "upper": upper,
        "lower": lower,
        "type": "Forecast" if t_idx >= 36 else "Historical"
    }
