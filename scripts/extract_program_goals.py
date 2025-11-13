import json
import re
from pathlib import Path

src = Path(r"F:\OneDrive - University of Missouri\IS_LT-7355\assets\coverflow\portfolio_sections.js")
content = src.read_text(encoding='utf-8')
match = re.search(r'const PORTFOLIO_SECTIONS = (\{.*\});\s*$', content, re.DOTALL)
if not match:
    raise SystemExit('PORTFOLIO_SECTIONS not found')
data = json.loads(match.group(1))
Path('program_goals_section.html').write_text(data['program-goals']['html_content'], encoding='utf-8')
print('Wrote program_goals_section.html')
