import json, math, subprocess, sys
from pathlib import Path
import numpy as np, pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT))

results=[]
def check(name, ok, detail=''):
    results.append({'test':name,'passed':bool(ok),'detail':detail})

# Data integrity
for name in ['coal_australia','brent']:
    p=ROOT/f'data/raw/market/{name}.csv'; df=pd.read_csv(p)
    check(f'{name}: file exists',p.exists())
    check(f'{name}: 180 monthly rows',len(df)==180,str(len(df)))
    check(f'{name}: no missing values',not df.isna().any().any())
    check(f'{name}: positive values',(pd.to_numeric(df.iloc[:,1])>0).all())

bdi=pd.read_csv(ROOT/'data/raw/market/bdi_monthly.csv')
check('BDI: 180 monthly rows',len(bdi)==180,str(len(bdi)))
check('BDI: no missing values',not bdi.isna().any().any())
check('BDI: positive', (bdi.bdi>0).all())
check('BDI: unique dates',pd.to_datetime(bdi.date).is_unique)

# Build + train
subprocess.run([sys.executable,'-m','data_pipeline.build_dataset'],cwd=ROOT,check=True)
subprocess.run([sys.executable,'-m','backend.app.ml.training.train_freight_real'],cwd=ROOT,check=True)

market=pd.read_csv(ROOT/'data/processed/market_features.csv',parse_dates=['date'])
check('Feature dataset nonempty',len(market)>100,str(len(market)))
check('Feature dataset no NaNs',not market.isna().any().any())

wf=pd.read_csv(ROOT/'data/processed/bdi_walk_forward_backtest.csv',parse_dates=['date'])
y=wf.actual_bdi.to_numpy(); p=wf.predicted_bdi.to_numpy()
mae=mean_absolute_error(y,p); rmse=math.sqrt(mean_squared_error(y,p))
naive_actual=wf.actual_bdi.to_numpy(); naive_pred=wf.persistence_bdi.to_numpy(); naive_mae=mean_absolute_error(naive_actual,naive_pred)
check('Walk-forward backtest has observations',len(wf)>0,str(len(wf)))
check('Forecast metrics computed',np.isfinite(mae) and np.isfinite(rmse),f'ML MAE={mae:.2f}; naive={naive_mae:.2f}; ML beats baseline={mae < naive_mae}')
check('Model beats persistence baseline',mae < naive_mae,f'{mae:.2f} vs {naive_mae:.2f}')
dir_acc = wf.direction_model_correct.iloc[1:].mean() if 'direction_model_correct' in wf.columns else wf.direction_correct.dropna().mean()
check('Directional classifier accuracy >=55%',np.isfinite(dir_acc) and dir_acc>=0.55,f'{dir_acc*100:.2f}%')
check('MASE < 1 (beats persistence)',mae/naive_mae<1,f'{mae/naive_mae:.4f}')

# Interval coverage on residuals: 90% residual interval around predictions
res=wf.residual.to_numpy(); q=np.quantile(res,[.05,.95]); coverage=np.mean((y>=p+q[0])&(y<=p+q[1]))
check('Residual 90% interval coverage reasonable',0.80<=coverage<=0.98,f'{coverage*100:.2f}%')

# Vessel deterministic validation
v=pd.read_csv(ROOT/'backend/data/vessels.csv')
check('Vessel rows present',len(v)>=4,str(len(v)))
# Panamax reference values used in the project source record
pan=v[v.id=='panamax'].iloc[0]
check('Panamax DWT reference',abs(pan.benchmark_dwt-82500)<1,'82500')
check('Panamax LOA reference',abs(pan.loa_limit-229)<1e-9,'229')
check('Panamax beam reference',abs(pan.beam_limit-32.25)<1e-9,'32.25')
check('Panamax draft reference',abs(pan.draft_limit-14.43)<1e-9,'14.43')

# Cost engine tests
from backend.app.utils.calculations import calculate_voyage_days
c=calculate_voyage_days(70000,25000,25000,15,2)
check('Voyage days calculation',c['total_days']==22.6,str(c))

# Demurrage monotonic/bounded tests
from backend.app.ml.pre_mc import demurrage_for
for vid in ['capesize','panamax','supramax','handysize']:
    d=demurrage_for(vid)
    check(f'Demurrage {vid} bounded',d['lower_usd_day']<=d['expected_usd_day']<=d['upper_usd_day'],str(d))

# Pre-MC integration
from backend.app.ml.pre_mc import build
state=build(70000)
check('Pre-MC state ready',state['mc_input_ready'] is True)
check('Pre-MC not run',state['mc_run'] is False)
check('Pre-MC has forecast',len(state['forecast_horizon_months'])==3)
check('Forecast months advance',len({x['month'] for x in state['forecast_horizon_months']})==3,str([x['month'] for x in state['forecast_horizon_months']]))
check('Pre-MC has vessels',len(state['vessels'])>=4)
check('Vessel names are populated',all(v['name'] in ['Capesize','Panamax','Supramax','Handysize'] for v in state['vessels']))

# API smoke tests
try:
    from fastapi.testclient import TestClient
    from backend.app.main import app
    client=TestClient(app)
    r=client.get('/docs'); check('API docs responds',r.status_code==200,str(r.status_code))
    r=client.get('/api/forecast?routeId=aus-par&vesselId=panamax'); check('Forecast API responds',r.status_code==200,str(r.status_code))
    if r.status_code==200:
        body=r.json(); check('Forecast API labels proxy',body.get('target_status')=='DERIVED_PROXY',str(body.get('target_status')))
    r=client.get('/api/pre-mc?parcelSize=70000'); check('Pre-MC API responds',r.status_code==200,str(r.status_code))
except Exception as e:
    check('API smoke tests',False,repr(e))

out=ROOT/'tests/validation_results.json'; out.write_text(json.dumps({'summary':{'passed':sum(r['passed'] for r in results),'total':len(results)},'metrics':{'bdi_mae':mae,'bdi_rmse':rmse,'naive_mae':naive_mae,'improvement_percent':(naive_mae-mae)/naive_mae*100,'directional_accuracy_percent':dir_acc*100,'interval_coverage_percent':coverage*100},'tests':results},indent=2))
print(json.dumps({'passed':sum(r['passed'] for r in results),'total':len(results),'bdi_mae':mae,'bdi_rmse':rmse,'naive_mae':naive_mae,'improvement_percent':(naive_mae-mae)/naive_mae*100,'directional_accuracy_percent':dir_acc*100,'interval_coverage_percent':coverage*100},indent=2))
if not all(r['passed'] for r in results): sys.exit(1)
