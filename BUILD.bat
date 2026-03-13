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
echo  arXiv Browser - Setup and Launch
echo  Working in: %APPDIR%
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed.
    echo Please install it from https://nodejs.org then run this file again.
    pause & exit /b 1
)

if not exist node_modules (
    echo Installing dependencies for the first time...
    call npm install
    if errorlevel 1 ( echo Installation failed. & pause & exit /b 1 )
    echo.
)

echo Launching arXiv Browser...
call npm start
