import argparse, json, time
from pathlib import Path
from datetime import datetime, timezone
import requests

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "market"
RAW.mkdir(parents=True, exist_ok=True)
TIMEOUT = (10, 60)

FRED = {
    "coal_australia": "https://fred.stlouisfed.org/data/PCOALAUUSDM",
    "brent": "https://fred.stlouisfed.org/data/POILBREUSDM",
}
BDI_PAGE = "https://teknologiateollisuus.fi/en/charts/merirahtien-hinnat/"
BDI_API = "https://pxweb.asub.ax/PXWeb/api/v1/en/Statistik/TUTRSJ/SJ/Konjunkturstatistik%20f%C3%B6r%20sj%C3%B6farten/SJ102.px"


def session():
    s = requests.Session()
    s.headers.update({"User-Agent": "Mozilla/5.0 SIH26006-data-pipeline/2.0"})
    return s


def fetch(url, method="GET", **kwargs):
    last = None
    for attempt in range(1, 6):
        try:
            r = session().request(method, url, timeout=TIMEOUT, **kwargs)
            r.raise_for_status()
            return r
        except requests.RequestException as e:
            last = e
            if attempt < 5:
                time.sleep(2 ** (attempt - 1))
    raise RuntimeError(f"Could not retrieve {url}: {last}")


def refresh_fred(name, url):
    # FRED table endpoint is intentionally used rather than /graph/fredgraph.csv;
    # some networks reset/time out on the graph endpoint.
    r = fetch(url)
    text = r.text
    # Keep only DATE/VALUE rows from the table page.
    rows = []
    for line in text.splitlines():
        if line.startswith("20") and " | " in line:
            parts = [x.strip() for x in line.split("|")]
            if len(parts) >= 2 and len(parts[0]) == 10:
                try:
                    float(parts[1])
                    rows.append((parts[0], parts[1]))
                except ValueError:
                    pass
    if not rows:
        raise ValueError(f"No observations parsed from FRED table {url}")
    out = RAW / f"{name}.csv"
    out.write_text("observation_date,observation_value\n" + "\n".join(f"{d},{v}" for d,v in rows))
    return str(out)


def refresh_bdi():
    # Preferred public structured source: ÅSUB PxWeb. This is kept as an optional
    # refresh path. The repository ships a real 2011-2025 snapshot so the project
    # is reproducible even when PxWeb/FRED blocks automated requests.
    meta = fetch(BDI_API).json()
    years = [str(y) for y in meta["variables"][0]["values"]]
    months = meta["variables"][1]["values"]
    query = {"query":[
        {"code":meta["variables"][0]["code"],"selection":{"filter":"item","values":years}},
        {"code":meta["variables"][1]["code"],"selection":{"filter":"item","values":months}},
    ],"response":{"format":"json-stat2"}}
    r = fetch(BDI_API, method="POST", json=query)
    js = r.json(); vals=js["value"]
    rows=[]; idx=0
    for y in years:
        for m in months:
            if idx >= len(vals): break
            v=vals[idx]; idx += 1
            if v is not None:
                rows.append({"date":f"{y}-{months.index(m)+1:02d}-01","bdi":float(v)})
    out=RAW/"bdi_monthly.csv"
    import pandas as pd
    pd.DataFrame(rows).to_csv(out,index=False)
    return str(out)


def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--refresh",action="store_true",help="Attempt live refresh; otherwise use shipped real-data snapshots")
    ap.add_argument("--allow-failure",action="store_true")
    args=ap.parse_args()
    status={"retrieved_at_utc":datetime.now(timezone.utc).isoformat(),"mode":"live_refresh" if args.refresh else "reproducible_local_snapshot","sources":{}}
    if not args.refresh:
        for name in ["coal_australia","brent","bdi_monthly"]:
            p=RAW/f"{name}.csv"
            status["sources"][name]={"status":"cached" if p.exists() else "missing","path":str(p),"type":"real_snapshot"}
    else:
        for name,url in FRED.items():
            try:
                p=refresh_fred(name,url); status["sources"][name]={"status":"ok","path":p,"type":"real"}
            except Exception as e:
                status["sources"][name]={"status":"failed","error":str(e),"type":"real"}
                if not args.allow_failure: raise
        try:
            p=refresh_bdi(); status["sources"]["bdi"]={"status":"ok","path":p,"type":"real"}
        except Exception as e:
            status["sources"]["bdi"]={"status":"failed","error":str(e),"type":"real"}
            if not args.allow_failure: raise
    (RAW/"source_status.json").write_text(json.dumps(status,indent=2))
    print(json.dumps(status,indent=2))

if __name__=="__main__": main()
