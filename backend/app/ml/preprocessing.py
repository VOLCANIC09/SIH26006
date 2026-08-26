import numpy as np
import pandas as pd

MONTHS_ORDER = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

def parse_month_string(month_str: str):
    """
    Parses a string like 'Sep 23' or 'Jan 26' and returns (month_int, year_int).
    """
    parts = month_str.strip().split()
    if len(parts) != 2:
        # Fallback if format is different
        return 1, 2023
    
    month_name, year_short = parts[0], parts[1]
    month_int = MONTHS_ORDER.index(month_name) + 1
    year_int = 2000 + int(year_short)
    return month_int, year_int

def calculate_time_index(month_str: str, start_month_str: str = "Sep 23") -> int:
    """
    Calculates number of months elapsed from the start month.
    """
    m, y = parse_month_string(month_str)
    sm, sy = parse_month_string(start_month_str)
    return (y - sy) * 12 + (m - sm)

def extract_features(df: pd.DataFrame, start_month_str: str = "Sep 23") -> pd.DataFrame:
    """
    Extracts time trend, seasonal sine/cosine features, and categorical indicators.
    """
    df = df.copy()
    
    # Calculate time index and seasonal components
    time_indices = []
    month_sins = []
    month_coss = []
    
    for _, row in df.iterrows():
        t_idx = calculate_time_index(row["month"], start_month_str)
        m_int, _ = parse_month_string(row["month"])
        
        time_indices.append(t_idx)
        month_sins.append(np.sin(2 * np.pi * m_int / 12.0))
        month_coss.append(np.cos(2 * np.pi * m_int / 12.0))
        
    df["time_index"] = time_indices
    df["month_sin"] = month_sins
    df["month_cos"] = month_coss
    
    return df
