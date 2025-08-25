@echo off
REM MySQL Database Setup Script for Workflow Pro (Windows)
REM This script sets up the complete MySQL database

echo Setting up MySQL database for Workflow Pro...

REM Configuration
set DB_NAME=project_management_system
set DB_USER=workflow_user
set DB_PASSWORD=workflow_password
set DB_HOST=localhost
set DB_PORT=3306

echo Creating database and user...

REM Prompt for root password
set /p ROOT_PASSWORD=Enter MySQL root password: 

REM Create database and user
mysql -h %DB_HOST% -P %DB_PORT% -u root -p%ROOT_PASSWORD% -e "DROP DATABASE IF EXISTS %DB_NAME%;"
mysql -h %DB_HOST% -P %DB_PORT% -u root -p%ROOT_PASSWORD% -e "CREATE DATABASE %DB_NAME%;"
mysql -h %DB_HOST% -P %DB_PORT% -u root -p%ROOT_PASSWORD% -e "DROP USER IF EXISTS '%DB_USER%'@'localhost';"
mysql -h %DB_HOST% -P %DB_PORT% -u root -p%ROOT_PASSWORD% -e "CREATE USER '%DB_USER%'@'localhost' IDENTIFIED BY '%DB_PASSWORD%';"
mysql -h %DB_HOST% -P %DB_PORT% -u root -p%ROOT_PASSWORD% -e "GRANT ALL PRIVILEGES ON %DB_NAME%.* TO '%DB_USER%'@'localhost';"
mysql -h %DB_HOST% -P %DB_PORT% -u root -p%ROOT_PASSWORD% -e "FLUSH PRIVILEGES;"

if %ERRORLEVEL% neq 0 (
    echo Error creating database and user.
    pause
    exit /b 1
)

echo Database and user created successfully.

echo Running schema setup...

REM Run the main schema
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < schema.sql

if %ERRORLEVEL% neq 0 (
    echo Error creating schema.
    pause
    exit /b 1
)

echo Schema created successfully.

echo Running migrations...

REM Run migrations in order
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < add_estimation_migration.sql
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < milestone-migration.sql
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < gantt_chart_migration.sql
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < backend_compatibility_update.sql

echo Loading test data...

REM Load test data
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < test_data.sql
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < gantt_test_data.sql

echo MySQL database setup completed successfully!
echo.
echo Database Information:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   Username: %DB_USER%
echo   Password: %DB_PASSWORD%
echo.
echo Connection string: jdbc:mysql://%DB_HOST%:%DB_PORT%/%DB_NAME%
echo.
echo You can now configure your application to use this database.
pause
