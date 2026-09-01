import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from statsmodels.tsa.ar_model import AutoReg
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from backend.app.ml.route_proxy import route_freight_proxy
ROOT=Path(__file__).resolve().parents[3]
MODEL_PATH=ROOT/'backend/app/ml/models/bdi_model.pkl'; RESIDUAL_PATH=ROOT/'backend/app/ml/models/bdi_residuals.npy'; DATA_PATH=ROOT/'data/processed/market_features.csv'
_model=None; _residuals=None; _history=None
FEATURES=['bdi_lag1','bdi_lag2','bdi_lag3','bdi_lag6','bdi_lag12','bdi_lag18','bdi_lag24','bdi_ma3','bdi_ma6','bdi_ma12','bdi_ma18','bdi_ma24','bdi_std3','bdi_std6','bdi_std12','bdi_std24','bdi_ret1','bdi_ret3','bdi_ret12','coal_price_usd_t_lag1','coal_price_usd_t_lag3','coal_price_usd_t_lag6','coal_price_usd_t_lag12','coal_price_usd_t_ret1','coal_price_usd_t_ma3','coal_price_usd_t_ma12','brent_usd_bbl_lag1','brent_usd_bbl_lag3','brent_usd_bbl_lag6','brent_usd_bbl_lag12','brent_usd_bbl_ret1','brent_usd_bbl_ma3','brent_usd_bbl_ma12','month_sin','month_cos']
def _load():
 global _model,_residuals,_history
 if _model is None:
  with open(MODEL_PATH,'rb') as f:_model=pickle.load(f)
  _residuals=np.load(RESIDUAL_PATH); _history=pd.read_csv(DATA_PATH,parse_dates=['date']).sort_values('date').reset_index(drop=True)
def _feature_row(bdi_series,coal_series,brent_series,date):
 s=pd.Series(bdi_series,dtype=float); c=pd.Series(coal_series,dtype=float); b=pd.Series(brent_series,dtype=float); row={}
 for lag in [1,2,3,6,12,18,24]:row[f'bdi_lag{lag}']=s.iloc[-lag]
 for w in [3,6,12,18,24]:row[f'bdi_ma{w}']=s.iloc[-w:].mean();row[f'bdi_std{w}']=s.iloc[-w:].std(ddof=1)
 row['bdi_ret1']=s.iloc[-1]/s.iloc[-2]-1;row['bdi_ret3']=s.iloc[-1]/s.iloc[-4]-1;row['bdi_ret12']=s.iloc[-1]/s.iloc[-13]-1
 for name,ser in [('coal_price_usd_t',c),('brent_usd_bbl',b)]:
  for lag in [1,3,6,12]:row[f'{name}_lag{lag}']=ser.iloc[-lag]
  row[f'{name}_ret1']=ser.iloc[-1]/ser.iloc[-2]-1;row[f'{name}_ma3']=ser.iloc[-3:].mean();row[f'{name}_ma12']=ser.iloc[-12:].mean()
 row['month_sin']=np.sin(2*np.pi*date.month/12);row['month_cos']=np.cos(2*np.pi*date.month/12)
 return pd.DataFrame([row])[FEATURES]
def forecast_route(vessel_id,months=3):
 _load(); hist=_history.copy(); current_date=hist.date.iloc[-1]; bdi_series=list(hist.bdi.astype(float));coal_series=list(hist.coal_price_usd_t.astype(float));brent_series=list(hist.brent_usd_bbl.astype(float)); forecasts=[]
 for _ in range(months):
  d=current_date+pd.offsets.MonthBegin(1); X=_feature_row(bdi_series,coal_series,brent_series,d)
  h=float(_model['hgb'].predict(X)[0]); ar=float(AutoReg(np.asarray(bdi_series),lags=_model['ar_lags'],trend=_model['ar_trend'],old_names=False).fit().predict(start=len(bdi_series),end=len(bdi_series))[0]); pers=float(bdi_series[-1])
  v3=.30*pers+.45*h+.25*ar
  seasonal=float(ExponentialSmoothing(np.asarray(bdi_series),trend='add',seasonal='add',seasonal_periods=12,damped_trend=True,initialization_method='estimated').fit(optimized=True).forecast(1)[0])
  w=_model['production_latest_weights']; pred=max(0.0,w['v3']*v3+w['seasonal']*seasonal)
  up=float(_model['direction_classifier'].predict_proba(X)[0,1]); direction='UP' if up>=.5 else 'DOWN'
  bdi_series.append(pred);coal_series.append(coal_series[-1]);brent_series.append(brent_series[-1]);current_date=d;rate=route_freight_proxy(pred,vessel_id)
  forecasts.append({'month':d.strftime('%Y-%m'),'forecast_bdi':round(pred,2),'route_freight_proxy_usd_t':round(rate,2),'direction':direction,'direction_up_probability':round(up,4)})
 q=np.quantile(_residuals,[.05,.5,.95]);return [{**f,'bdi_p05':round(max(0,f['forecast_bdi']+q[0]),2),'bdi_p50':round(max(0,f['forecast_bdi']+q[1]),2),'bdi_p95':round(max(0,f['forecast_bdi']+q[2]),2)} for f in forecasts]
def predict_rate(route_id:str,vessel_id:str,month:str):
 f=forecast_route(vessel_id,1)[0];return {'month':month,'rate':f['route_freight_proxy_usd_t'],'upper':f['route_freight_proxy_usd_t'],'lower':f['route_freight_proxy_usd_t'],'type':'Forecast','target_status':'DERIVED_PROXY','forecast_bdi':f['forecast_bdi'],'direction':f['direction']}
