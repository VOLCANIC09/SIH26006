"""Market-regime diagnostics for the dry-bulk decision engine."""
from __future__ import annotations
from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
DATA = ROOT / 'data' / 'processed' / 'market_features.csv'


def classify_regime(bdi: float, vol: float, long_run: float) -> str:
    ratio = bdi / max(long_run, 1.0)
    if vol >= 0.22 and ratio >= 1.35:
        return 'FREIGHT_SHOCK'
    if vol >= 0.18:
        return 'HIGH_VOLATILITY'
    if ratio <= 0.75:
        return 'LOW_DEMAND'
    return 'NORMAL'


def current_regime() -> dict:
    df = pd.read_csv(DATA, parse_dates=['date']).sort_values('date')
    bdi = df['bdi'].astype(float)
    ret = bdi.pct_change().replace([np.inf, -np.inf], np.nan).dropna()
    vol = float(ret.tail(12).std())
    long_run = float(bdi.mean())
    regime = classify_regime(float(bdi.iloc[-1]), vol, long_run)
    return {
        'regime': regime,
        'latest_bdi': round(float(bdi.iloc[-1]), 2),
        'long_run_bdi': round(long_run, 2),
        'annualized_monthly_return_vol': round(vol * np.sqrt(12), 4),
        'method': '12-month rolling BDI return volatility + level relative to full-sample mean',
    }
