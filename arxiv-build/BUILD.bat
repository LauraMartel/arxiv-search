@echo off
title arXiv Browser — Build
color 0A
echo.
echo  =========================================
echo   arXiv Browser — Building the .exe
echo  =========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [1/3] Node.js not found. Downloading...
    echo        (about 30 MB, may take 1-2 minutes)
    echo.
    powershell -Command "& {Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP%\node-installer.msi'; Start-Process msiexec -ArgumentList '/i %TEMP%\node-installer.msi /quiet /norestart' -Wait}"
    :: Reload PATH
    set "PATH=%PATH%;C:\Program Files\nodejs"
    node --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo.
        echo  ERROR: Node.js installation failed.
        echo  Please install it manually from: https://nodejs.org
        pause
        exit /b 1
    )
    echo  Node.js installed successfully.
) else (
    echo  [1/3] Node.js detected: OK
)

echo.
echo  [2/3] Installing dependencies (Electron)...
echo        (about 150 MB, first time only)
echo.
call npm install
if %errorlevel% neq 0 (
    echo.
    echo  ERROR during npm install.
    pause
    exit /b 1
)

echo.
echo  [3/3] Building the .exe installer...
echo.
call npm run build:win
if %errorlevel% neq 0 (
    echo.
    echo  ERROR during build.
    pause
    exit /b 1
)

echo.
echo  =========================================
echo   SUCCESS! The installer is in the
echo   dist\ folder
echo  =========================================
echo.
echo  Share the .exe file with your colleagues.
echo  They just need to double-click it to
echo  install the application — nothing else.
echo.

:: Open the dist folder automatically
if exist "dist" (
    explorer dist
)

pause
