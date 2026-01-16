@echo off
setlocal enabledelayedexpansion

REM ClipSync Electron Desktop Launcher
REM Starts the Electron desktop application

echo.
echo ========================================
echo    ClipSync Desktop Launcher
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Checking Electron app dependencies...
cd clipsync-desktop

REM Check if node_modules exist
if not exist "node_modules" (
    echo    [INFO] Installing Electron dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to install Electron dependencies
        cd ..
        pause
        exit /b 1
    )
    echo    [OK] Dependencies installed
) else (
    echo    [OK] Dependencies already installed
)
echo.

REM Check if web app is built
echo [2/4] Checking web app build...
cd ..
if not exist "clipsync-app\dist\index.html" (
    echo    [INFO] Web app not built. Building now...
    cd clipsync-app
    
    REM Check if frontend dependencies are installed
    if not exist "node_modules" (
        echo    [INFO] Installing frontend dependencies...
        call npm install
        if %ERRORLEVEL% NEQ 0 (
            echo [ERROR] Failed to install frontend dependencies
            cd ..
            pause
            exit /b 1
        )
    )
    
    echo    [INFO] Building frontend...
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Failed to build frontend
        cd ..
        pause
        exit /b 1
    )
    echo    [OK] Frontend built successfully
    cd ..
) else (
    echo    [OK] Web app is already built
)
echo.

REM Check development mode
echo [3/4] Checking development mode...
set "DEV_MODE=0"

REM Check if frontend dev server should run
if exist "clipsync-app\node_modules" (
    echo    [INFO] Frontend dependencies found
    echo    [INFO] Starting in development mode...
    echo    [INFO] Starting frontend dev server...
    start "ClipSync Frontend Dev" cmd /k "cd clipsync-app && npm run dev"
    set "DEV_MODE=1"
    timeout /t 5 /nobreak >nul
    echo    [OK] Frontend dev server starting
) else (
    echo    [INFO] Using production mode (built files)
)
echo.

REM Start Electron app
echo [4/4] Starting Electron desktop application...
cd clipsync-desktop

if "%DEV_MODE%"=="1" (
    echo    [INFO] Electron will connect to http://localhost:5173
    echo    [INFO] Waiting for frontend server to be ready...
    call npm run dev
) else (
    echo    [INFO] Starting Electron with built files...
    call npm start
)

cd ..

REM If we get here, Electron closed
echo.
echo Electron application closed.
pause

