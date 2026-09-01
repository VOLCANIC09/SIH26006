import subprocess, sys, os
from pathlib import Path
root=Path(__file__).resolve().parents[1]
env=os.environ.copy(); env['PYTHONPATH']=str(root)
commands=[
    [sys.executable,'tests/run_validation.py'],
    [sys.executable,'tests/test_risk_engine.py'],
    [sys.executable,'tests/test_v7_quant.py'],
]
for c in commands:
    subprocess.run(c,cwd=root,env=env,check=True)
print('ALL TEST SUITES PASSED')
