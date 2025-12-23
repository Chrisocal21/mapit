@echo off
echo Stopping all Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting backend server on port 3000...
cd /d "%~dp0"
start "MapRdy Backend" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

echo Starting frontend dev server on port 5175...
cd client
start "MapRdy Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5175
echo.
pause
