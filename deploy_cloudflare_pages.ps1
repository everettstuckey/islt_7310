param(
    [string]$ProjectName = "everettstuckey-com",
    [string]$Branch = "main"
)

$ErrorActionPreference = "Stop"

$siteRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$envPath = Join-Path (Split-Path -Parent $siteRoot) ".env"

if (-not (Test-Path -LiteralPath $envPath)) {
    throw "Missing .env at $envPath"
}

Get-Content -LiteralPath $envPath | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }

    if ($line -match "^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$") {
        $name = $matches[1]
        $value = $matches[2].Trim()

        if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
            $value = $value.Substring(1, $value.Length - 2)
        }

        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

if (-not $env:CLOUDFLARE_ACCOUNT_ID) {
    throw "CLOUDFLARE_ACCOUNT_ID is not set."
}

if (-not $env:CLOUDFLARE_API_TOKEN) {
    throw "CLOUDFLARE_API_TOKEN is not set."
}

Push-Location $siteRoot
try {
    & npx wrangler pages project create $ProjectName --production-branch $Branch
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Project creation did not complete. Continuing to deploy in case the project already exists."
    }

    & npx wrangler pages deploy . --project-name $ProjectName --branch $Branch
    if ($LASTEXITCODE -ne 0) {
        throw "Cloudflare Pages deploy failed."
    }
}
finally {
    Pop-Location
}
