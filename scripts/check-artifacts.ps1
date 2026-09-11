$apk = Get-Item 'apps/mobile/eleicoes-progressistas-v2.2.0-beta.apk' -ErrorAction SilentlyContinue
$aab = Get-Item 'apps/mobile/eleicoes-progressistas-v2.2.0.aab' -ErrorAction SilentlyContinue

if ($apk) {
    $apkHash = (Get-FileHash $apk.FullName -Algorithm SHA256).Hash
    $apkSize = [Math]::Round($apk.Length / 1MB, 2)
    Write-Host "APK: $apkSize MB | SHA256: $apkHash"
} else {
    Write-Host "APK not found"
}

if ($aab) {
    $aabHash = (Get-FileHash $aab.FullName -Algorithm SHA256).Hash
    $aabSize = [Math]::Round($aab.Length / 1MB, 2)
    Write-Host "AAB: $aabSize MB | SHA256: $aabHash"
} else {
    Write-Host "AAB not found"
}
