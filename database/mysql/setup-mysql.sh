#!/bin/bash
# MySQL Database Setup Script for Workflow Pro
# This script sets up the complete MySQL database

echo "Setting up MySQL database for Workflow Pro..."

# Configuration
DB_NAME="project_management_system"
DB_USER="workflow_user"
DB_PASSWORD="workflow_password"
DB_HOST="localhost"
DB_PORT="3306"
ROOT_PASSWORD=""

# Check if MySQL is running
if ! mysqladmin ping -h $DB_HOST -P $DB_PORT --silent; then
    echo "Error: MySQL is not running. Please start MySQL service first."
    exit 1
fi

echo "Creating database and user..."

# Prompt for root password if not set
if [ -z "$ROOT_PASSWORD" ]; then
    read -s -p "Enter MySQL root password: " ROOT_PASSWORD
    echo
fi

# Create database and user
mysql -h $DB_HOST -P $DB_PORT -u root -p$ROOT_PASSWORD << EOF
-- Create database
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;

-- Create user
DROP USER IF EXISTS '$DB_USER'@'localhost';
CREATE USER '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo "Database and user created successfully."
else
    echo "Error creating database and user."
    exit 1
fi

echo "Running schema setup..."

# Run the main schema
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < schema.sql

if [ $? -eq 0 ]; then
    echo "Schema created successfully."
else
    echo "Error creating schema."
    exit 1
fi

echo "Running migrations..."

# Run migrations in order
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < add_estimation_migration.sql
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < milestone-migration.sql
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < gantt_chart_migration.sql
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < backend_compatibility_update.sql

echo "Loading test data..."

# Load test data
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < test_data.sql
mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME < gantt_test_data.sql

echo "MySQL database setup completed successfully!"
echo ""
echo "Database Information:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  Username: $DB_USER"
echo "  Password: $DB_PASSWORD"
echo ""
echo "Connection string: jdbc:mysql://$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "You can now configure your application to use this database."
