@echo off
REM FitKart Database Initialization Script for Windows
REM Usage: init-database.bat

setlocal enabledelayedexpansion

REM Default values
set DB_HOST=localhost
set DB_PORT=5432
set DB_NAME=fitkart
set DB_USER=fitkart_user
set DB_PASSWORD=fitkart_password

echo.
echo 4  FitKart Database Initialization
echo ==================================
echo.

REM Allow override from environment variables
if defined db_host_env set DB_HOST=!db_host_env!
if defined db_port_env set DB_PORT=!db_port_env!
if defined db_name_env set DB_NAME=!db_name_env!
if defined db_user_env set DB_USER=!db_user_env!
if defined db_password_env set DB_PASSWORD=!db_password_env!

echo Creating database user...
psql -h %DB_HOST% -U postgres -tc "SELECT 1 FROM pg_user WHERE usename = '%DB_USER%'" | findstr /C:"1" >nul
if errorlevel 1 (
    psql -h %DB_HOST% -U postgres -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%' CREATEDB;"
)

echo Creating database...
psql -h %DB_HOST% -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '%DB_NAME%'" | findstr /C:"1" >nul
if errorlevel 1 (
    psql -h %DB_HOST% -U postgres -c "CREATE DATABASE %DB_NAME% OWNER %DB_USER%;"
)

echo Running migrations...
set PGPASSWORD=%DB_PASSWORD%
psql -h %DB_HOST% -U %DB_USER% -d %DB_NAME% -f migrations\001_initial_schema.sql
if errorlevel 1 (
    echo ❌  Failed to create schema
    exit /b 1
)
echo ✅  Schema created successfully

echo Seeding database...
psql -h %DB_HOST% -U %DB_USER% -d %DB_NAME% -f seeds\001_initial_seed.sql
if errorlevel 1 (
    echo ❌  Failed to seed database
    exit /b 1
)
echo ✅  Database seeded successfully

echo.
echo ✅  Database initialization complete!
echo.
echo Connection details:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo.
echo To connect:
echo   psql -h %DB_HOST% -U %DB_USER% -d %DB_NAME%
echo.

endlocal
