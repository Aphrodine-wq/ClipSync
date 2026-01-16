@echo off
setlocal enabledelayedexpansion

REM ClipSync Launcher - Simple and Robust
REM This launcher stays open to show errors

REM Set error log file
set "ERROR_LOG=launcher-error.log"

REM Function to log errors
goto :main

:log_error
echo [%date% %time%] ERROR: %~1 >> "%ERROR_LOG%"
echo.
echo ========================================
echo    ERROR: %~1
echo ========================================
echo.
echo Error details have been logged to: %ERROR_LOG%
echo.
goto :eof

:log_info
echo [%date% %time%] INFO: %~1 >> "%ERROR_LOG%"
goto :eof

:main
REM Clear previous error log
> "%ERROR_LOG%" echo ClipSync Launcher Error Log
>> "%ERROR_LOG%" echo Started: %date% %time%
>> "%ERROR_LOG%" echo.

echo.
echo ========================================
echo    ClipSync Launcher
echo ========================================
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    call :log_error "Node.js is not installed or not in PATH"
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
call :log_info "Node.js found"
echo    [OK] Node.js is installed
echo.

REM Check Docker (non-fatal - just warn)
echo [2/6] Checking Docker...
docker ps >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo    [WARNING] Docker is not running
    echo    ClipSync will work, but database features may not be available
    echo    To use full features, start Docker Desktop and run this launcher again
    call :log_info "Docker not running (non-fatal)"
    echo.
    set "DOCKER_AVAILABLE=0"
) else (
    echo    [OK] Docker is running
    call :log_info "Docker is running"
    set "DOCKER_AVAILABLE=1"
    echo.
)

REM Check/create .env files
echo [3/6] Checking environment files...
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        echo    [INFO] Creating backend\.env from template...
        copy "backend\.env.example" "backend\.env" >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            call :log_info "Created backend\.env"
            echo    [OK] Created backend\.env - please update with your values
        ) else (
            call :log_error "Failed to create backend\.env"
            echo    [WARNING] Could not create backend\.env
        )
    ) else (
        call :log_info "backend\.env.example not found"
        echo    [INFO] backend\.env.example not found - skipping
    )
) else (
    echo    [OK] backend\.env exists
)

if not exist "clipsync-app\.env" (
    if exist "clipsync-app\.env.example" (
        echo    [INFO] Creating clipsync-app\.env from template...
        copy "clipsync-app\.env.example" "clipsync-app\.env" >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            call :log_info "Created clipsync-app\.env"
            echo    [OK] Created clipsync-app\.env - please update with your values
        ) else (
            call :log_error "Failed to create clipsync-app\.env"
            echo    [WARNING] Could not create clipsync-app\.env
        )
    ) else (
        call :log_info "clipsync-app\.env.example not found"
        echo    [INFO] clipsync-app\.env.example not found - skipping
    )
) else (
    echo    [OK] clipsync-app\.env exists
)
echo.

REM Start Docker services (if Docker is available)
if "%DOCKER_AVAILABLE%"=="1" (
    echo [4/6] Starting Docker services...
    docker-compose -f docker-compose.local.yml up -d >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo    [OK] Docker services started
        call :log_info "Docker services started"
        timeout /t 2 /nobreak >nul
    ) else (
        echo    [WARNING] Could not start Docker services
        call :log_info "Docker services failed to start (non-fatal)"
    )
    echo.
) else (
    echo [4/6] Skipping Docker services (Docker not available)
    echo.
)

REM Check/install dependencies
echo [5/6] Checking dependencies...
if not exist "backend\node_modules" (
    echo    [INFO] Installing backend dependencies...
    cd backend
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        call :log_error "Backend npm install failed"
        echo    [ERROR] Failed to install backend dependencies
        cd ..
        echo.
        pause
        exit /b 1
    )
    cd ..
    call :log_info "Backend dependencies installed"
    echo    [OK] Backend dependencies installed
) else (
    echo    [OK] Backend dependencies already installed
)

if not exist "clipsync-app\node_modules" (
    echo    [INFO] Installing frontend dependencies...
    cd clipsync-app
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        call :log_error "Frontend npm install failed"
        echo    [ERROR] Failed to install frontend dependencies
        cd ..
        echo.
        pause
        exit /b 1
    )
    cd ..
    call :log_info "Frontend dependencies installed"
    echo    [OK] Frontend dependencies installed
) else (
    echo    [OK] Frontend dependencies already installed
)
echo.

REM Start services
echo [6/6] Starting ClipSync services...
echo.

REM Start backend
echo    [INFO] Starting backend server...
start "ClipSync Backend" cmd /k "cd backend && npm run dev"
if %ERRORLEVEL% NEQ 0 (
    call :log_error "Failed to start backend server"
    echo    [ERROR] Failed to start backend server
    echo.
    pause
    exit /b 1
)
call :log_info "Backend server started"
timeout /t 3 /nobreak >nul

REM Start frontend
echo    [INFO] Starting frontend server...
start "ClipSync Frontend" cmd /k "cd clipsync-app && npm run dev"
if %ERRORLEVEL% NEQ 0 (
    call :log_error "Failed to start frontend server"
    echo    [ERROR] Failed to start frontend server
    echo.
    pause
    exit /b 1
)
call :log_info "Frontend server started"
timeout /t 5 /nobreak >nul

REM Open browser
echo    [INFO] Opening browser...
start http://localhost:5173 >nul 2>&1
call :log_info "Browser opened"

echo.
echo ========================================
echo    ClipSync is Running!
echo ========================================
echo.
echo    Backend:  http://localhost:3001
echo    Frontend: http://localhost:5173
echo.
echo    Two new windows have opened:
echo    - ClipSync Backend (keep this open)
echo    - ClipSync Frontend (keep this open)
echo.
echo    This window can be closed.
echo    Services will continue running in their own windows.
echo.
call :log_info "ClipSync started successfully"
>> "%ERROR_LOG%" echo Completed successfully: %date% %time%
echo Press any key to close this window...
pause >nul
