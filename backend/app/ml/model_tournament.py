"""Transparent model tournament using the existing locked walk-forward predictions."""
from __future__ import annotations
from pathlib import Path
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
PATH = ROOT / 'data' / 'processed' / 'bdi_walk_forward_backtest.csv'
BASE = ROOT / 'data' / 'processed' / 'bdi_walk_forward_v3_baseline.csv'


def _metrics(actual, pred):
    e = np.asarray(actual) - np.asarray(pred)
    mae = float(np.mean(np.abs(e)))
    rmse = float(np.sqrt(np.mean(e ** 2)))
    return {'mae': round(mae, 3), 'rmse': round(rmse, 3)}


def tournament() -> dict:
    df = pd.read_csv(PATH, parse_dates=['date']).sort_values('date')
    base = pd.read_csv(BASE, parse_dates=['date']).sort_values('date')
    merged = df.merge(base[['date', 'predicted_bdi']], on='date', suffixes=('', '_v3'))
    actual = merged.actual_bdi
    candidates = {
        'persistence': merged.persistence_bdi,
        'v3_ensemble': merged.predicted_bdi_v3,
        'v6_blend': merged.predicted_bdi,
        'seasonal_holt_winters': merged.seasonal_component_bdi,
    }
    rows = []
    holdout_start = pd.Timestamp('2023-01-01')
    for name, pred in candidates.items():
        m = _metrics(actual, pred)
        hold = merged.date >= holdout_start
        hm = _metrics(actual[hold], pred[hold])
        rows.append({'model': name, **m, 'holdout_mae': hm['mae'], 'holdout_rmse': hm['rmse']})
    rows.sort(key=lambda x: x['holdout_mae'])
    return {
        'selection_metric': 'holdout MAE',
        'holdout_start': '2023-01-01',
        'winner': rows[0]['model'],
        'models': rows,
        'note': 'All rows are out-of-sample predictions; the 2023-2025 holdout is not used for V6 blend tuning.'
    }
