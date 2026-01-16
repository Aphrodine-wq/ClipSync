@echo off
echo Starting ClipSync Development Environment...
echo.

REM Kill any existing processes
taskkill /F /IM node.exe 2>nul
taskkill /F /IM electron.exe 2>nul
timeout /t 2 /nobreak >nul

echo Starting Vite dev server...
cd clipsync-app
start "Vite Dev Server" cmd /k "npm run dev"

echo Waiting for dev server to start...
timeout /t 5 /nobreak

echo Starting Electron app...
cd ..\clipsync-desktop
set NODE_ENV=development
start "ClipSync Electron" cmd /k "npm start"

echo.
echo Development environment started!
echo - Vite dev server running on http://localhost:5173
echo - Electron app should open shortly
echo.
pause
