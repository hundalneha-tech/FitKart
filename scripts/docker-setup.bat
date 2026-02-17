@echo off
REM ============================================
REM FitKart Docker Setup Script (Windows)
REM ============================================

setlocal enabledelayedexpansion

REM Colors (using ANSI escape sequences)
set "GREEN=[32m"
set "RED=[31m"
set "YELLOW=[33m"
set "NC=[0m"

if "%1%"=="" goto :show_usage
if "%1%"=="setup" goto :setup
if "%1%"=="start" goto :start
if "%1%"=="stop" goto :stop
if "%1%"=="restart" goto :restart
if "%1%"=="logs" goto :logs
if "%1%"=="seed" goto :seed
if "%1%"=="clean" goto :clean
if "%1%"=="status" goto :status
goto :show_usage

:setup
echo.
echo ============================================
echo FitKart Docker Setup
echo ============================================
echo.

echo Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed
    exit /b 1
)
echo Docker found

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker Compose is not installed
    exit /b 1
)
echo Docker Compose found
echo.

if not exist ".env" (
    echo Creating .env file...
    (
        echo # Environment
        echo NODE_ENV=development
        echo PORT=3000
        echo.
        echo # Database Configuration
        echo DATABASE_HOST=postgres
        echo DATABASE_PORT=5432
        echo DATABASE_NAME=fitkart
        echo DATABASE_USER=postgres
        echo DATABASE_PASSWORD=postgres
        echo.
        echo # Redis Configuration
        echo REDIS_HOST=redis
        echo REDIS_PORT=6379
        echo REDIS_PASSWORD=
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
        echo JWT_EXPIRY=15m
        echo REFRESH_TOKEN_EXPIRY=7d
        echo.
        echo # CORS Configuration
        echo CORS_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002
        echo.
        echo # Logging
        echo LOG_LEVEL=info
    ) > .env
    echo .env file created
) else (
    echo .env file already exists
)
echo.

echo Building Docker images...
docker-compose build
echo Images built successfully
echo.

set environment=%2
if "%environment%"=="" set environment=development

echo Starting services in %environment% mode...
if "%environment%"=="production" (
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
) else (
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
)
echo Services started
echo.

timeout /t 5 >nul

echo Waiting for services to be healthy...
timeout /t 5 >nul

echo.
echo ============================================
echo FitKart Services are running!
echo ============================================
echo.
echo Backend API:         http://localhost:3000
echo Health Check:        http://localhost:3000/health
echo.
echo PostgreSQL:          localhost:5432
echo Redis:               localhost:6379
echo.
echo pgAdmin:             http://localhost:5050
echo Redis Commander:     http://localhost:8081
echo.
goto :end

:start
set environment=%2
if "%environment%"=="" set environment=development
echo Starting services in %environment% mode...
if "%environment%"=="production" (
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
) else (
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
)
echo Services started
goto :end

:stop
echo Stopping services...
docker-compose down
echo Services stopped
goto :end

:restart
echo Restarting services...
docker-compose restart
echo Services restarted
goto :end

:logs
echo Showing logs...
docker-compose logs -f
goto :end

:seed
echo Seeding database...
docker-compose exec -T backend npm run seed
echo Database seeded
goto :end

:clean
echo Removing all Docker resources...
docker-compose down -v
echo All resources removed
goto :end

:status
echo Service status:
docker-compose ps
goto :end

:show_usage
echo Usage: docker-setup.bat {setup^|start^|stop^|restart^|logs^|seed^|clean^|status} [development^|production]
echo.
echo Commands:
echo   setup       - Initialize and start all services
echo   start       - Start services
echo   stop        - Stop services
echo   restart     - Restart services
echo   logs        - Show service logs
echo   seed        - Seed database with initial data
echo   clean       - Remove all Docker resources
echo   status      - Show service status
echo.

:end
endlocal
