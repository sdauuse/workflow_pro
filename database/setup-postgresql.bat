@echo off
REM PostgreSQL Database Setup Script for Project Management System (Windows)
REM Run this script to set up the database for production deployment

setlocal enabledelayedexpansion

REM Configuration
set DB_NAME=project_management_system
set DB_USER=postgres
set DB_HOST=localhost
set DB_PORT=5432

echo === Project Management System Database Setup ===
echo.

REM Check if PostgreSQL is running
pg_isready -h %DB_HOST% -p %DB_PORT% >nul 2>&1
if errorlevel 1 (
    echo Error: PostgreSQL is not running on %DB_HOST%:%DB_PORT%
    echo Please start PostgreSQL and try again.
    pause
    exit /b 1
)

echo ✓ PostgreSQL is running

REM Check if database exists
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -lqt | findstr /C:"%DB_NAME%" >nul
if not errorlevel 1 (
    echo Warning: Database '%DB_NAME%' already exists
    set /p "choice=Do you want to drop and recreate it? (y/N): "
    if /i "!choice!"=="y" (
        echo Dropping existing database...
        dropdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME%
    ) else (
        echo Skipping database creation...
        pause
        exit /b 0
    )
)

REM Create database
echo Creating database '%DB_NAME%'...
createdb -h %DB_HOST% -p %DB_PORT% -U %DB_USER% %DB_NAME%

REM Run schema script
echo Creating database schema...
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f postgresql_schema.sql

REM Ask if user wants to load test data
set /p "choice=Do you want to load test data? (Y/n): "
if /i not "!choice!"=="n" (
    echo Loading test data...
    psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f postgresql_test_data.sql
    echo ✓ Test data loaded successfully
)

echo.
echo === Database Setup Complete ===
echo Database: %DB_NAME%
echo Host: %DB_HOST%:%DB_PORT%
echo User: %DB_USER%
echo.
echo Connection string for application:
echo jdbc:postgresql://%DB_HOST%:%DB_PORT%/%DB_NAME%
echo.
echo To connect manually:
echo psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME%
echo.
pause
