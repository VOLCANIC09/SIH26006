import argparse, json
from pathlib import Path
import numpy as np
import pandas as pd

ROOT=Path(__file__).resolve().parents[1]
RAW=ROOT/'data/raw/market'; OUT=ROOT/'data/processed'; OUT.mkdir(parents=True,exist_ok=True)
VESSEL_FACTORS={'capesize':1.00,'panamax':1.18,'supramax':1.30,'handysize':1.48}
BASE_RATE={'capesize':18.5,'panamax':22.0,'supramax':25.0,'handysize':30.0}


def load_fred(path,name):
    df=pd.read_csv(path)
    if 'observation_date' not in df.columns: raise ValueError(f'{path} must contain observation_date')
    value='observation_value' if 'observation_value' in df.columns else [c for c in df.columns if c!='observation_date'][0]
    return pd.DataFrame({'date':pd.to_datetime(df.observation_date),'%s'%name:pd.to_numeric(df[value],errors='coerce')}).dropna()


def load_bdi(path):
    df=pd.read_csv(path); df['date']=pd.to_datetime(df['date']); df['bdi']=pd.to_numeric(df['bdi'],errors='coerce')
    return df[['date','bdi']].dropna()


def route_proxy_from_bdi(bdi,vessel):
    ref_bdi=1500.0
    return BASE_RATE[vessel]*(max(float(bdi),1)/ref_bdi)**0.55*VESSEL_FACTORS[vessel]


def add_features(df):
    df=df.sort_values('date').copy()
    df['fuel_proxy_usd_t']=df.brent_usd_bbl*0.16
    for lag in [1,2,3,6,12,18,24]: df[f'bdi_lag{lag}']=df.bdi.shift(lag)
    for w in [3,6,12,18,24]:
        s=df.bdi.shift(1); df[f'bdi_ma{w}']=s.rolling(w).mean(); df[f'bdi_std{w}']=s.rolling(w).std()
    df['bdi_ret1']=df.bdi.pct_change().shift(1); df['bdi_ret3']=df.bdi.pct_change(3).shift(1); df['bdi_ret12']=df.bdi.pct_change(12).shift(1)
    for c in ['coal_price_usd_t','brent_usd_bbl']:
        for lag in [1,3,6,12]: df[f'{c}_lag{lag}']=df[c].shift(lag)
        df[f'{c}_ret1']=df[c].pct_change().shift(1)
        df[f'{c}_ma3']=df[c].shift(1).rolling(3).mean(); df[f'{c}_ma12']=df[c].shift(1).rolling(12).mean()
    df['month_sin']=np.sin(2*np.pi*df.date.dt.month/12); df['month_cos']=np.cos(2*np.pi*df.date.dt.month/12)
    return df


def main():
    ap=argparse.ArgumentParser(); ap.add_argument('--start',default='2011-01-01'); ap.add_argument('--end',default='2025-12-01'); args=ap.parse_args()
    coal=load_fred(RAW/'coal_australia.csv','coal_price_usd_t'); brent=load_fred(RAW/'brent.csv','brent_usd_bbl'); bdi=load_bdi(RAW/'bdi_monthly.csv')
    df=coal.merge(brent,on='date',how='inner').merge(bdi,on='date',how='inner').sort_values('date')
    df=df[(df.date>=args.start)&(df.date<=args.end)].copy(); df=add_features(df)
    df=df.dropna().reset_index(drop=True)
    df.to_csv(OUT/'market_features.csv',index=False)
    rows=[]
    for _,r in df.dropna(subset=['bdi']).iterrows():
        for vessel in VESSEL_FACTORS:
            rows.append({'date':r.date.strftime('%Y-%m-%d'),'route_id':'aus-par','vessel_id':vessel,'rate_proxy':round(route_proxy_from_bdi(r.bdi,vessel),4),'proxy_target':True,'bdi':r.bdi,'coal_price_usd_t':r.coal_price_usd_t,'fuel_proxy_usd_t':r.fuel_proxy_usd_t})
    pd.DataFrame(rows).to_csv(OUT/'freight_proxy.csv',index=False)
    metadata={'target':'route freight estimate $/t','route':'Australia -> Paradip','status':'DERIVED_PROXY','not_observed_fixture':True,'formula':'base_rate_vessel * (BDI/1500)^0.55 * vessel_factor','base_rates_usd_t':BASE_RATE,'vessel_factors':VESSEL_FACTORS,'real_inputs':['Baltic Dry Index','Australian coal benchmark','Brent crude benchmark'],'route_benchmarks':['Baltic C18 Gladstone-Dhamra Capesize','Baltic P9 Gladstone-Dhamra Panamax'],'forecast_method':'BDI model v4: v3 ML/AR component dynamically blended with damped seasonal Holt-Winters using an 18-month trailing-error window; route rate remains a derived proxy.'}
    (OUT/'proxy_metadata.json').write_text(json.dumps(metadata,indent=2)); print(f'Built {len(df)} monthly market rows and {len(rows)} derived route-proxy rows.')
if __name__=='__main__': main()
