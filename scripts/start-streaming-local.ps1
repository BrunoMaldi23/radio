$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$mediaMtxExe = "C:\Users\bruno\OneDrive\Escritorio\mediamtx_v1.18.2_windows_amd64\mediamtx.exe"
$mediaMtxConfig = Join-Path $root "infra\mediamtx\mediamtx.yml"
$icecastExe = "C:\Program Files\Icecast\bin\icecast.exe"
$icecastConfig = Join-Path $root "infra\icecast\icecast.windows.xml"
$mediaLogDir = Join-Path $root "logs\mediamtx"
$iceLogDir = Join-Path $root "logs\icecast"

New-Item -ItemType Directory -Force -Path $mediaLogDir, $iceLogDir | Out-Null

function Stop-PortProcess {
  param([int[]] $Ports)

  foreach ($port in $Ports) {
    $lines = netstat -ano | Select-String ":$port" | Select-String "LISTENING"
    foreach ($line in $lines) {
      $parts = ($line.ToString() -split "\s+") | Where-Object { $_ }
      $processId = [int]$parts[-1]
      $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
      if ($proc -and ($proc.ProcessName -in @("mediamtx", "icecast"))) {
        Stop-Process -Id $processId -Force
        Write-Host "Detenido $($proc.ProcessName) PID $processId en puerto $port"
      }
    }
  }
}

Stop-PortProcess -Ports @(1935, 8888, 8889, 9997, 9998)

if (!(Test-Path $mediaMtxExe)) {
  throw "No encontre MediaMTX en $mediaMtxExe"
}

if (!(Test-Path $icecastExe)) {
  throw "No encontre Icecast en $icecastExe"
}

Start-Process `
  -FilePath $mediaMtxExe `
  -ArgumentList $mediaMtxConfig `
  -WorkingDirectory (Split-Path $mediaMtxExe) `
  -WindowStyle Hidden `
  -RedirectStandardOutput (Join-Path $mediaLogDir "stdout.log") `
  -RedirectStandardError (Join-Path $mediaLogDir "stderr.log")

Start-Process `
  -FilePath $icecastExe `
  -ArgumentList "-c", $icecastConfig `
  -WorkingDirectory "C:\Program Files\Icecast" `
  -WindowStyle Hidden

Write-Host "Streaming local iniciado."
Write-Host "OBS Server: rtmp://localhost:1935"
Write-Host "OBS Stream Key: tv"
Write-Host "HLS: http://localhost:8888/tv/index.m3u8"
Write-Host "Icecast: http://localhost:8000/"
