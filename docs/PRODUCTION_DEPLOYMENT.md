# Production Deployment Guide

This guide provides step-by-step instructions for deploying the Project Management System to production with PostgreSQL.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Software Requirements
- **PostgreSQL 13+**
- **Java 21**
- **Node.js 18+**
- **Maven 3.6+**
- **Web Server** (Nginx/Apache for frontend)
- **Process Manager** (systemd/pm2 for backend)

### System Requirements
- **Memory**: 4GB+ RAM
- **Storage**: 10GB+ available space
- **Network**: Open ports 80, 443, 5432 (PostgreSQL)

## Database Setup

### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE project_management_system;
CREATE USER pm_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE project_management_system TO pm_user;
\q
```

### 3. Run Database Scripts
```bash
# Clone repository or upload files
cd /path/to/workflow_pro/database

# Run schema creation
sudo -u postgres psql -d project_management_system -f postgresql_schema.sql

# Optional: Load test data for initial setup
sudo -u postgres psql -d project_management_system -f postgresql_test_data.sql
```

### 4. Configure PostgreSQL for Production
Edit `/etc/postgresql/13/main/postgresql.conf`:
```conf
# Connection settings
listen_addresses = 'localhost'
port = 5432
max_connections = 100

# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Logging
log_statement = 'all'
log_duration = on
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
```

Edit `/etc/postgresql/13/main/pg_hba.conf`:
```conf
# Allow local connections
local   all             all                                     md5
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Backend Deployment

### 1. Prepare Application
```bash
# Clone repository
git clone <your-repository-url>
cd workflow_pro/backend

# Create production properties
cp src/main/resources/application.properties src/main/resources/application-prod.properties
```

### 2. Configure Production Properties
Edit `src/main/resources/application-prod.properties`:
```properties
# Server configuration
server.port=8080
server.servlet.context-path=/api

# Database configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/project_management_system
spring.datasource.username=pm_user
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA configuration
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false

# Connection pool
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.idle-timeout=600000
spring.datasource.hikari.max-lifetime=1800000

# Logging
logging.level.com.company.projectmanagement=INFO
logging.level.root=WARN
logging.file.name=/var/log/pm-system/application.log

# Security
server.ssl.enabled=false
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=when-authorized
```

### 3. Build Application
```bash
# Build the application
mvn clean package -Dmaven.test.skip=true

# Verify the JAR file
ls -la target/project-management-*.jar
```

### 4. Create System Service
Create `/etc/systemd/system/pm-backend.service`:
```ini
[Unit]
Description=Project Management System Backend
After=network.target postgresql.service

[Service]
Type=simple
User=pm-user
Group=pm-user
WorkingDirectory=/opt/pm-system
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod -Xmx2g -Xms1g /opt/pm-system/project-management.jar
Environment=DB_PASSWORD=your_secure_password
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### 5. Deploy and Start Service
```bash
# Create application user
sudo useradd -r -s /bin/false pm-user

# Create directories
sudo mkdir -p /opt/pm-system
sudo mkdir -p /var/log/pm-system

# Copy JAR file
sudo cp target/project-management-*.jar /opt/pm-system/project-management.jar

# Set permissions
sudo chown -R pm-user:pm-user /opt/pm-system
sudo chown -R pm-user:pm-user /var/log/pm-system

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable pm-backend
sudo systemctl start pm-backend

# Check status
sudo systemctl status pm-backend
```

## Frontend Deployment

### 1. Build Frontend
```bash
cd workflow_pro/frontend

# Install dependencies
npm install

# Build for production
npm run build
```

### 2. Configure Nginx
Create `/etc/nginx/sites-available/pm-system`:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend static files
    location / {
        root /var/www/pm-system;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }
    
    # API proxy to backend
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
    }
    
    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root /var/www/pm-system;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Deploy Frontend Files
```bash
# Create web directory
sudo mkdir -p /var/www/pm-system

# Copy build files
sudo cp -r build/* /var/www/pm-system/

# Set permissions
sudo chown -R www-data:www-data /var/www/pm-system

# Enable site
sudo ln -s /etc/nginx/sites-available/pm-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Environment Configuration

### 1. Environment Variables
Create `/etc/environment`:
```bash
# Database
DB_PASSWORD=your_secure_password

# Java
JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64

# Application
PM_LOG_LEVEL=INFO
```

### 2. Firewall Configuration
```bash
# Allow necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS (if SSL configured)

# Block PostgreSQL from external access
sudo ufw deny 5432

# Enable firewall
sudo ufw enable
```

### 3. SSL Configuration (Optional)
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Maintenance

### 1. Log Monitoring
```bash
# Backend logs
sudo journalctl -u pm-backend -f

# Application logs
sudo tail -f /var/log/pm-system/application.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. Health Checks
```bash
# Backend health endpoint
curl http://localhost:8080/actuator/health

# Database connection test
sudo -u postgres psql -d project_management_system -c "SELECT 1;"

# Frontend accessibility
curl -I http://your-domain.com
```

### 3. Backup Strategy
Create backup script `/opt/pm-system/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/pm-system/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_BACKUP="$BACKUP_DIR/db_backup_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
sudo -u postgres pg_dump project_management_system > $DB_BACKUP

# Compress backup
gzip $DB_BACKUP

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete

echo "Backup completed: $DB_BACKUP.gz"
```

Add to crontab:
```bash
sudo crontab -e
# Add: 0 2 * * * /opt/pm-system/backup.sh
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database connectivity
sudo -u postgres psql -c "\l"

# Verify user permissions
sudo -u postgres psql -c "\du"
```

#### 2. Backend Service Won't Start
```bash
# Check service logs
sudo journalctl -u pm-backend -n 50

# Check JAR file permissions
ls -la /opt/pm-system/project-management.jar

# Test JAR manually
sudo -u pm-user java -jar /opt/pm-system/project-management.jar --spring.profiles.active=prod
```

#### 3. Frontend Not Accessible
```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# Check file permissions
ls -la /var/www/pm-system/
```

#### 4. API Calls Failing
```bash
# Check CORS configuration
curl -H "Origin: http://your-domain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://your-domain.com/api/projects

# Verify backend is running
curl http://localhost:8080/actuator/health
```

### Performance Optimization

#### 1. Database Optimization
```sql
-- Update statistics
ANALYZE;

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

#### 2. Backend Optimization
```bash
# Increase JVM heap size in service file
ExecStart=/usr/bin/java -jar -Dspring.profiles.active=prod -Xmx4g -Xms2g /opt/pm-system/project-management.jar
```

#### 3. Frontend Optimization
```nginx
# Enable gzip compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

## Security Checklist

- [ ] Database user has minimal required permissions
- [ ] PostgreSQL is not accessible from external networks
- [ ] SSL/TLS is configured for HTTPS
- [ ] Security headers are set in Nginx
- [ ] Regular security updates are applied
- [ ] Backup files are secured and encrypted
- [ ] Application logs don't contain sensitive information
- [ ] Strong passwords are used for all accounts
- [ ] Firewall is properly configured
- [ ] Regular security audits are performed

## Deployment Checklist

- [ ] PostgreSQL is installed and configured
- [ ] Database schema is created successfully
- [ ] Backend JAR is built and deployed
- [ ] Backend service is running and healthy
- [ ] Frontend is built and deployed to web server
- [ ] Nginx is configured and running
- [ ] SSL certificate is installed (if applicable)
- [ ] Monitoring and logging are configured
- [ ] Backup strategy is implemented
- [ ] Health checks are passing
- [ ] Documentation is updated with production details

---

For additional support, please refer to the project documentation or contact the development team.
