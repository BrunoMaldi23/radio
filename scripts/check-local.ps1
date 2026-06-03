$ErrorActionPreference = "Continue"

function Check-Url {
  param(
    [string] $Name,
    [string] $Url
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
    Write-Host "OK   $Name -> $($response.StatusCode) $Url"
  } catch {
    Write-Host "FAIL $Name -> $($_.Exception.Message) $Url"
  }
}

Check-Url "Web" "http://localhost:3000/"
Check-Url "API health" "http://localhost:3001/health"
Check-Url "API profiles" "http://localhost:3001/streaming/ingest-profiles"
Check-Url "API runtime" "http://localhost:3001/streaming/runtime-status"
Check-Url "Icecast" "http://localhost:8000/"
Check-Url "MediaMTX API" "http://localhost:9997/v3/paths/list"
Check-Url "MediaMTX HLS tv" "http://localhost:8888/tv/index.m3u8"

Write-Host ""
Write-Host "Si HLS tv falla con 404, OBS todavia no esta transmitiendo el path tv."
