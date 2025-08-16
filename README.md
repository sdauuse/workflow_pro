# Project Management System

A comprehensive project management system built with React frontend, Spring Boot 3 backend, and MySQL database.

## Architecture

- **Frontend**: React with Node.js
- **Backend**: Spring Boot 3 (Java)
- **Database**: MySQL
- **Layout**: Left and right panel design

## Project Structure

```
workflow_pro/
├── frontend/          # React application
├── backend/           # Spring Boot 3 application
├── database/          # MySQL scripts and schema
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
4. **MySQL 8.0+** - [Download from mysql.com](https://dev.mysql.com/downloads/mysql/)

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

#### 4. Install MySQL
- Download and install MySQL 8.0+
- Create a database user and note credentials
- Start MySQL service

## Database Setup

1. **Create Database and User**
   ```sql
   CREATE DATABASE project_management_system;
   -- 使用您现有的root账号，密码为12356
   ```

2. **Run Database Schema**
   ```bash
   mysql -u root -p project_management_system < database/schema.sql
   # 输入密码: 12356
   ```

3. **Backend Configuration**
   配置已更新为使用您的数据库凭据:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=12356
   ```

## Running the Application

### 1. Start Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
Backend will start on http://localhost:8080

### 2. Start Frontend (React)
```bash
cd frontend
npm install
npm start
```
Frontend will start on http://localhost:3000

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
