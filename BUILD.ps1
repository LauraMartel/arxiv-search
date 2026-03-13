# arXiv Browser - Build Script
# Right-click this file -> "Run with PowerShell"

Set-Location $PSScriptRoot

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  arXiv Browser - Windows Build" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Folder: $PSScriptRoot"
Write-Host ""

# Check Node
try { $v = node --version; Write-Host "Node: $v" } 
catch { Write-Host "ERROR: Node.js not found. Download from https://nodejs.org" -ForegroundColor Red; Read-Host "Press Enter to exit"; exit 1 }

# Wipe and reinstall
Write-Host "Cleaning..." -ForegroundColor Yellow
if (Test-Path node_modules) { Remove-Item node_modules -Recurse -Force }
if (Test-Path package-lock.json) { Remove-Item package-lock.json -Force }

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) { Write-Host "npm install failed" -ForegroundColor Red; Read-Host "Press Enter"; exit 1 }

Write-Host "Building..." -ForegroundColor Yellow
if (Test-Path dist) { Remove-Item dist -Recurse -Force }

npx electron-packager . "arXiv Browser" --platform=win32 --arch=x64 --out=dist --overwrite --icon=assets/icon.ico --ignore=dist --ignore=.git --asar

if ($LASTEXITCODE -ne 0) { Write-Host "Build failed" -ForegroundColor Red; Read-Host "Press Enter"; exit 1 }

Write-Host ""
Write-Host "Done! App is in: dist\arXiv Browser-win32-x64\" -ForegroundColor Green
Write-Host 'Run: "arXiv Browser.exe"' -ForegroundColor Green
Read-Host "Press Enter to exit"
