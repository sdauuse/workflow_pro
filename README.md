# Project Management System

A comprehensive project management system built with React frontend, Spring Boot 3 backend, and PostgreSQL database.

## Architecture

- **Frontend**: React with Node.js
- **Backend**: Spring Boot 3 (Java)  
- **Database**: PostgreSQL (Production) / MySQL (Development)
- **Layout**: Left and right panel design

## Project Structure

```
workflow_pro/
├── frontend/          # React application
├── backend/           # Spring Boot 3 application
├── database/          # Database scripts and schema (PostgreSQL/MySQL)
└── docs/             # Documentation
```

## Features

### Core Project Management
- Project tracking with comprehensive metadata
- DA Record tracking
- Team and lead assignment
- Status monitoring (Red, Green, Amber)
- Escalation flags

### Milestone Management
- Near milestone tracking with dates
- Multiple key milestones with completion status
- Next checkpoint dates
- Go-live date tracking

### Risk & Issue Management
- Key issues and risks with descriptions
- Mitigation actions tracking
- Risk severity levels (Low, Medium, High, Critical)
- Risk status tracking (Open, In Progress, Resolved, Closed)

### Executive Reporting
- IT executive summaries
- Progress updates
- Dependency tracking
- Related materials and links
- JIRA integration

### Dashboard & Analytics
- Project health overview
- Status distribution
- Upcoming checkpoints
- Escalated projects tracking

## Prerequisites

Before running the application, ensure you have the following installed:

### Required Software
1. **Node.js 18+** - [Download from nodejs.org](https://nodejs.org/)
2. **Java 21** - [Download OpenJDK](https://openjdk.org/) or [Oracle JDK](https://www.oracle.com/java/technologies/downloads/)
3. **Maven 3.6+** - [Download from maven.apache.org](https://maven.apache.org/download.cgi)
4. **PostgreSQL 13+** (Default for both Development and Production) - [PostgreSQL](https://www.postgresql.org/download/)

### Installation Steps

#### 1. Install Node.js and npm
- Download and install Node.js from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version` and `npm --version`

#### 2. Install Java 21
- Download and install Java 21
- Set JAVA_HOME environment variable
- Verify installation: `java -version`

#### 3. Install Maven
- Download and install Maven 3.6+
- Add Maven bin directory to PATH
- Verify installation: `mvn --version`

#### 4. Install PostgreSQL
- Download and install PostgreSQL 13+
- Set password for postgres user during installation
- Start PostgreSQL service
- **详细安装指南**: 请参考 [docs/POSTGRESQL_SETUP.md](docs/POSTGRESQL_SETUP.md)

## Database Setup

### PostgreSQL Setup (Default for Development and Production)

1. **Run Setup Script (Windows):**
   ```cmd
   cd database
   setup-postgresql.bat
   ```

2. **Run Setup Script (Linux/Mac):**
   ```bash
   cd database
   chmod +x setup-postgresql.sh
   ./setup-postgresql.sh
   ```
   chmod +x setup-postgresql.sh
   ./setup-postgresql.sh
   ```

2. **Run Setup Script (Windows):**
   ```cmd
   cd database
   setup-postgresql.bat
   ```

3. **Manual Setup:**
   ```sql
   CREATE DATABASE project_management_system;
   -- Run postgresql_schema.sql
   \i postgresql_schema.sql
   -- Optionally load test data
   \i postgresql_test_data.sql
   ```

### Alternative Database Options

#### MySQL (如果需要使用MySQL)
使用MySQL配置文件运行：
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

#### H2 (快速测试用内存数据库)
使用H2内存数据库进行快速测试：
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```
访问H2控制台: http://localhost:8080/h2-console

## Configuration

### Default Configuration (PostgreSQL Development)
默认的 `application.properties` 已配置为PostgreSQL:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/project_management_system
spring.datasource.username=postgres
spring.datasource.password=${DB_PASSWORD:postgres}
```

### Production Configuration (PostgreSQL)
生产环境配置文件 `application-prod.properties`:
```properties
# Database configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/project_management_system
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:your_password}
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
```

## Running the Application

### Default Mode (PostgreSQL Development)
1. **Start Backend (Spring Boot)**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Backend will start on http://localhost:8080

2. **Start Frontend (React)**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend will start on http://localhost:3000

### Alternative Database Profiles

#### Using MySQL (如果需要)
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

#### Using H2 (快速测试)
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=h2
```

### Production Mode (PostgreSQL)
1. **Start Backend with Production Profile**
   ```bash
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=prod
   ```

2. **Or build and run JAR**
   ```bash
   cd backend
   mvn clean package
   java -jar -Dspring.profiles.active=prod target/project-management-0.0.1-SNAPSHOT.jar
   ```

3. **Start Frontend (Production Build)**
   ```bash
   cd frontend
   npm run build
   # Serve the build folder with your preferred web server
   ```

### 3. Access the Application
Open your browser and navigate to http://localhost:3000

## API Documentation

### Swagger/OpenAPI Documentation
The backend includes comprehensive API documentation using Swagger/OpenAPI 3. Once the backend server is running, you can access the interactive API documentation at:

**Swagger UI**: http://localhost:8080/swagger-ui.html

The Swagger documentation includes:
- Complete API endpoint descriptions
- Request/response schemas
- Interactive testing interface
- Parameter documentation
- Response codes and examples

### API Endpoints

#### Team Management
- `GET /api/teams` - Get all teams with member information
- `POST /api/teams` - Create new team
- `PUT /api/teams/{id}` - Update team information and member assignments
- `DELETE /api/teams/{id}` - Delete team
- `PUT /api/teams/{id}/members` - Update team member assignments

#### Project Management
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `GET /api/projects/status/{status}` - Get projects by status (RED/AMBER/GREEN)
- `GET /api/projects/escalated` - Get escalated projects
- `GET /api/projects/upcoming-checkpoints?daysAhead=7` - Get projects with upcoming checkpoints
- `GET /api/projects/search?name={searchTerm}` - Search projects by name

### Filtering & Search
- `GET /api/projects/team/{teamId}` - Get projects by team
- `GET /api/projects/lead/{leadId}` - Get projects by lead
- `GET /api/projects/date-range?startDate={date}&endDate={date}` - Get projects in date range

## Database Schema

### Main Tables
- **projects** - Core project information
- **teams** - Team definitions
- **team_members** - Team members and leads
- **key_milestones** - Project milestones with dates
- **risks_issues** - Risk and issue tracking
- **project_dependencies** - Project dependencies

### Key Features
- Comprehensive project tracking
- Status-based filtering (Red/Amber/Green)
- Milestone and checkpoint management
- Risk and dependency tracking
- Team and lead assignment

## Development

### Backend Development
- Uses Spring Boot 3 with Java 21
- JPA/Hibernate for database operations
- REST API with comprehensive endpoints
- CORS configured for frontend integration

### Frontend Development
- React 18 with functional components
- Ant Design UI components
- Axios for API communication
- Responsive design with left/right layout

### Database Design
- MySQL 8.0+ with normalized schema
- Foreign key relationships
- Indexing for performance
- Sample data included

## Troubleshooting

### Common Issues

1. **Node.js/npm not found**
   - Install Node.js from nodejs.org
   - Restart terminal/IDE

2. **Java not found**
   - Install Java 17+ and set JAVA_HOME
   - Add Java to PATH

3. **Maven not found**
   - Install Maven and add to PATH
   - Verify with `mvn --version`

4. **Database connection failed**
   - Ensure MySQL is running
   - Check credentials in application.properties
   - Verify database exists

5. **CORS errors**
   - Ensure backend is running on port 8080
   - Check CORS configuration in CorsConfig.java

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is for internal use only.
