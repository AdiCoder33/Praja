@echo off
echo ========================================
echo   AI Voice FIR Assistant
echo ========================================
echo.
echo Starting server...
echo.

start "AI FIR Server" cmd /k "python server.py"

timeout /t 5 /nobreak

echo Opening browser...
start https://localhost:5000

echo.
echo ========================================
echo   Server Started!
echo ========================================
echo.
echo URL: https://localhost:5000
echo.
echo 1. Accept certificate warning
echo 2. Click microphone button
echo 3. Speak your complaint!
echo.
pause
