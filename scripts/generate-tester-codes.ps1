$csvPath = "docs/testers-beta.csv"
$outCsvPath = "docs/tester-codes.csv"
$tsPath = "apps/api/src/modules/feedback/tester-codes.ts"

if (-not (Test-Path $csvPath)) {
    Write-Host "Arquivo $csvPath não encontrado." -ForegroundColor Red
    exit 1
}

$testers = Import-Csv -Path $csvPath
$list = [System.Collections.Generic.List[PSObject]]::new()
$tsEntries = [System.Collections.Generic.List[string]]::new()

$index = 1
foreach ($t in $testers) {
    $code = "EP-" + ($index.ToString("D3"))
    $list.Add([PSCustomObject]@{
        code = $code
        email = $t.email
        name = $t.name
        organization = $t.organization
    })
    $tsEntries.Add("  '$code': '$($t.email)'")
    $index++
}

$list | Export-Csv -Path $outCsvPath -NoTypeInformation -Encoding UTF8
Write-Host "✅ $outCsvPath gerado com $($list.Count) testers." -ForegroundColor Green

$feedbackDir = [System.IO.Path]::GetDirectoryName($tsPath)
if (-not (Test-Path $feedbackDir)) {
    New-Item -ItemType Directory -Path $feedbackDir -Force | Out-Null
}

$tsContent = "// Gerado automaticamente por scripts/generate-tester-codes.ps1`n" +
"export const VALID_TESTER_CODES: Record<string, string> = {`n" +
($tsEntries -join ",`n") +
"`n};`n`n" +
"export function isValidTesterCode(code: string): boolean {`n" +
"  if (!code || typeof code !== 'string') return false;`n" +
"  const normalized = code.trim().toUpperCase();`n" +
"  return /^EP-\\d{3}$/.test(normalized) && Boolean(VALID_TESTER_CODES[normalized]);`n" +
"}`n"

Set-Content -Path $tsPath -Value $tsContent -Encoding UTF8
Write-Host "✅ $tsPath gerado com sucesso." -ForegroundColor Green
