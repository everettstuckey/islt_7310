# Read the restructured HTML content
$htmlContent = Get-Content -Raw 'program_goals_restructured.html'

# Update coverflow version
$json1 = Get-Content -Raw 'assets\coverflow\portfolio_sections_content.json' | ConvertFrom-Json
$json1.'program-goals'.html_content = $htmlContent
$json1 | ConvertTo-Json -Depth 10 | Set-Content 'assets\coverflow\portfolio_sections_content.json' -Encoding utf8

# Update assets version
$json2 = Get-Content -Raw 'assets\portfolio_sections_content.json' | ConvertFrom-Json
$json2.'program-goals'.html_content = $htmlContent
$json2 | ConvertTo-Json -Depth 10 | Set-Content 'assets\portfolio_sections_content.json' -Encoding utf8

Write-Host "Successfully updated both portfolio_sections_content.json files"
