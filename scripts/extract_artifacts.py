import re
from pathlib import Path

root = Path(r"F:\OneDrive - University of Missouri\IS_LT-7355")
portfolio_path = root / "portfolio.html"
content = portfolio_path.read_text(encoding="utf-8")

# The artifacts array contains template literals and trailing commas, so treat it as text
# and pull the title fields with a targeted regex.
titles = re.findall(r'title:\s*"([^"]+)"', content)

if not titles:
    raise SystemExit("No artifact titles found")

for title in titles:
    print(title)
