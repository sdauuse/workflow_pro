# Quick Start Guide

## Prerequisites Installation

### 1. Install Node.js (Required for Frontend)
1. Go to https://nodejs.org/
2. Download LTS version (18.x or higher)
3. Run installer and follow instructions
4. Verify: Open terminal and run `node --version`

### 2. Install Java 21 (Required for Backend)
1. Go to https://openjdk.org/ or https://www.oracle.com/java/technologies/downloads/
2. Download Java 21
3. Install and set JAVA_HOME environment variable
4. Verify: Open terminal and run `java -version`

### 3. Install Maven (Required for Backend)
1. Go to https://maven.apache.org/download.cgi
2. Download Maven 3.6+
3. Extract and add bin directory to PATH
4. Verify: Open terminal and run `mvn --version`

### 4. Install MySQL (Required for Database)
1. Go to https://dev.mysql.com/downloads/mysql/
2. Download MySQL 8.0+
3. Install and remember root password
4. Start MySQL service

## Database Setup

1. **Connect to MySQL:**
   ```bash
   mysql -u root -p
   ```

2. **创建数据库:**
   ```sql
   CREATE DATABASE project_management_system;
   -- 使用您现有的root账号，无需创建新用户
   EXIT;
   ```

3. **加载数据库架构:**
   ```bash
   mysql -u root -p project_management_system < database/schema.sql
   # 输入密码: 12356
   ```

4. **后端配置已更新:**
   `backend/src/main/resources/application.properties` 已配置:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=12356
   ```

## Running the Application

### Terminal 1 - Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
Wait for "Started ProjectManagementApplication" message.
Backend will be available at: http://localhost:8080

### Terminal 2 - Frontend (React)
```bash
cd frontend
npm install
npm start
```
Frontend will automatically open at: http://localhost:3000

## Using the Application

1. **Dashboard**: Overview of all projects with status summary
2. **Projects**: 
   - View all projects in a table
   - Filter by status (Red/Amber/Green)
   - Search by project name, team, or lead
   - Create new projects with "New Project" button
   - Edit existing projects by clicking "Edit"
   - Expand rows to see detailed information

3. **Project Form Fields**:
   - **Project Name** (required)
   - **DA Record**: Document reference
   - **Status**: Red/Amber/Green indicator
   - **Near Milestone**: Next upcoming milestone
   - **Executive Summary**: Progress updates
   - **Key Issues & Risks**: Risk management
   - **Dependencies**: Project dependencies
   - **JIRA Link**: Link to project tracking

## Troubleshooting

### Frontend won't start
- Ensure Node.js is installed: `node --version`
- Try: `npm install` in frontend directory

### Backend won't start  
- Ensure Java is installed: `java -version`
- Ensure Maven is installed: `mvn --version`
- Check MySQL is running and credentials are correct

### Database connection issues
- Verify MySQL is running
- Check username/password in `application.properties`
- Ensure database `project_management_system` exists

### Port conflicts
- Backend uses port 8080
- Frontend uses port 3000
- Ensure these ports are available

## Sample Data

The database comes pre-loaded with sample data:
- 1 sample project (SAGE TWD Implementation)
- 3 teams (SAGE Team, Data Analytics, Cloud Infrastructure)
- 4 team members with different roles
- Sample milestones, risks, and dependencies

You can delete or modify this sample data through the application interface.
