# scripts/health-monitor.ps1
$API = 'https://eleicoes-progressistas.onrender.com'
$WEB = 'https://eleicoes-progressistas.pages.dev'
$LOG = 'logs/health-monitor.log'

if (!(Test-Path 'logs')) { New-Item -ItemType Directory -Path 'logs' | Out-Null }

while ($true) {
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    
    # API Health
    try {
        $health = Invoke-RestMethod -Uri "$API/api/health" -TimeoutSec 30
        $apiStatus = 'OK'
    } catch {
        $apiStatus = "FAIL: $($_.Exception.Message)"
    }
    
    # Frontend
    try {
        $web = Invoke-WebRequest -Uri $WEB -TimeoutSec 30 -UseBasicParsing
        $webStatus = $web.StatusCode
    } catch {
        $webStatus = "FAIL: $($_.Exception.Message)"
    }
    
    # Matching endpoint
    try {
        $body = @{ priority_pillars = @('p3','p9','p11'); location = @{ uf = 'SP' } } | ConvertTo-Json
        $match = Invoke-RestMethod -Uri "$API/api/matching/rank" -Method POST -Body $body -ContentType 'application/json' -TimeoutSec 15
        $matchStatus = "$($match.results.Count) results"
    } catch {
        $matchStatus = "FAIL: $($_.Exception.Message)"
    }
    
    $line = "[$timestamp] API: $apiStatus | Web: $webStatus | Match: $matchStatus"
    Write-Host $line
    Add-Content -Path $LOG -Value $line
    
    Start-Sleep -Seconds 300
}
