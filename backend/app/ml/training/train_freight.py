import os
import sys

# Add workspace root to PYTHONPATH
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../..")))

import pickle
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor
from backend.app.ml.preprocessing import extract_features

def main():
    # Load historical rates
    if not os.path.exists("backend/data/freight_rates.csv"):
        print("Historical freight rates CSV not found. Please generate it first.")
        return

    df = pd.read_csv("backend/data/freight_rates.csv")
    df_features = extract_features(df)

    # Features and target
    X = df_features[["route_id", "vessel_id", "time_index", "month_sin", "month_cos"]]
    y = df_features["rate"]

    # Define preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore"), ["route_id", "vessel_id"]),
            ("num", StandardScaler(), ["time_index"])
        ],
        remainder="passthrough"  # month_sin and month_cos are passed through
    )

    # Model pipeline
    model = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", RandomForestRegressor(n_estimators=100, random_state=42))
    ])

    # Fit model
    model.fit(X, y)

    # Estimate residuals standard deviation for confidence bands
    y_pred = model.predict(X)
    residuals = y - y_pred
    residual_std = np.std(residuals)

    # Save models
    os.makedirs("backend/app/ml/models", exist_ok=True)

    with open("backend/app/ml/models/freight_model.pkl", "wb") as f:
        pickle.dump(model, f)

    # Save scaler and residual std metadata
    scaler = model.named_steps["preprocessor"].named_transformers_["num"]
    with open("backend/app/ml/models/scaler.pkl", "wb") as f:
        pickle.dump({
            "scaler": scaler,
            "residual_std": float(residual_std)
        }, f)

    print(f"Successfully trained freight forecasting model! Residual Std: {residual_std:.4f}")

if __name__ == "__main__":
    main()
