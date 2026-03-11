@echo off
title arXiv Browser — Build
color 0A
echo.
echo  =========================================
echo   arXiv Browser — Building the .exe
echo  =========================================
echo.

:: Disable ALL code signing
set CSC_IDENTITY_AUTO_DISCOVERY=false
set WIN_CSC_LINK=
set CSC_LINK=
set CSC_KEY_PASSWORD=

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [1/3] Node.js not found. Downloading...
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\node-installer.msi'; Start-Process msiexec -ArgumentList '/i %TEMP%\node-installer.msi /quiet /norestart' -Wait}"
    set "PATH=%PATH%;C:\Program Files\nodejs"
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo  ERROR: Node.js install failed. Get it from https://nodejs.org
        pause & exit /b 1
    )
    echo  Node.js installed.
) else (
    echo  [1/3] Node.js: OK
)

echo.
echo  [2/3] Installing dependencies...
if exist "node_modules" rmdir /s /q node_modules
call npm install
if %errorlevel% neq 0 (
    echo  ERROR during npm install.
    pause & exit /b 1
)

echo.
echo  [3/3] Building the .exe...
echo  (This creates a folder with the app, not an installer)
echo.
call npm run build:win
if %errorlevel% neq 0 (
    echo  ERROR during build.
    pause & exit /b 1
)

echo.
echo  =========================================
echo   SUCCESS!
echo   Your app is in: dist\arXiv Browser-win32-x64\
echo   Share that entire folder, or zip it up.
echo   Run: "arXiv Browser.exe" inside it
echo  =========================================
echo.

if exist "dist" explorer dist
pause