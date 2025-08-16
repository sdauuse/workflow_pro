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
    project_jira_link
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
    'https://jira.company.com/projects/PORTAL'
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
    'https://jira.company.com/projects/APIGW'
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
    'https://jira.company.com/projects/DATALAKE'
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
    'https://jira.company.com/projects/MOBILE'
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
    'https://jira.company.com/projects/DEVOPS'
);

-- Add milestones for new projects
INSERT INTO key_milestones (project_id, milestone_name, milestone_date, is_completed, description) VALUES 
-- Customer Portal Redesign (project_id = 2)
(2, 'Wireframe Completion', '2025-07-15', TRUE, 'All wireframes and mockups completed'),
(2, 'Component Library Setup', '2025-08-01', TRUE, 'Reusable component library established'),
(2, 'User Testing Phase 1', '2025-09-30', FALSE, 'Initial user testing and feedback collection'),

-- API Gateway Implementation (project_id = 3)
(3, 'Architecture Design Review', '2025-06-30', TRUE, 'Technical architecture approved'),
(3, 'Core Gateway Features', '2025-08-15', FALSE, 'Basic routing and authentication features'),
(3, 'Performance Optimization', '2025-09-15', FALSE, 'Load testing and performance tuning'),

-- Data Lake Migration (project_id = 4)
(4, 'Infrastructure Setup', '2025-07-01', TRUE, 'Cloud infrastructure provisioned'),
(4, 'ETL Pipeline Development', '2025-08-15', FALSE, 'Data extraction and transformation pipelines'),
(4, 'Data Validation', '2025-09-30', FALSE, 'Comprehensive data integrity validation'),

-- Mobile App Development (project_id = 5)
(5, 'MVP Features Complete', '2025-09-01', FALSE, 'Core app functionality implemented'),
(5, 'Internal Testing', '2025-10-01', FALSE, 'Internal QA testing phase'),
(5, 'App Store Submission', '2025-11-15', FALSE, 'Submit to iOS and Android app stores'),

-- DevOps Pipeline Automation (project_id = 6)
(6, 'CI Pipeline Setup', '2025-07-20', TRUE, 'Continuous integration pipeline configured'),
(6, 'Automated Testing Integration', '2025-08-10', FALSE, 'Automated test suites integrated'),
(6, 'Production Deployment Automation', '2025-09-05', FALSE, 'Automated production deployment process');
