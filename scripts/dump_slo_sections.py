import json, re
from pathlib import Path

path = Path(r"F:\OneDrive - University of Missouri\IS_LT-7355\assets\coverflow\portfolio_sections.js")
content = path.read_text(encoding='utf-8')
match = re.search(r'const PORTFOLIO_SECTIONS = (\{.*\});\s*$', content, re.DOTALL)
if not match:
    raise SystemExit('PORTFOLIO_SECTIONS JSON not found')
data = json.loads(match.group(1))
html = data['program-goals']['html_content']
Path('slo_sections.html').write_text(html, encoding='utf-8')
print('Wrote slo_sections.html')
