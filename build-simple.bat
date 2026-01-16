@echo off
echo ========================================
echo ClipSync Simple Build Script
echo ========================================
echo.

REM Step 1: Build the React app
echo [1/4] Building React app...
cd clipsync-app
call npm run build
if errorlevel 1 (
    echo ERROR: React build failed!
    pause
    exit /b 1
)
cd ..
echo React app built successfully!
echo.

REM Step 2: Create output directory
echo [2/4] Creating output directory...
if exist "release\windows\ClipSync-Portable" rmdir /s /q "release\windows\ClipSync-Portable"
mkdir "release\windows\ClipSync-Portable"
echo.

REM Step 3: Copy Electron runtime
echo [3/4] Copying Electron runtime...
xcopy "clipsync-desktop\node_modules\electron\dist\*" "release\windows\ClipSync-Portable\" /E /I /Y /Q
echo.

REM Step 4: Copy application files
echo [4/4] Copying application files...

REM Copy main app files
copy "clipsync-desktop\main.js" "release\windows\ClipSync-Portable\resources\app\main.js" >nul
copy "clipsync-desktop\preload.js" "release\windows\ClipSync-Portable\resources\app\preload.js" >nul
copy "clipsync-desktop\package.json" "release\windows\ClipSync-Portable\resources\app\package.json" >nul

REM Copy built React app
xcopy "clipsync-app\dist\*" "release\windows\ClipSync-Portable\resources\app\dist\" /E /I /Y /Q

REM Copy ALL node_modules (to ensure all dependencies are included)
echo Copying node_modules (this may take a moment)...
xcopy "clipsync-desktop\node_modules" "release\windows\ClipSync-Portable\resources\app\node_modules\" /E /I /Y /Q

REM Rename electron.exe to ClipSync.exe
if exist "release\windows\ClipSync-Portable\electron.exe" (
    ren "release\windows\ClipSync-Portable\electron.exe" "ClipSync.exe"
)

echo.
echo ========================================
echo Build completed successfully!
echo ========================================
echo.
echo Output location: release\windows\ClipSync-Portable\
echo Run ClipSync.exe to start the application
echo.
pause
