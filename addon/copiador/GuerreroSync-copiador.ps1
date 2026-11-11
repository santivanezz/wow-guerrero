# =====================================================================
# Copiador de GuerreroSync
# Chrome/Edge no dejan que una web lea archivos dentro de "Program Files".
# Este script copia tu GuerreroSync.lua a una carpeta normal
# (C:\Users\<tú>\GuerreroSync) cada vez que el juego lo guarda.
# En la web conectas ESA copia una sola vez.
# Solo lee y copia ese archivo; no toca nada más.
# =====================================================================
param(
  [string]$Origen = "C:\Program Files (x86)\Battlenet\WOW\World of Warcraft\_forever_\WTF\Account",
  [string]$Destino = (Join-Path $env:USERPROFILE "GuerreroSync"),
  [switch]$UnaVez
)

New-Item -ItemType Directory -Force -Path $Destino | Out-Null
$destinoArchivo = Join-Path $Destino "GuerreroSync.lua"

function Copiar {
  $f = Get-ChildItem -Path $Origen -Recurse -Filter "GuerreroSync.lua" -ErrorAction SilentlyContinue |
    Where-Object { $_.DirectoryName -like "*\SavedVariables" } |
    Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if (-not $f) { return $false }
  if (-not (Test-Path $destinoArchivo) -or (Get-Item $destinoArchivo).LastWriteTime -lt $f.LastWriteTime) {
    try { Copy-Item -Path $f.FullName -Destination $destinoArchivo -Force -ErrorAction Stop; return $true } catch { return $false }
  }
  return $false
}

if (Copiar) { Write-Host "Copiado a $destinoArchivo" } else { Write-Host "Sin cambios ($destinoArchivo)" }
if ($UnaVez) { return }
while ($true) { Start-Sleep -Seconds 10; [void](Copiar) }
