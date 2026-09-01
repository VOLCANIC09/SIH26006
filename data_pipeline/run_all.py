"""One-command reproducible pipeline using bundled real-data snapshots by default."""
import subprocess, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
cmds=[[sys.executable,"-m","data_pipeline.download_data"],[sys.executable,"-m","data_pipeline.build_dataset"],[sys.executable,"-m","backend.app.ml.training.train_freight_real"],[sys.executable,"-m","backend.app.ml.pre_mc"]]
for c in cmds: subprocess.run(c,cwd=ROOT,check=True)
