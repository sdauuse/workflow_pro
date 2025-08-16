#!/bin/bash

# PostgreSQL Database Setup Script for Project Management System
# Run this script to set up the database for production deployment

set -e

# Configuration
DB_NAME="project_management_system"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Project Management System Database Setup ===${NC}"
echo

# Check if PostgreSQL is running
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo -e "${RED}Error: PostgreSQL is not running on $DB_HOST:$DB_PORT${NC}"
    echo "Please start PostgreSQL and try again."
    exit 1
fi

echo -e "${GREEN}✓ PostgreSQL is running${NC}"

# Check if database exists
if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${YELLOW}Warning: Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Dropping existing database...${NC}"
        dropdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
    else
        echo -e "${YELLOW}Skipping database creation...${NC}"
        exit 0
    fi
fi

# Create database
echo -e "${GREEN}Creating database '$DB_NAME'...${NC}"
createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME

# Run schema script
echo -e "${GREEN}Creating database schema...${NC}"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f postgresql_schema.sql

# Ask if user wants to load test data
read -p "Do you want to load test data? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${GREEN}Loading test data...${NC}"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f postgresql_test_data.sql
    echo -e "${GREEN}✓ Test data loaded successfully${NC}"
fi

echo
echo -e "${GREEN}=== Database Setup Complete ===${NC}"
echo -e "Database: ${YELLOW}$DB_NAME${NC}"
echo -e "Host: ${YELLOW}$DB_HOST:$DB_PORT${NC}"
echo -e "User: ${YELLOW}$DB_USER${NC}"
echo
echo -e "${GREEN}Connection string for application:${NC}"
echo -e "${YELLOW}jdbc:postgresql://$DB_HOST:$DB_PORT/$DB_NAME${NC}"
echo
echo -e "${GREEN}To connect manually:${NC}"
echo -e "${YELLOW}psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME${NC}"
echo
