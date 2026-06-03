$ErrorActionPreference = "Continue"

$names = @("mediamtx", "icecast")

foreach ($name in $names) {
  Get-Process -Name $name -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.Id -Force
    Write-Host "Detenido $($_.ProcessName) PID $($_.Id)"
  }
}
