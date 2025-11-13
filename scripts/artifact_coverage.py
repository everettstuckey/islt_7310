import json, re
from pathlib import Path

root = Path(r"F:\OneDrive - University of Missouri\IS_LT-7355")
portfolio = (root / 'portfolio.html').read_text(encoding='utf-8')
# Extract artifact titles from artifacts array in portfolio.html
artifacts_block = re.search(r'const artifacts = \[(.*?)\];', portfolio, re.DOTALL)
if not artifacts_block:
    raise SystemExit('Artifacts array not found')
block = artifacts_block.group(1)
titles = re.findall(r'title:\s*"([^"]+)"', block)
unique_titles = sorted(set(titles))

sections_content = (root / 'assets' / 'coverflow' / 'portfolio_sections.js').read_text(encoding='utf-8')
match = re.search(r'const PORTFOLIO_SECTIONS = (\{.*\});\s*$', sections_content, re.DOTALL)
if not match:
    raise SystemExit('PORTFOLIO_SECTIONS not found')
data = json.loads(match.group(1))
html = data['program-goals']['html_content']
used_titles = set(re.findall(r'>\s*([^><]+?)\s*</a>', html))

print('Total artifacts in carousel:', len(titles))
print('Unique artifact titles:', len(unique_titles))
print('\nArtifacts missing from SLO coverage:')
missing = [t for t in unique_titles if t not in used_titles]
for title in missing:
    print('-', title)
if not missing:
    print('None')
