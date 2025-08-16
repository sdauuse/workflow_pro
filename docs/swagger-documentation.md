# Swagger API Documentation Setup

## Overview
The project management system now includes comprehensive API documentation using Swagger/OpenAPI 3.0. This provides interactive documentation for all REST endpoints, making it easier for developers to understand and test the APIs.

## What's Been Implemented

### 1. Swagger Configuration
- **File**: `backend/src/main/java/com/company/projectmanagement/config/OpenApiConfig.java`
- **Features**:
  - OpenAPI 3.0 configuration
  - Server information for development environment
  - Contact and API metadata
  - License information

### 2. Dependencies Added
- **File**: `backend/pom.xml`
- **Dependencies**:
  ```xml
  <dependency>
      <groupId>org.springdoc</groupId>
      <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
      <version>2.1.0</version>
  </dependency>
  ```

### 3. Controller Documentation

#### Team Controller (`/api/teams`)
- **Tag**: "Teams" - Team management operations
- **Endpoints Documented**:
  - `GET /api/teams` - Get all teams with member information
  - `POST /api/teams` - Create new team with validation
  - `PUT /api/teams/{id}` - Update team information and member assignments
  - `DELETE /api/teams/{id}` - Delete team
  - `PUT /api/teams/{id}/members` - Update team member assignments

#### Project Controller (`/api/projects`)
- **Tag**: "Projects" - Project management operations
- **Endpoints Documented**:
  - `GET /api/projects` - Get all projects
  - `GET /api/projects/{id}` - Get project by ID

#### Team Member Controller (`/api/team-members`)
- **Tag**: "Team Members" - Team member management operations
- **Endpoints Documented**:
  - `GET /api/team-members` - Get all team members
  - `GET /api/team-members/{id}` - Get team member by ID

## Swagger Annotations Used

### Class Level
- `@Tag(name = "...", description = "...")` - Groups endpoints by functionality
- `@RestController` and `@RequestMapping` - Standard Spring Boot annotations

### Method Level
- `@Operation(summary = "...", description = "...")` - Describes the endpoint
- `@ApiResponses` - Documents possible response codes
- `@ApiResponse` - Individual response documentation
- `@Parameter` - Documents request parameters

### Content Documentation
- `@Content` - Describes response content
- `@Schema` - References model schemas for request/response bodies

## Documentation Features

### Interactive Testing
- Live API testing interface
- Request/response examples
- Parameter validation
- Authentication support (when implemented)

### Comprehensive Documentation
- Detailed endpoint descriptions
- Request parameter documentation
- Response schema definitions
- HTTP status code explanations
- Model definitions

### Response Codes Documented
- **200**: Success responses
- **400**: Bad request (validation errors)
- **404**: Resource not found
- **500**: Internal server errors (when applicable)

## How to Access

### Prerequisites
1. Java 17+ installed and configured
2. Maven installed and in PATH
3. MySQL database running

### Starting the Server
```bash
cd backend
mvn spring-boot:run
```

### Accessing Swagger UI
Once the backend is running, access the documentation at:
- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8080/v3/api-docs

## Benefits

### For Developers
- Clear API contract definitions
- Interactive testing without external tools
- Automatic documentation updates with code changes
- Type safety with model schemas

### For API Consumers
- Self-documenting APIs
- Real-time testing capabilities
- Clear parameter and response documentation
- Examples and use cases

### For Team Collaboration
- Standardized API documentation
- Consistent documentation format
- Version-controlled documentation
- Integration with CI/CD pipelines

## Future Enhancements

### Additional Controllers
- Add documentation for remaining project endpoints
- Document filtering and search endpoints
- Add documentation for milestone and risk management APIs

### Enhanced Documentation
- Add request/response examples
- Include authentication documentation
- Add error handling examples
- Document data validation rules

### Security Documentation
- Add API key/token documentation
- Document CORS policies
- Include rate limiting information

## Example Usage

### Testing Team Creation
1. Navigate to http://localhost:8080/swagger-ui.html
2. Find "Teams" section
3. Click on "POST /api/teams"
4. Click "Try it out"
5. Enter team data in the request body:
   ```json
   {
     "name": "Development Team",
     "description": "Main development team for the project"
   }
   ```
6. Click "Execute" to test the API

### Viewing Response Schemas
- All model definitions are automatically generated
- Click on any schema name to see detailed field descriptions
- View example request/response payloads
- Understand required vs optional fields

## Integration with Frontend

The React frontend can use this documentation to:
- Understand available endpoints
- Test API calls during development
- Validate request/response formats
- Debug integration issues

## Maintenance

### Keeping Documentation Updated
- Swagger annotations are part of the code
- Documentation updates automatically with deployments
- Version information updates with API changes
- No separate documentation maintenance required

### Best Practices
- Always include operation summaries and descriptions
- Document all parameters and their purposes
- Include appropriate response codes
- Use consistent naming conventions
- Keep descriptions clear and concise
