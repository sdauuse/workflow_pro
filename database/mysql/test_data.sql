-- MySQL Test Data for Project Management System
-- This file contains sample data compatible with MySQL syntax

-- Additional test data for teams and team members

-- Add more teams
INSERT INTO teams (name, description) VALUES 
('Frontend Development', 'React and UI/UX development team'),
('Backend Development', 'API and microservices development team'),
('DevOps & Infrastructure', 'CI/CD, deployment and infrastructure management team'),
('Quality Assurance', 'Testing and quality assurance team'),
('Product Management', 'Product strategy and requirements team'),
('Security Team', 'Application and infrastructure security team');

-- Add more team members with specific roles
INSERT INTO team_members (name, email, role, team_id, is_lead) VALUES 
-- Frontend Development Team (id=4)
('Alice Johnson', 'alice.johnson@company.com', 'Senior React Developer', 4, TRUE),
('Bob Wilson', 'bob.wilson@company.com', 'UI/UX Designer', 4, FALSE),
('Carol Brown', 'carol.brown@company.com', 'Junior Frontend Developer', 4, FALSE),

-- Backend Development Team (id=5)
('David Chen', 'david.chen@company.com', 'Senior Backend Developer', 5, TRUE),
('Eva Martinez', 'eva.martinez@company.com', 'API Developer', 5, FALSE),
('Frank Kim', 'frank.kim@company.com', 'Database Architect', 5, FALSE),

-- DevOps & Infrastructure Team (id=6)
('Grace Lee', 'grace.lee@company.com', 'DevOps Engineer', 6, TRUE),
('Henry Park', 'henry.park@company.com', 'Cloud Architect', 6, FALSE),
('Iris Wang', 'iris.wang@company.com', 'Infrastructure Engineer', 6, FALSE),

-- Quality Assurance Team (id=7)
('Jack Thompson', 'jack.thompson@company.com', 'QA Lead', 7, TRUE),
('Kate Roberts', 'kate.roberts@company.com', 'Test Automation Engineer', 7, FALSE),
('Luke Davis', 'luke.davis@company.com', 'Manual Tester', 7, FALSE),

-- Product Management Team (id=8)
('Maria Garcia', 'maria.garcia@company.com', 'Product Manager', 8, TRUE),
('Nathan Miller', 'nathan.miller@company.com', 'Business Analyst', 8, FALSE),
('Olivia Taylor', 'olivia.taylor@company.com', 'Product Owner', 8, FALSE),

-- Security Team (id=9)
('Paul Anderson', 'paul.anderson@company.com', 'Security Lead', 9, TRUE),
('Quinn Wilson', 'quinn.wilson@company.com', 'Security Analyst', 9, FALSE),
('Rachel Moore', 'rachel.moore@company.com', 'Penetration Tester', 9, FALSE);

-- Extended project data with more realistic scenarios
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
('E-Commerce Platform Upgrade', 'DA-2025-005', 4, 13, 'GREEN', 'UI Mockups Completion', '2025-09-15', 
 'E-commerce platform modernization proceeding smoothly', 'Legacy system integration complexity', FALSE, 
 '2025-08-30', 'Q4 2025', 'Backend API readiness', 'Design specifications', 
 'https://jira.company.com/projects/ECPU', 28.5),

('Mobile Banking Security Enhancement', 'DA-2025-006', 9, 22, 'AMBER', 'Security Audit', '2025-09-30', 
 'Security enhancement project with moderate complexity', 'Compliance requirements evolving', FALSE,
 '2025-08-28', 'Q1 2026', 'Regulatory approval', 'Security standards documentation',
 'https://jira.company.com/projects/MBSE', 15.0),

('Cloud Migration Phase 2', 'DA-2025-007', 6, 16, 'GREEN', 'Infrastructure Setup', '2025-10-05',
 'Second phase of cloud migration progressing well', 'Minimal risks identified', FALSE,
 '2025-09-01', 'Q4 2025', 'Cloud provider SLA finalization', 'Migration playbooks',
 'https://jira.company.com/projects/CMP2', 35.0),

('Customer Analytics Dashboard', 'DA-2025-008', 5, 14, 'RED', 'Data Pipeline Development', '2025-11-01',
 'Analytics dashboard facing data integration challenges', 'Data quality issues in source systems', TRUE,
 '2025-08-26', 'Q2 2026', 'Data governance approval', 'Analytics requirements',
 'https://jira.company.com/projects/CAD', 22.0),

('Automated Testing Framework', 'DA-2025-009', 7, 19, 'GREEN', 'Framework Architecture', '2025-09-20',
 'Test automation framework development on track', 'Tool selection finalized', FALSE,
 '2025-09-02', 'Q1 2026', 'Development team training', 'Testing strategy document',
 'https://jira.company.com/projects/ATF', 18.5);

-- Enhanced key milestones with more detailed tracking
INSERT INTO key_milestones (project_id, milestone_name, milestone_date, is_completed, description, status, priority, progress, owner, deliverables, dependencies, success_criteria) VALUES 
-- E-Commerce Platform Upgrade milestones
(5, 'Requirements Analysis', '2025-08-15', TRUE, 'Complete business and technical requirements gathering', 'COMPLETED', 'HIGH', 100, 'Maria Garcia', 'Requirements document, User stories', '', 'All stakeholders approve requirements'),
(5, 'UI/UX Design', '2025-09-15', FALSE, 'Create comprehensive UI/UX designs', 'IN_PROGRESS', 'HIGH', 60, 'Bob Wilson', 'Wireframes, UI mockups, Style guide', 'Requirements completion', 'Design approval from product team'),
(5, 'Backend API Development', '2025-11-01', FALSE, 'Develop new backend APIs', 'PENDING', 'CRITICAL', 0, 'David Chen', 'API specifications, Endpoint implementation', 'Design completion', 'All APIs pass integration tests'),

-- Mobile Banking Security Enhancement milestones
(6, 'Security Assessment', '2025-09-01', FALSE, 'Comprehensive security vulnerability assessment', 'IN_PROGRESS', 'CRITICAL', 70, 'Paul Anderson', 'Security audit report, Risk assessment', '', 'Security audit completed with acceptable risk level'),
(6, 'Security Implementation', '2025-11-15', FALSE, 'Implement security enhancements', 'PENDING', 'CRITICAL', 0, 'Quinn Wilson', 'Security patches, Enhanced authentication', 'Security assessment completion', 'All critical vulnerabilities addressed'),

-- Cloud Migration Phase 2 milestones
(7, 'Infrastructure Planning', '2025-08-30', FALSE, 'Plan cloud infrastructure architecture', 'IN_PROGRESS', 'HIGH', 80, 'Grace Lee', 'Infrastructure design, Capacity planning', '', 'Infrastructure plan approved by architecture team'),
(7, 'Migration Execution', '2025-10-15', FALSE, 'Execute migration of remaining services', 'PENDING', 'HIGH', 0, 'Henry Park', 'Migrated services, Performance validation', 'Infrastructure setup', 'All services operational in cloud environment'),

-- Customer Analytics Dashboard milestones  
(8, 'Data Source Integration', '2025-10-01', FALSE, 'Integrate all required data sources', 'IN_PROGRESS', 'CRITICAL', 30, 'Frank Kim', 'Data pipelines, ETL processes', '', 'All data sources connected and validated'),
(8, 'Dashboard Development', '2025-12-01', FALSE, 'Build analytics dashboard interface', 'PENDING', 'HIGH', 0, 'Alice Johnson', 'Dashboard UI, Visualization components', 'Data integration completion', 'Dashboard meets all analytics requirements'),

-- Automated Testing Framework milestones
(9, 'Tool Evaluation', '2025-08-25', TRUE, 'Evaluate and select testing tools', 'COMPLETED', 'MEDIUM', 100, 'Jack Thompson', 'Tool comparison report, Recommendations', '', 'Testing tools selected and approved'),
(9, 'Framework Development', '2025-10-30', FALSE, 'Develop core testing framework', 'IN_PROGRESS', 'HIGH', 25, 'Kate Roberts', 'Test framework code, Documentation', 'Tool selection', 'Framework supports all required test types');

-- Additional risks and issues for new projects
INSERT INTO risks_issues (project_id, title, description, risk_type, severity, mitigation_action, status) VALUES 
(5, 'Legacy System Integration', 'Integration with legacy e-commerce system more complex than expected', 'RISK', 'HIGH', 'Allocate additional integration specialist resources', 'OPEN'),
(5, 'Third-party Payment Gateway', 'Payment gateway API changes may affect integration timeline', 'RISK', 'MEDIUM', 'Maintain communication with payment provider', 'MONITORING'),

(6, 'Regulatory Compliance Changes', 'Banking security regulations may change during development', 'RISK', 'HIGH', 'Regular consultation with compliance team', 'OPEN'),
(6, 'Performance Impact', 'Security enhancements may impact application performance', 'ISSUE', 'MEDIUM', 'Conduct performance testing after each security update', 'IN_PROGRESS'),

(7, 'Cloud Provider Availability', 'Potential cloud service outages during migration', 'RISK', 'MEDIUM', 'Plan migration during low-traffic periods', 'OPEN'),
(7, 'Data Transfer Costs', 'Large data transfer costs not initially budgeted', 'ISSUE', 'LOW', 'Optimize data transfer strategy', 'RESOLVED'),

(8, 'Data Quality Issues', 'Source system data quality lower than expected', 'ISSUE', 'HIGH', 'Implement data cleansing processes', 'IN_PROGRESS'),
(8, 'Stakeholder Alignment', 'Different business units have conflicting analytics requirements', 'RISK', 'HIGH', 'Schedule alignment workshops with all stakeholders', 'OPEN'),

(9, 'Team Training Requirements', 'Development teams need extensive training on new framework', 'RISK', 'MEDIUM', 'Plan comprehensive training program', 'OPEN'),
(9, 'Tool Licensing Costs', 'Testing tool licenses more expensive than budgeted', 'ISSUE', 'LOW', 'Negotiate volume discount with vendor', 'RESOLVED');
