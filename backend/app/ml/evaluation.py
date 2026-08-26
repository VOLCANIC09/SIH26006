import numpy as np

def compute_metrics(y_true, y_pred):
    """
    Computes time-series regression evaluation metrics: MAE, RMSE, and MAPE.
    """
    y_true = np.array(y_true)
    y_pred = np.array(y_pred)
    
    mae = np.mean(np.abs(y_true - y_pred))
    rmse = np.sqrt(np.mean((y_true - y_pred) ** 2))
    mape = np.mean(np.abs((y_true - y_pred) / np.maximum(y_true, 1e-5))) * 100
    
    return {
        "mae": float(round(mae, 4)),
        "rmse": float(round(rmse, 4)),
        "mape": float(round(mape, 2))
    }
