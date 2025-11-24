# PowerShell script to combine all grant appendices into one HTML file

# Read the main application up to the APPENDICES section
$mainContent = Get-Content "F:\OneDrive - University of Missouri\IS_LT-7355_cloned\UAPB_FIPSE_Grant_Application.html" -Raw

# Function to extract body content from appendix files
function Get-AppendixBody {
    param($filepath)
    $content = Get-Content $filepath -Raw -Encoding UTF8
    # Extract content between <h1> tag and </body>
    if ($content -match '(?s)<h1>APPENDIX.*?</body>') {
        $extracted = $matches[0]
        # Remove the closing </body> and </html> tags
        $extracted = $extracted -replace '</body>.*$', ''
        return $extracted
    }
    return ""
}

# Extract body content from each appendix
$appendixA = Get-AppendixBody "F:\OneDrive - University of Missouri\IS_LT-7355_cloned\UAPB_FIPSE_Appendix_A_Letters.html"
$appendixB = Get-AppendixBody "F:\OneDrive - University of Missouri\IS_LT-7355_cloned\UAPB_FIPSE_Appendix_B_Personnel.html"
$appendixC = Get-AppendixBody "F:\OneDrive - University of Missouri\IS_LT-7355_cloned\UAPB_FIPSE_Appendix_C_Capacity.html"
$appendixD = Get-AppendixBody "F:\OneDrive - University of Missouri\IS_LT-7355_cloned\UAPB_FIPSE_Appendix_D_Evaluation.html"
$appendixE = Get-AppendixBody "F:\OneDrive - University of Missouri\IS_LT-7355_cloned\UAPB_FIPSE_Appendix_E_LogicModel.html"
$appendixF = Get-AppendixBody "F:\OneDrive - University of Missouri\IS_LT-7355_cloned\UAPB_FIPSE_Appendix_F_DataPlan.html"

# Find where to split the main content (at the APPENDICES section)
$splitPoint = $mainContent.IndexOf('<h1>APPENDICES</h1>')
$beforeAppendices = $mainContent.Substring(0, $splitPoint)

# Need to add CSS from appendix files
$appendixCSS = @"
/* Additional styles for letters */
.letter{margin:24pt 0;page-break-inside:avoid}
.letterhead{font-weight:bold;text-align:center;margin-bottom:12pt;border-bottom:2pt solid #000;padding-bottom:6pt}
.date{margin:12pt 0;text-align:right}
.address{margin:12pt 0}
.signature-block{margin-top:24pt}
.resume{margin:24pt 0;page-break-after:always}
.name{font-size:14pt;font-weight:bold;text-align:center;margin-bottom:6pt}
.contact{text-align:center;margin-bottom:18pt;font-size:11pt}
.section{margin:12pt 0}
.section-title{font-weight:bold;text-transform:uppercase;border-bottom:1pt solid #000;padding-bottom:3pt;margin:12pt 0 6pt}
.entry{margin:6pt 0}
.entry-header{font-weight:bold}
.entry-details{font-style:italic;margin:3pt 0}
.document{margin:24pt 0;page-break-after:always}
.instrument{margin:24pt 0;page-break-after:always}
.item{font-weight:bold;margin:12pt 0 3pt}
.scale{margin-left:20pt;font-size:11pt}
"@

# Insert additional CSS before the closing </style> tag in the head
$beforeAppendices = $beforeAppendices -replace '</style>', "$appendixCSS`n</style>"

# Combine all content
$combined = $beforeAppendices + @"
<h1>APPENDICES</h1>

<div class="page-break"></div>

$appendixA

<div class="page-break"></div>

$appendixB

<div class="page-break"></div>

$appendixC

<div class="page-break"></div>

$appendixD

<div class="page-break"></div>

$appendixE

<div class="page-break"></div>

$appendixF

</body>
</html>
"@

# Write combined file
$combined | Out-File "F:\OneDrive - University of Missouri\IS_LT-7355_cloned\UAPB_FIPSE_Grant_Application_Complete.html" -Encoding UTF8

Write-Host "Combined grant application created successfully!"
Write-Host "File: UAPB_FIPSE_Grant_Application_Complete.html"
