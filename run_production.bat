@echo off
echo ===================================================
echo   Automated AgriCare Production System Startup
echo ===================================================

:: 1. Validate Docker Engine status
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker daemon is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

:: 2. Automated multi-container build and deployment
echo [INFO] Building and starting all services (Database, API, Web UI)...
docker-compose up --build -d

echo ===================================================
echo [SUCCESS] AgriCare System deployed in fully automated mode!
echo Web UI: http://localhost
echo API Endpoint: http://localhost/api/docs
echo ===================================================
pause