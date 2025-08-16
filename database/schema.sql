-- Project Management System Database Schema
-- MySQL 8.0+

CREATE DATABASE IF NOT EXISTS project_management_system;
USE project_management_system;

-- Teams table
CREATE TABLE teams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Team members/leads table
CREATE TABLE team_members (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(100),
    team_id BIGINT,
    is_lead BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Projects table
CREATE TABLE projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    da_record VARCHAR(255),
    team_id BIGINT,
    lead_id BIGINT,
    it_project_status ENUM('RED', 'GREEN', 'AMBER') DEFAULT 'GREEN',
    near_milestone TEXT,
    near_milestone_date DATE,
    it_executive_summary TEXT,
    key_issue_and_risk TEXT,
    escalation BOOLEAN DEFAULT FALSE,
    next_check_date DATE,
    go_live_date VARCHAR(100), -- Can be "Q2 2025" or specific date
    dependency TEXT,
    related_materials TEXT, -- Web links
    project_jira_link VARCHAR(500),
    estimation DECIMAL(8,2) DEFAULT NULL COMMENT 'Project estimation in headcount/month',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (lead_id) REFERENCES team_members(id) ON DELETE SET NULL,
    INDEX idx_project_status (it_project_status),
    INDEX idx_next_check_date (next_check_date),
    INDEX idx_project_name (project_name)
);

-- Key milestones table
CREATE TABLE key_milestones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    milestone_name VARCHAR(255) NOT NULL,
    milestone_date DATE,
    is_completed BOOLEAN DEFAULT FALSE,
    description TEXT,
    actual_date DATE,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'AT_RISK', 'DELAYED', 'CANCELLED') DEFAULT 'PENDING',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    progress INT DEFAULT 0,
    owner VARCHAR(100),
    deliverables TEXT,
    dependencies TEXT,
    budget DECIMAL(15,2),
    risk_assessment TEXT,
    success_criteria TEXT,
    created_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_milestone (project_id, milestone_date),
    INDEX idx_milestone_status (status),
    INDEX idx_milestone_priority (priority)
);

-- Project phases table for Gantt chart functionality
CREATE TABLE project_phases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    phase_name ENUM('ESTIMATED', 'PLANNING', 'DEVELOPMENT', 'SIT', 'UAT', 'LIVE') NOT NULL,
    start_date DATE,
    end_date DATE,
    planned_start_date DATE,
    planned_end_date DATE,
    status ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'ON_HOLD') DEFAULT 'NOT_STARTED',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_completed BOOLEAN DEFAULT FALSE,
    is_overdue BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE KEY unique_project_phase (project_id, phase_name),
    INDEX idx_project_phase_status (project_id, status),
    INDEX idx_phase_dates (start_date, end_date)
);

-- Risks and issues table
CREATE TABLE risks_issues (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_type ENUM('RISK', 'ISSUE') NOT NULL,
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    mitigation_action TEXT,
    status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
    assigned_to BIGINT,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES team_members(id) ON DELETE SET NULL,
    INDEX idx_project_risk (project_id, status),
    INDEX idx_risk_severity (severity)
);

-- Project dependencies table
CREATE TABLE project_dependencies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    dependency_name VARCHAR(255) NOT NULL,
    dependency_type ENUM('INTERNAL', 'EXTERNAL', 'SYSTEM', 'DATA') DEFAULT 'INTERNAL',
    description TEXT,
    timeline VARCHAR(255),
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED') DEFAULT 'PENDING',
    contact_person VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_project_dependency (project_id, status)
);

-- Insert sample data
INSERT INTO teams (name, description) VALUES 
('SAGE Team', 'SAGE project development team'),
('Data Analytics', 'Data analytics and modeling team'),
('Cloud Infrastructure', 'Cloud adoption and infrastructure team');

INSERT INTO team_members (name, email, role, team_id, is_lead) VALUES 
('John Smith', 'john.smith@company.com', 'Project Manager', 1, TRUE),
('Sarah Johnson', 'sarah.johnson@company.com', 'Tech Lead', 1, FALSE),
('Mike Chen', 'mike.chen@company.com', 'Data Analyst', 2, TRUE),
('Emily Davis', 'emily.davis@company.com', 'Cloud Architect', 3, TRUE);

-- Sample project
INSERT INTO projects (
    project_name, 
    da_record, 
    team_id, 
    lead_id, 
    it_project_status,
    near_milestone,
    near_milestone_date,
    it_executive_summary,
    key_issue_and_risk,
    escalation,
    next_check_date,
    go_live_date,
    dependency,
    related_materials,
    project_jira_link,
    estimation
) VALUES (
    'SAGE TWD Implementation',
    'DA-2025-001',
    1,
    1,
    'AMBER',
    'Pilot SIT completion',
    '2025-07-11',
    'Progress Update - SAGE TWD - Confluence 1.Pilot main scope dev done and SIT started from 23 Jun 2.Pilot scope ADJ feature and query API for cloud adoption dev done target on EOD 30 Jun 3. Cloud adoption without Hybrid for hub sites dev done with carry over task for GCS data transfer service and Data proc service proxy that continue dev during SIT stage',
    'Gaps in Gen2 Data Model - analysis in progress. Opensee solution design (calculator) to be confirmed',
    FALSE,
    '2025-08-20',
    'Q2 2025',
    'SAGE PnL: Provides PnL. Dev cycle is Aug to Sep SAGE MR: Provides PnL maturity date. Go live date: Early Jul SAGE SA: Provides SA sensi and maturity date: Go live date: TBC Update HMS mapping for cloud data split: Timeline TBC LPD for EQ and Re-purposing: Timeline: TBC',
    'https://confluence.company.com/sage-twd',
    'https://jira.company.com/projects/SAGE',
    24.5
);

-- Sample milestones - Updated with enhanced fields to match frontend
INSERT INTO key_milestones (project_id, milestone_name, milestone_date, is_completed, description, status, priority, progress, owner, deliverables, dependencies, success_criteria) VALUES 
(1, 'MVP0 drop 1 closure', '2025-07-18', TRUE, 'First MVP release completed', 'COMPLETED', 'HIGH', 100, 'John Smith', 'MVP release package', '', 'MVP successfully deployed and tested'),
(1, 'Data Model & Calculator Design Decision', '2025-09-30', FALSE, 'Finalize data model and calculator design', 'IN_PROGRESS', 'CRITICAL', 60, 'Mike Chen', 'Data model documentation, Calculator specifications', 'Requirements analysis completion', 'Data model approved by stakeholders'),
(1, 'Project Plan (first cut)', '2025-10-15', FALSE, 'Initial project plan completion', 'PENDING', 'HIGH', 20, 'John Smith', 'Project timeline, Resource allocation plan', 'Data model completion', 'Project plan approved by management');

-- Sample risks
INSERT INTO risks_issues (project_id, title, description, risk_type, severity, mitigation_action, status) VALUES 
(1, 'Gaps in Gen2 Data Model', 'Analysis in progress for data model gaps', 'RISK', 'HIGH', 'Clarify funding gap and adjust supply or adjust plan/scope', 'IN_PROGRESS'),
(1, 'Opensee solution design uncertainty', 'Calculator solution design to be confirmed', 'ISSUE', 'MEDIUM', 'Schedule design review meeting with stakeholders', 'OPEN');

-- Sample dependencies
INSERT INTO project_dependencies (project_id, dependency_name, dependency_type, description, timeline, status) VALUES 
(1, 'SAGE PnL', 'INTERNAL', 'Provides PnL. Dev cycle is Aug to Sep', 'Aug-Sep 2025', 'IN_PROGRESS'),
(1, 'SAGE MR', 'INTERNAL', 'Provides PnL maturity date', 'Early Jul 2025', 'PENDING'),
(1, 'HMS mapping for cloud data split', 'EXTERNAL', 'Update HMS mapping for cloud data split', 'TBC', 'PENDING');

-- Additional test data for teams and team members

-- Add more teams
INSERT INTO teams (name, description) VALUES 
('Frontend Development', 'React and UI/UX development team'),
('Backend Development', 'API and microservices development team'),
('DevOps & Infrastructure', 'CI/CD, deployment and infrastructure management team'),
('Quality Assurance', 'Testing and quality assurance team'),
('Product Management', 'Product strategy and requirements team'),
('Security Team', 'Application and infrastructure security team');

-- Add more team members
INSERT INTO team_members (name, email, role, team_id, is_lead) VALUES 
-- SAGE Team (team_id = 1) - more members
('Lisa Wang', 'lisa.wang@company.com', 'Senior Developer', 1, FALSE),
('Tom Brown', 'tom.brown@company.com', 'Business Analyst', 1, FALSE),
('Alex Chen', 'alex.chen@company.com', 'QA Lead', 1, FALSE),

-- Data Analytics (team_id = 2) - more members  
('Jennifer Liu', 'jennifer.liu@company.com', 'Data Scientist', 2, FALSE),
('David Kim', 'david.kim@company.com', 'ML Engineer', 2, FALSE),
('Rachel Green', 'rachel.green@company.com', 'Data Engineer', 2, FALSE),

-- Cloud Infrastructure (team_id = 3) - more members
('Mark Johnson', 'mark.johnson@company.com', 'DevOps Engineer', 3, FALSE),
('Anna Martinez', 'anna.martinez@company.com', 'Cloud Specialist', 3, FALSE),

-- Frontend Development (team_id = 4)
('Sophie Turner', 'sophie.turner@company.com', 'Frontend Lead', 4, TRUE),
('James Wilson', 'james.wilson@company.com', 'React Developer', 4, FALSE),
('Emma Davis', 'emma.davis@company.com', 'UI/UX Designer', 4, FALSE),

-- Backend Development (team_id = 5)
('Robert Miller', 'robert.miller@company.com', 'Backend Lead', 5, TRUE),
('Maria Garcia', 'maria.garcia@company.com', 'API Developer', 5, FALSE),
('Kevin Zhang', 'kevin.zhang@company.com', 'Database Specialist', 5, FALSE),

-- DevOps & Infrastructure (team_id = 6)
('Chris Anderson', 'chris.anderson@company.com', 'DevOps Lead', 6, TRUE),
('Nicole White', 'nicole.white@company.com', 'Infrastructure Engineer', 6, FALSE),
('Daniel Lee', 'daniel.lee@company.com', 'Site Reliability Engineer', 6, FALSE),

-- Quality Assurance (team_id = 7)
('Amanda Taylor', 'amanda.taylor@company.com', 'QA Manager', 7, TRUE),
('Brian Clark', 'brian.clark@company.com', 'Test Automation Engineer', 7, FALSE),
('Laura Rodriguez', 'laura.rodriguez@company.com', 'Manual Tester', 7, FALSE),

-- Product Management (team_id = 8)
('Michael Thompson', 'michael.thompson@company.com', 'Product Manager', 8, TRUE),
('Jessica Wong', 'jessica.wong@company.com', 'Product Owner', 8, FALSE),
('Steven Liu', 'steven.liu@company.com', 'Business Analyst', 8, FALSE),

-- Security Team (team_id = 9)
('Catherine Smith', 'catherine.smith@company.com', 'Security Lead', 9, TRUE),
('Ryan O\'Connor', 'ryan.oconnor@company.com', 'Security Engineer', 9, FALSE),
('Samantha Lee', 'samantha.lee@company.com', 'Compliance Specialist', 9, FALSE);

-- Add more sample projects
INSERT INTO projects (
    project_name, 
    da_record, 
    team_id, 
    lead_id, 
    it_project_status,
    near_milestone,
    near_milestone_date,
    it_executive_summary,
    key_issue_and_risk,
    escalation,
    next_check_date,
    go_live_date,
    dependency,
    related_materials,
    project_jira_link,
    estimation
) VALUES 
(
    'Customer Portal Redesign',
    'DA-2025-002',
    4,
    11,
    'GREEN',
    'UI/UX Design Review',
    '2025-09-15',
    'Customer portal redesign project is progressing well. New UI components are being developed using React and Ant Design. User testing feedback has been positive.',
    'Minor browser compatibility issues with older versions of Internet Explorer',
    FALSE,
    '2025-08-25',
    'Q4 2025',
    'Authentication service upgrade, Content management system integration',
    'https://confluence.company.com/customer-portal',
    'https://jira.company.com/projects/PORTAL',
    18.0
),
(
    'API Gateway Implementation',
    'DA-2025-003',
    5,
    14,
    'AMBER',
    'Load Testing Phase',
    '2025-08-30',
    'API Gateway implementation using Spring Boot and Kong. Performance testing shows good results but need to optimize for peak load scenarios.',
    'Scalability concerns under high load. Security review pending.',
    TRUE,
    '2025-08-22',
    'Q3 2025',
    'Security team review, Load balancer configuration, Monitoring tools setup',
    'https://confluence.company.com/api-gateway',
    'https://jira.company.com/projects/APIGW',
    32.5
),
(
    'Data Lake Migration',
    'DA-2025-004',
    2,
    3,
    'RED',
    'Data Validation Testing',
    '2025-09-01',
    'Migration of legacy data warehouse to modern data lake architecture. Facing challenges with data consistency and ETL pipeline performance.',
    'Critical data integrity issues discovered during migration. Performance degradation in ETL processes.',
    TRUE,
    '2025-08-18',
    'Q4 2025',
    'Legacy system decommissioning timeline, Data governance policies update',
    'https://confluence.company.com/data-lake',
    'https://jira.company.com/projects/DATALAKE',
    45.0
),
(
    'Mobile App Development',
    'DA-2025-005',
    4,
    12,
    'GREEN',
    'Beta Release',
    '2025-10-15',
    'React Native mobile application development for iOS and Android. Development is on track with good progress on core features.',
    'App store approval process timeline uncertainty',
    FALSE,
    '2025-09-01',
    'Q1 2026',
    'Backend API completion, App store registration, Security audit',
    'https://confluence.company.com/mobile-app',
    'https://jira.company.com/projects/MOBILE',
    28.0
),
(
    'DevOps Pipeline Automation',
    'DA-2025-006',
    6,
    17,
    'AMBER',
    'Production Deployment Pipeline',
    '2025-08-28',
    'Implementing comprehensive CI/CD pipeline with automated testing, security scanning, and deployment. Some integration challenges with legacy systems.',
    'Integration complexity with existing legacy deployment processes',
    FALSE,
    '2025-08-21',
    'Q3 2025',
    'Legacy system integration, Security tool integration, Training completion',
    'https://confluence.company.com/devops-pipeline',
    'https://jira.company.com/projects/DEVOPS',
    15.5
);

-- Add milestones for new projects with enhanced fields
INSERT INTO key_milestones (project_id, milestone_name, milestone_date, is_completed, description, status, priority, progress, owner, deliverables, dependencies, success_criteria) VALUES 
-- Customer Portal Redesign (project_id = 2)
(2, 'Wireframe Completion', '2025-07-15', TRUE, 'All wireframes and mockups completed', 'COMPLETED', 'MEDIUM', 100, 'Emma Davis', 'Wireframes, UI mockups', '', 'All wireframes approved by stakeholders'),
(2, 'Component Library Setup', '2025-08-01', TRUE, 'Reusable component library established', 'COMPLETED', 'HIGH', 100, 'James Wilson', 'Component library, Style guide', 'Wireframe completion', 'Component library documented and tested'),
(2, 'User Testing Phase 1', '2025-09-30', FALSE, 'Initial user testing and feedback collection', 'PENDING', 'HIGH', 0, 'Sophie Turner', 'User test reports, Feedback analysis', 'Component library completion', 'User testing completed with actionable feedback'),

-- API Gateway Implementation (project_id = 3)
(3, 'Architecture Design Review', '2025-06-30', TRUE, 'Technical architecture approved', 'COMPLETED', 'CRITICAL', 100, 'Robert Miller', 'Architecture document, Design review minutes', '', 'Architecture approved by technical committee'),
(3, 'Core Gateway Features', '2025-08-15', FALSE, 'Basic routing and authentication features', 'IN_PROGRESS', 'CRITICAL', 70, 'Maria Garcia', 'Gateway core features, API documentation', 'Architecture completion', 'Core features functional and tested'),
(3, 'Performance Optimization', '2025-09-15', FALSE, 'Load testing and performance tuning', 'PENDING', 'HIGH', 0, 'Kevin Zhang', 'Performance test results, Optimization report', 'Core features completion', 'Performance targets met under load'),

-- Data Lake Migration (project_id = 4)
(4, 'Infrastructure Setup', '2025-07-01', TRUE, 'Cloud infrastructure provisioned', 'COMPLETED', 'HIGH', 100, 'Nicole White', 'Infrastructure setup, Configuration docs', '', 'Infrastructure provisioned and tested'),
(4, 'ETL Pipeline Development', '2025-08-15', FALSE, 'Data extraction and transformation pipelines', 'IN_PROGRESS', 'CRITICAL', 40, 'Jennifer Liu', 'ETL pipelines, Data validation scripts', 'Infrastructure completion', 'ETL pipelines process data correctly'),
(4, 'Data Validation', '2025-09-30', FALSE, 'Comprehensive data integrity validation', 'AT_RISK', 'CRITICAL', 10, 'David Kim', 'Data validation reports, Quality metrics', 'ETL pipeline completion', 'Data integrity validated and documented'),

-- Mobile App Development (project_id = 5)
(5, 'MVP Features Complete', '2025-09-01', FALSE, 'Core app functionality implemented', 'IN_PROGRESS', 'CRITICAL', 80, 'James Wilson', 'Mobile app beta, Feature documentation', '', 'Core features working on both platforms'),
(5, 'Internal Testing', '2025-10-01', FALSE, 'Internal QA testing phase', 'PENDING', 'HIGH', 0, 'Brian Clark', 'Test reports, Bug tracking', 'MVP completion', 'All critical bugs resolved'),
(5, 'App Store Submission', '2025-11-15', FALSE, 'Submit to iOS and Android app stores', 'PENDING', 'HIGH', 0, 'Sophie Turner', 'App store packages, Submission confirmations', 'Internal testing completion', 'Apps approved and published'),

-- DevOps Pipeline Automation (project_id = 6)
(6, 'CI Pipeline Setup', '2025-07-20', TRUE, 'Continuous integration pipeline configured', 'COMPLETED', 'HIGH', 100, 'Chris Anderson', 'CI pipeline configuration, Documentation', '', 'CI pipeline operational and tested'),
(6, 'Automated Testing Integration', '2025-08-10', FALSE, 'Automated test suites integrated', 'IN_PROGRESS', 'HIGH', 65, 'Daniel Lee', 'Test automation scripts, Integration documentation', 'CI pipeline completion', 'Automated tests run successfully in pipeline'),
(6, 'Production Deployment Automation', '2025-09-05', FALSE, 'Automated production deployment process', 'PENDING', 'CRITICAL', 15, 'Chris Anderson', 'Deployment scripts, Production procedures', 'Test automation completion', 'Production deployments fully automated');

-- Sample project phases for Gantt chart functionality
INSERT INTO project_phases (project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date, status, progress_percentage, is_completed, is_overdue) VALUES
-- SAGE TWD Implementation (project_id = 1)
(1, 'ESTIMATED', '2025-06-01', '2025-06-15', '2025-06-01', '2025-06-15', 'COMPLETED', 100.00, TRUE, FALSE),
(1, 'PLANNING', '2025-06-16', '2025-07-15', '2025-06-16', '2025-07-15', 'COMPLETED', 100.00, TRUE, FALSE),
(1, 'DEVELOPMENT', '2025-07-16', NULL, '2025-07-16', '2025-09-15', 'IN_PROGRESS', 75.00, FALSE, FALSE),
(1, 'SIT', NULL, NULL, '2025-09-16', '2025-10-15', 'NOT_STARTED', 0.00, FALSE, FALSE),
(1, 'UAT', NULL, NULL, '2025-10-16', '2025-11-15', 'NOT_STARTED', 0.00, FALSE, FALSE),
(1, 'LIVE', NULL, NULL, '2025-11-16', '2025-12-01', 'NOT_STARTED', 0.00, FALSE, FALSE),

-- Customer Portal Redesign (project_id = 2)
(2, 'ESTIMATED', '2025-06-15', '2025-06-30', '2025-06-15', '2025-06-30', 'COMPLETED', 100.00, TRUE, FALSE),
(2, 'PLANNING', '2025-07-01', '2025-07-20', '2025-07-01', '2025-07-20', 'COMPLETED', 100.00, TRUE, FALSE),
(2, 'DEVELOPMENT', '2025-07-21', '2025-08-20', '2025-07-21', '2025-08-15', 'COMPLETED', 100.00, TRUE, TRUE),
(2, 'SIT', '2025-08-21', NULL, '2025-08-16', '2025-08-25', 'IN_PROGRESS', 60.00, FALSE, FALSE),
(2, 'UAT', NULL, NULL, '2025-08-26', '2025-09-25', 'NOT_STARTED', 0.00, FALSE, FALSE),
(2, 'LIVE', NULL, NULL, '2025-09-26', '2025-10-15', 'NOT_STARTED', 0.00, FALSE, FALSE),

-- API Gateway Implementation (project_id = 3)
(3, 'ESTIMATED', '2025-06-01', '2025-06-15', '2025-06-01', '2025-06-15', 'COMPLETED', 100.00, TRUE, FALSE),
(3, 'PLANNING', '2025-06-16', '2025-07-15', '2025-06-16', '2025-07-10', 'COMPLETED', 100.00, TRUE, TRUE),
(3, 'DEVELOPMENT', '2025-07-16', NULL, '2025-07-11', '2025-08-20', 'IN_PROGRESS', 30.00, FALSE, TRUE),
(3, 'SIT', NULL, NULL, '2025-08-21', '2025-09-20', 'NOT_STARTED', 0.00, FALSE, FALSE),
(3, 'UAT', NULL, NULL, '2025-09-21', '2025-10-20', 'NOT_STARTED', 0.00, FALSE, FALSE),
(3, 'LIVE', NULL, NULL, '2025-10-21', '2025-11-20', 'NOT_STARTED', 0.00, FALSE, FALSE);
