import json
import subprocess

out = subprocess.check_output(['curl.exe', '-s', 'https://api.github.com/repos/fmourag/Eleicoes-Progressistas/actions/runs?per_page=5'])
data = json.loads(out)
for r in data.get('workflow_runs', []):
    print(f"{r['id']} | {r['name']} | {r['event']} | {r['status']} | {r['conclusion']} | {r.get('head_branch')} | {r['created_at']}")
