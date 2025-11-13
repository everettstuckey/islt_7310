import json
import re
from pathlib import Path

root = Path(r"F:\OneDrive - University of Missouri\IS_LT-7355")
sections_path = root / 'assets' / 'coverflow' / 'portfolio_sections.js'
content = sections_path.read_text(encoding='utf-8')
match = re.search(r'const PORTFOLIO_SECTIONS = (\{.*\});\s*$', content, re.DOTALL)
if not match:
    raise SystemExit('PORTFOLIO_SECTIONS JSON not found')
data = json.loads(match.group(1))
html = data['program-goals']['html_content']

def build_list(items):
    li = [f'<li><a href="{href}" rel="noopener" target="_blank">{label}</a></li>' for label, href in items]
    return '<ul>\n' + '\n'.join(li) + '\n</ul>'

updates = {
    "Student Learning Outcome 1.1 Reflection": build_list([
        ("Digital Literacy eLearning", "https://everettstuckey.github.io/islt_7310/elearning/digital_literacy_curriculum.html"),
        ("Python Code Simulation", "https://everettstuckey.github.io/IS_LT-7383/part2_part2.html"),
        ("Linear Regression Manipulative", "https://everettstuckey.github.io/IS_LT-7383/part1_part8.html"),
    ]),
    "Student Learning Outcome 1.2 Reflection": build_list([
        ("Financial Markets eLearning", "https://everettstuckey.github.io/IS_LT-7383/slideshows/Financial%20Markets%20Slide%20Show.html"),
        ("Program of Study", "https://everettstuckey.github.io/islt_7310/portfolio.html#program-of-study"),
        ("Reflection Statement", "https://everettstuckey.github.io/islt_7310/portfolio.html#reflection"),
    ]),
    "Student Learning Outcome 1.3 Reflection": build_list([
        ("Portfolio Overview", "https://everettstuckey.github.io/islt_7310/portfolio.html"),
        ("Portfolio Resume", "https://everettstuckey.github.io/islt_7310/EverettStuckeyResume%20Data.pdf"),
        ("Program Goals & Outcomes", "https://everettstuckey.github.io/islt_7310/portfolio.html#program-goals"),
        ("Internship Program Data Pipeline", "assets/coverflow/learn_and_earn_diagram.png"),
    ]),
    "Student Learning Outcome 1.4 Reflection": build_list([
        ("Professional Webpage", "https://everettstuckey.github.io/islt_7310/"),
        ("At-Risk Dashboard (Python & HTML)", "https://youtu.be/TpqWWJGb1Yo"),
        ("States of Matter Animation", "https://youtu.be/W4DFjhLx0wY"),
        ("Web Scraping Tutorial", "https://youtu.be/IVYAi723RLM"),
    ]),
    "Student Learning Outcome 2.1 Reflection": build_list([
        ("Scholarships Database", "https://everettstuckey.github.io/islt_7310/scholarships_data.html"),
        ("Heatmap Visualization Script", "https://colab.research.google.com/drive/1lXuPQLNkrZvcnsP0Y00BZgRuf7tXp1Io?usp=sharing"),
        ("Census Data Retrieval Script", "https://colab.research.google.com/drive/1C8pYam8D-6yMlc3vj0TOsg84S70tIvO4?usp=sharing"),
        ("GIS Map of Career Z and CHIPS CTE Challenge Semifinalists", "https://everettstuckey.github.io/islt_7310/SemifinalistsGISMap.html"),
    ]),
    "Student Learning Outcome 2.2 Reflection": build_list([
        ("Excel Student Risk Dashboard", "https://youtu.be/2Jbn5Da5mYs"),
        ("Excel At-Risk Student Dashboard", "https://youtu.be/2Jbn5Da5mYs"),
        ("At-Risk Student Dashboard", "https://everettstuckey.github.io/islt_7310/ICU_Report.html"),
        ("At-Risk Dashboard Documentation", "https://everettstuckey.github.io/islt_7310/AtRiskDashboardDocumentation.html"),
        ("Transcript Evaluation Script", "https://colab.research.google.com/drive/1kxPYj4eiCoeiXmsywbf9a1BbNu-m3lTw?usp=sharing"),
    ]),
    "Student Learning Outcome 3.1 Reflection": build_list([
        ("At-Risk Student Dashboard", "https://everettstuckey.github.io/islt_7310/ICU_Report.html"),
        ("At-Risk Dashboard Documentation", "https://everettstuckey.github.io/islt_7310/AtRiskDashboardDocumentation.html"),
        ("Census Data Retrieval Script", "https://colab.research.google.com/drive/1C8pYam8D-6yMlc3vj0TOsg84S70tIvO4?usp=sharing"),
    ]),
    "Student Learning Outcome 3.2 Reflection": build_list([
        ("Digital Literacy eLearning", "https://everettstuckey.github.io/islt_7310/elearning/digital_literacy_curriculum.html"),
        ("Financial Markets eLearning", "https://everettstuckey.github.io/IS_LT-7383/slideshows/Financial%20Markets%20Slide%20Show.html"),
        ("Program of Study", "https://everettstuckey.github.io/islt_7310/portfolio.html#program-of-study"),
    ]),
}

for heading, replacement_ul in updates.items():
    pattern = re.compile(rf'(<h3>{re.escape(heading)}</h3>.*?<h4>Artifacts</h4>)\s*<ul>.*?</ul>', re.DOTALL)
    html, count = pattern.subn(rf'\1\n{replacement_ul}', html, count=1)
    if count == 0:
        raise SystemExit(f'Failed to update list for {heading}')

data['program-goals']['html_content'] = html
new_content = 'const PORTFOLIO_SECTIONS = ' + json.dumps(data, ensure_ascii=False, separators=(',', ': ')) + ';'
sections_path.write_text(new_content, encoding='utf-8')
print('Updated artifact lists for all Student Learning Outcomes.')
