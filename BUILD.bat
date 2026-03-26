@echo off
setlocal enabledelayedexpansion

:: Store the current directory before any elevation
set "APPDIR=%~dp0"
set "APPDIR=%APPDIR:~0,-1%"

:: Check if already admin
net session >nul 2>&1
if %errorlevel% == 0 goto :ADMIN

:: Not admin — re-launch this exact file as admin with the path as argument
powershell -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/k cd /d \"%APPDIR%\" && \"%APPDIR%\BUILD.bat\"' -Verb RunAs"
exit /b

:ADMIN
cd /d "%APPDIR%"
echo.
echo  arXiv Browser - Setup and Build
echo  Working in: %APPDIR%
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed.
    echo Please install it from https://nodejs.org then run this file again.
    pause & exit /b 1
)

if not exist "node_modules\electron-builder" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 ( echo Installation failed. & pause & exit /b 1 )
    echo.
)

:: Check if the app is already built
if exist "dist\win-unpacked\arXiv Browser.exe" (
    echo Starting arXiv Browser...
    start "" "dist\win-unpacked\arXiv Browser.exe"
    exit /b
)

echo Building arXiv Browser installer (first time only, this may take a few minutes)...
call npx electron-builder --win --x64
if errorlevel 1 ( echo Build failed. & pause & exit /b 1 )
echo.

echo Build complete! Starting arXiv Browser...
start "" "dist\win-unpacked\arXiv Browser.exe"
echo.
echo You can now pin the app from your taskbar — it will use the correct icon.
echo The installer is also available at: dist\arXiv Browser Setup.exe
pause
