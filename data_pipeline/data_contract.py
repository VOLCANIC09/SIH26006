REQUIRED_MARKET_COLUMNS = [
    'date','bdi','coal_price_usd_t','brent_usd_bbl','fuel_proxy_usd_t',
    'bdi_lag1','coal_price_usd_t_lag1','fuel_proxy_usd_t_lag1',
    'month_sin','month_cos'
]

REQUIRED_PROXY_COLUMNS = ['date','route_id','vessel_id','rate_proxy','proxy_target']

def validate(df, required):
    missing=[c for c in required if c not in df.columns]
    if missing: raise ValueError(f'Missing required columns: {missing}')
    if df.empty: raise ValueError('Dataset is empty')
    return True
