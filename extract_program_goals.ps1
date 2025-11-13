$json = Get-Content -Raw 'assets\coverflow\portfolio_sections_content.json' | ConvertFrom-Json
$htmlContent = $json.'program-goals'.html_content
$htmlContent | Out-File 'program_goals_extracted.html' -Encoding utf8
Write-Host "Extracted program goals content to program_goals_extracted.html"
