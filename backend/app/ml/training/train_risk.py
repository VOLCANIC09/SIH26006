import os
import pickle
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor

def main():
    # Load market data and freight rates
    if not os.path.exists("backend/data/market_data.csv") or not os.path.exists("backend/data/freight_rates.csv"):
        print("Required CSV files not found. Generate CSVs first.")
        return
    
    market_df = pd.read_csv("backend/data/market_data.csv")
    rates_df = pd.read_csv("backend/data/freight_rates.csv")
    
    # Calculate monthly volatility (standard deviation of rates normalized by average rate)
    monthly_stats = rates_df.groupby("month")["rate"].agg(["std", "mean"]).reset_index()
    monthly_stats["volatility"] = monthly_stats["std"] / monthly_stats["mean"]
    
    # Merge with market data
    merged = pd.merge(market_df, monthly_stats, on="month")
    
    # Features: Baltic Dry Index (BDI), bunker fuel price, coal price index
    X = merged[["bdi", "bunker_price", "coal_price_index"]]
    y = merged["volatility"]
    
    # Train volatility estimator model
    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X, y)
    
    # Save the risk model
    os.makedirs("backend/app/ml/models", exist_ok=True)
    with open("backend/app/ml/models/risk_model.pkl", "wb") as f:
        pickle.dump(model, f)
        
    print("Successfully trained risk model (volatility estimator)!")

if __name__ == "__main__":
    main()
