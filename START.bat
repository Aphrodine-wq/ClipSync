@echo off
REM ClipSync - Simple Starter
REM Just starts the services, minimal checks

echo.
echo Starting ClipSync...
echo.

REM Quick Node.js check
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Start Docker services (if available, ignore errors)
docker-compose -f docker-compose.local.yml up -d >nul 2>&1

REM Start backend
echo Starting backend...
start "ClipSync Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start frontend
echo Starting frontend...
start "ClipSync Frontend" cmd /k "cd clipsync-app && npm run dev"

REM Wait and open browser
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ClipSync is starting!
echo Check the two new windows that opened.
echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.
pause


