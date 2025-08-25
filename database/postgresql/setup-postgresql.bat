@echo off
REM PostgreSQL Database Setup Script for Workflow Pro (Windows)
REM This script sets up the complete PostgreSQL database

echo Setting up PostgreSQL database for Workflow Pro...

REM Configuration
set DB_NAME=project_management_system
set DB_USER=workflow_user
set DB_PASSWORD=12356
set DB_HOST=localhost
set DB_PORT=5432

echo Creating database and user...

REM Create database and user (run as postgres superuser)
psql -U postgres -h %DB_HOST% -p %DB_PORT% -c "DROP DATABASE IF EXISTS %DB_NAME%;"
psql -U postgres -h %DB_HOST% -p %DB_PORT% -c "CREATE DATABASE %DB_NAME%;"
psql -U postgres -h %DB_HOST% -p %DB_PORT% -c "DROP USER IF EXISTS %DB_USER%;"
psql -U postgres -h %DB_HOST% -p %DB_PORT% -c "CREATE USER %DB_USER% WITH PASSWORD '%DB_PASSWORD%';"
psql -U postgres -h %DB_HOST% -p %DB_PORT% -c "GRANT ALL PRIVILEGES ON DATABASE %DB_NAME% TO %DB_USER%;"

REM Connect to the database and grant schema privileges
psql -U postgres -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "GRANT ALL ON SCHEMA public TO %DB_USER%;"
psql -U postgres -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO %DB_USER%;"
psql -U postgres -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO %DB_USER%;"
psql -U postgres -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO %DB_USER%;"
psql -U postgres -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO %DB_USER%;"

if %ERRORLEVEL% neq 0 (
    echo Error creating database and user.
    pause
    exit /b 1
)

echo Database and user created successfully.

echo Running schema setup...

REM Set password for psql commands
set PGPASSWORD=%DB_PASSWORD%

REM Run the main schema
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f schema.sql

if %ERRORLEVEL% neq 0 (
    echo Error creating schema.
    pause
    exit /b 1
)

echo Schema created successfully.

echo Loading test data...

REM Load basic test data first
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f test_data.sql

echo Running migrations...

REM Run migrations after basic data is loaded
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f add_estimation_migration.sql
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f milestone-migration.sql
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f backend_compatibility_update.sql

echo Loading additional test data...

REM Load additional test data
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f gantt_test_data.sql
psql -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f milestone_sample_data.sql

echo PostgreSQL database setup completed successfully!
echo.
echo Database Information:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   Username: %DB_USER%
echo   Password: %DB_PASSWORD%
echo.
echo Connection string: postgresql://%DB_USER%:%DB_PASSWORD%@%DB_HOST%:%DB_PORT%/%DB_NAME%
echo.
echo You can now configure your application to use this database.
pause
