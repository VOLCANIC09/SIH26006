"""Train and validate the V6 forecasting stack without test leakage.

V6 keeps the strongest V4 architecture but tunes only the *blend hyperparameters*
(window and initial weight) on the first 72 out-of-sample months. The remaining
months form a locked holdout used for an honest final check. No holdout observation
is used to choose hyperparameters.
"""
import json, pickle
from pathlib import Path
import numpy as np, pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor, HistGradientBoostingClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error
from statsmodels.tsa.holtwinters import ExponentialSmoothing

ROOT=Path(__file__).resolve().parents[4]
DATA=ROOT/'data/processed'
MODEL=ROOT/'backend/app/ml/models'
MODEL.mkdir(parents=True,exist_ok=True)
FEATURES=['bdi_lag1','bdi_lag2','bdi_lag3','bdi_lag6','bdi_lag12','bdi_lag18','bdi_lag24','bdi_ma3','bdi_ma6','bdi_ma12','bdi_ma18','bdi_ma24','bdi_std3','bdi_std6','bdi_std12','bdi_std24','bdi_ret1','bdi_ret3','bdi_ret12','coal_price_usd_t_lag1','coal_price_usd_t_lag3','coal_price_usd_t_lag6','coal_price_usd_t_lag12','coal_price_usd_t_ret1','coal_price_usd_t_ma3','coal_price_usd_t_ma12','brent_usd_bbl_lag1','brent_usd_bbl_lag3','brent_usd_bbl_lag6','brent_usd_bbl_lag12','brent_usd_bbl_ret1','brent_usd_bbl_ma3','brent_usd_bbl_ma12','month_sin','month_cos']
BLEND_WINDOW=36
INITIAL_V3_WEIGHT=0.80
DEVELOPMENT_CUTOFF=72


def hgb_model():
    return HistGradientBoostingRegressor(max_iter=140,max_leaf_nodes=10,learning_rate=.035,l2_regularization=8,min_samples_leaf=8,random_state=42)

def direction_model():
    return HistGradientBoostingClassifier(max_iter=90,max_leaf_nodes=8,learning_rate=.05,l2_regularization=10,min_samples_leaf=10,random_state=42)

def seasonal_predict(values):
    return float(ExponentialSmoothing(np.asarray(values,dtype=float),trend='add',seasonal='add',seasonal_periods=12,damped_trend=True,initialization_method='estimated').fit(optimized=True).forecast(1)[0])

def blend_series(actual,v3p,sp,window,initial_weight):
    final=[]; wvs=[]; wss=[]
    for j in range(len(actual)):
        if j < window:
            wv=initial_weight; ws=1-initial_weight
        else:
            ev=np.mean(np.abs(actual[j-window:j]-v3p[j-window:j]))
            es=np.mean(np.abs(actual[j-window:j]-sp[j-window:j]))
            iv=1/(ev+1e-6); ie=1/(es+1e-6)
            wv=iv/(iv+ie); ws=1-wv
        final.append(max(0,wv*v3p[j]+ws*sp[j])); wvs.append(wv); wss.append(ws)
    return np.asarray(final),np.asarray(wvs),np.asarray(wss)

def score_config(actual,v3p,sp,window,initial_weight,end=None):
    p,_,_=blend_series(actual,v3p,sp,window,initial_weight)
    end=len(actual) if end is None else end
    return mean_absolute_error(actual[:end],p[:end])

def main():
    df=pd.read_csv(DATA/'market_features.csv',parse_dates=['date']).sort_values('date').reset_index(drop=True)
    v3=pd.read_csv(DATA/'bdi_walk_forward_v3_baseline.csv',parse_dates=['date']).sort_values('date').reset_index(drop=True)
    dates=df.date; vals=df.bdi.to_numpy(float)
    sp=[]
    for date in v3.date:
        i=int(dates.searchsorted(date))
        sp.append(seasonal_predict(vals[:i]))
    sp=np.asarray(sp)
    actual=v3.actual_bdi.to_numpy(float); v3p=v3.predicted_bdi.to_numpy(float); pers=v3.persistence_bdi.to_numpy(float)

    # Tune only on the development portion. The final holdout is never used here.
    dev_end=min(DEVELOPMENT_CUTOFF,len(actual)-24)
    best=(float('inf'),None)
    for window in [12,18,24,30,36,42]:
        for initial in np.arange(.55,.91,.05):
            mae=score_config(actual,v3p,sp,int(window),float(initial),dev_end)
            if mae<best[0]: best=(mae,(int(window),float(initial)))
    selected_window,selected_initial=best[1]
    final,wvs,wss=blend_series(actual,v3p,sp,selected_window,selected_initial)

    wf=v3[['date','actual_bdi','persistence_bdi']].copy()
    wf['predicted_bdi']=final; wf['v3_component_bdi']=v3p; wf['seasonal_component_bdi']=sp
    wf['blend_v3_weight']=wvs; wf['blend_seasonal_weight']=wss
    wf['residual']=wf.actual_bdi-wf.predicted_bdi
    wf['actual_change']=wf.actual_bdi.diff(); wf['predicted_change']=wf.predicted_bdi.diff()
    wf['direction_correct']=np.sign(wf.actual_change)==np.sign(wf.predicted_change)
    wf['direction_up_probability']=v3.get('direction_up_probability',pd.Series(np.nan,index=wf.index))
    wf['direction_model_correct']=v3.get('direction_model_correct',pd.Series(False,index=wf.index))

    clean=df.dropna(subset=FEATURES+['bdi']).reset_index(drop=True)
    h=hgb_model().fit(clean[FEATURES],clean.bdi)
    dc=direction_model().fit(clean.iloc[1:][FEATURES],(clean.bdi.diff().iloc[1:]>0).astype(int))
    ev=np.mean(np.abs(actual[-selected_window:]-v3p[-selected_window:])); es=np.mean(np.abs(actual[-selected_window:]-sp[-selected_window:]))
    iv=1/(ev+1e-6); ie=1/(es+1e-6); wv=float(iv/(iv+ie)); ws=float(1-wv)
    bundle={'version':'v6','features':FEATURES,'v3_weights':{'persistence':.30,'hgb':.45,'ar6':.25},'blend_window_months':selected_window,'initial_v3_weight':selected_initial,'development_cutoff_oos_months':dev_end,'production_latest_weights':{'v3':wv,'seasonal':ws},'hgb':h,'direction_classifier':dc,'ar_lags':6,'ar_trend':'ct','seasonal_model':{'trend':'add','seasonal':'add','seasonal_periods':12,'damped_trend':True},'validation_note':'V3 OOS predictions are locked. Seasonal forecasts use only observations available before each forecast month. Blend window/initial weight were tuned only on the development OOS segment; the later holdout remained untouched.'}
    with open(MODEL/'bdi_model.pkl','wb') as f: pickle.dump(bundle,f)
    np.save(MODEL/'bdi_residuals.npy',wf.residual.to_numpy()); wf.to_csv(DATA/'bdi_walk_forward_backtest.csv',index=False)

    y=actual; p=final; naive=pers
    mae=float(mean_absolute_error(y,p)); rmse=float(np.sqrt(mean_squared_error(y,p))); nm=float(mean_absolute_error(y,naive))
    res=y-p; q=np.quantile(res,[.05,.95]); cov=float(np.mean((y>=p+q[0])&(y<=p+q[1]))*100)
    fda=float(wf.direction_correct.iloc[1:].mean()*100); da=float(wf.direction_model_correct.iloc[1:].mean()*100)
    hold_y=y[dev_end:]; hold_p=p[dev_end:]; hold_n=naive[dev_end:]
    hold_mae=float(mean_absolute_error(hold_y,hold_p)); hold_rmse=float(np.sqrt(mean_squared_error(hold_y,hold_p))); hold_nm=float(mean_absolute_error(hold_y,hold_n))
    m={'version':'v6','walk_forward_mae_bdi':mae,'walk_forward_rmse_bdi':rmse,'mape_percent':float(np.mean(np.abs((y-p)/np.maximum(np.abs(y),1e-9)))*100),'naive_persistence_mae_bdi':nm,'mase':mae/nm,'improvement_vs_naive_percent':(nm-mae)/nm*100,'forecast_directional_accuracy_percent':fda,'direction_classifier_accuracy_percent':da,'interval_coverage_90_percent':cov,'n_backtest':len(wf),'blend_window_months':selected_window,'initial_v3_weight':selected_initial,'development_cutoff_oos_months':dev_end,'locked_holdout_start':str(wf.date.iloc[dev_end].date()),'locked_holdout_mae_bdi':hold_mae,'locked_holdout_rmse_bdi':hold_rmse,'locked_holdout_naive_mae_bdi':hold_nm,'locked_holdout_improvement_vs_naive_percent':(hold_nm-hold_mae)/hold_nm*100,'latest_production_weights':{'v3':wv,'seasonal':ws},'criteria_note':'Strict walk-forward with a locked holdout. Hyperparameters were selected only on the first development OOS segment. No holdout observations are used for tuning.'}
    (MODEL/'bdi_metrics.json').write_text(json.dumps(m,indent=2))
    with open(MODEL/'freight_proxy_model.pkl','wb') as f: pickle.dump(bundle,f)
    np.save(MODEL/'freight_proxy_residuals.npy',wf.residual.to_numpy()); (MODEL/'freight_proxy_metrics.json').write_text(json.dumps(m,indent=2))
    print(json.dumps(m,indent=2))

if __name__=='__main__': main()
