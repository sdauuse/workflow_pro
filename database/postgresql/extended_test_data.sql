-- PostgreSQL Test Data for Project Management System
-- Run this after creating the schema

-- Insert test teams
INSERT INTO teams (name, description) VALUES 
('Frontend Development Team', 'Team responsible for frontend development and UI/UX'),
('Backend Development Team', 'Team handling backend services and APIs'),
('DevOps Team', 'Team managing infrastructure and deployment'),
('QA Team', 'Quality assurance and testing team'),
('Product Team', 'Product management and strategy team')
ON CONFLICT (name) DO NOTHING;

-- Insert test team members
INSERT INTO team_members (name, email, role, team_id) VALUES 
-- Frontend Team
('John Smith', 'john.smith@company.com', 'Senior Frontend Developer', 1),
('Sarah Johnson', 'sarah.johnson@company.com', 'UI/UX Designer', 1),
('Mike Chen', 'mike.chen@company.com', 'Frontend Developer', 1),

-- Backend Team
('David Brown', 'david.brown@company.com', 'Senior Backend Developer', 2),
('Lisa Wang', 'lisa.wang@company.com', 'Backend Developer', 2),
('Alex Rodriguez', 'alex.rodriguez@company.com', 'Database Specialist', 2),

-- DevOps Team
('Emily Davis', 'emily.davis@company.com', 'DevOps Engineer', 3),
('Tom Wilson', 'tom.wilson@company.com', 'Cloud Architect', 3),

-- QA Team
('Jennifer Lee', 'jennifer.lee@company.com', 'QA Lead', 4),
('Mark Taylor', 'mark.taylor@company.com', 'Test Automation Engineer', 4),

-- Product Team
('Rachel Green', 'rachel.green@company.com', 'Product Manager', 5),
('Steve Jobs', 'steve.jobs@company.com', 'Technical Product Manager', 5)
ON CONFLICT (email) DO NOTHING;

-- Insert test projects
INSERT INTO projects (
    project_name, da_record, team_id, lead_id, it_project_status, 
    near_milestone, near_milestone_date, it_executive_summary, 
    key_issue_and_risk, escalation, next_check_date, go_live_date,
    dependency, related_materials, project_jira_link, estimation
) VALUES 
(
    'E-commerce Platform Modernization',
    'DA-2024-001',
    1, 1, 'GREEN',
    'Beta Release',
    '2024-09-15',
    'Project to modernize the existing e-commerce platform with React and microservices architecture. Progress is on track with all major milestones being met.',
    'Minor performance issues in payment processing module. Risk of third-party API changes affecting integration.',
    false,
    '2024-08-20',
    '2024-10-01',
    'Payment gateway API integration, CDN setup',
    'https://confluence.company.com/display/ECP/Technical+Specifications',
    'https://jira.company.com/projects/ECP',
    24.5
),
(
    'Customer Data Migration',
    'DA-2024-002',
    2, 4, 'AMBER',
    'Data Validation Complete',
    '2024-08-25',
    'Migration of customer data from legacy system to new PostgreSQL database. Some challenges with data quality and validation.',
    'Data quality issues in legacy system. Timeline pressure due to regulatory requirements.',
    false,
    '2024-08-18',
    '2024-09-30',
    'Legacy system access, data validation tools',
    'https://confluence.company.com/display/CDM/Migration+Plan',
    'https://jira.company.com/projects/CDM',
    18.0
),
(
    'Mobile App Development',
    'DA-2024-003',
    1, 2, 'RED',
    'MVP Release',
    '2024-08-30',
    'Development of mobile application for iOS and Android. Project is behind schedule due to technical challenges.',
    'React Native performance issues on older devices. Key developer resigned. Integration with backend APIs delayed.',
    true,
    '2024-08-17',
    '2024-11-15',
    'Backend API completion, app store approval process',
    'https://confluence.company.com/display/MAD/Requirements',
    'https://jira.company.com/projects/MAD',
    32.0
),
(
    'DevOps Infrastructure Upgrade',
    'DA-2024-004',
    3, 7, 'GREEN',
    'Kubernetes Migration',
    '2024-09-10',
    'Upgrading infrastructure to Kubernetes and implementing CI/CD pipelines. All components are progressing well.',
    'Learning curve for team on Kubernetes. Potential downtime during migration.',
    false,
    '2024-08-22',
    '2024-10-15',
    'Security approval, network configuration',
    'https://confluence.company.com/display/DEVOPS/Infrastructure',
    'https://jira.company.com/projects/DEVOPS',
    15.5
),
(
    'AI Analytics Dashboard',
    'DA-2024-005',
    5, 11, 'AMBER',
    'ML Model Training',
    '2024-09-05',
    'Development of AI-powered analytics dashboard for business intelligence. Model training is in progress.',
    'Data quality concerns affecting ML model accuracy. Need more training data.',
    false,
    '2024-08-19',
    '2024-12-01',
    'Data warehouse completion, ML infrastructure',
    'https://confluence.company.com/display/AI/Dashboard+Specs',
    'https://jira.company.com/projects/AI',
    28.5
)
ON CONFLICT (da_record) DO NOTHING;

-- Insert test project phases
INSERT INTO project_phases (
    project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date,
    status, progress_percentage, is_completed, is_overdue, description
) VALUES 
-- E-commerce Platform Modernization phases
(1, 'ESTIMATED', '2024-01-01', '2024-01-31', '2024-01-01', '2024-01-31', 'COMPLETED', 100.00, true, false, 'Requirements analysis and estimation phase'),
(1, 'PLANNING', '2024-02-01', '2024-02-29', '2024-02-01', '2024-02-29', 'COMPLETED', 100.00, true, false, 'Detailed planning and architecture design'),
(1, 'DEVELOPMENT', '2024-03-01', '2024-07-31', '2024-03-01', '2024-07-31', 'COMPLETED', 100.00, true, false, 'Core development phase'),
(1, 'SIT', '2024-08-01', '2024-08-31', '2024-08-01', '2024-08-31', 'IN_PROGRESS', 75.00, false, false, 'System integration testing'),
(1, 'UAT', '2024-09-01', '2024-09-30', '2024-09-01', '2024-09-30', 'NOT_STARTED', 0.00, false, false, 'User acceptance testing'),
(1, 'PPE', '2024-10-01', '2024-10-15', '2024-10-01', '2024-10-15', 'NOT_STARTED', 0.00, false, false, 'Pre-production environment testing'),
(1, 'LIVE', '2024-10-16', '2024-10-31', '2024-10-16', '2024-10-31', 'NOT_STARTED', 0.00, false, false, 'Production deployment and go-live'),

-- Customer Data Migration phases
(2, 'ESTIMATED', '2024-01-15', '2024-02-15', '2024-01-15', '2024-02-15', 'COMPLETED', 100.00, true, false, 'Data analysis and migration estimation'),
(2, 'PLANNING', '2024-02-16', '2024-03-15', '2024-02-16', '2024-03-15', 'COMPLETED', 100.00, true, false, 'Migration strategy and tooling selection'),
(2, 'DEVELOPMENT', '2024-03-16', '2024-06-30', '2024-03-16', '2024-06-30', 'COMPLETED', 100.00, true, false, 'Migration scripts and validation tools development'),
(2, 'SIT', '2024-07-01', '2024-08-15', '2024-07-01', '2024-08-15', 'IN_PROGRESS', 80.00, false, false, 'System integration and data validation testing'),
(2, 'UAT', '2024-08-16', '2024-09-15', '2024-08-16', '2024-09-15', 'NOT_STARTED', 0.00, false, false, 'User acceptance testing with sample data'),
(2, 'LIVE', '2024-09-16', '2024-09-30', '2024-09-16', '2024-09-30', 'NOT_STARTED', 0.00, false, false, 'Production data migration');

-- Insert test key milestones
INSERT INTO key_milestones (
    project_id, milestone_name, description, milestone_date, actual_date,
    status, priority, progress, owner, deliverables, dependencies, success_criteria
) VALUES 
-- E-commerce Platform milestones
(1, 'Technical Architecture Approval', 'Architecture design review and approval', '2024-02-15', '2024-02-14', 'COMPLETED', 'HIGH', 100, 'John Smith', 'Architecture document, API specifications', 'Requirements sign-off', 'Architecture approved by technical committee'),
(1, 'MVP Development Complete', 'Minimum viable product with core features', '2024-06-30', '2024-06-28', 'COMPLETED', 'CRITICAL', 100, 'John Smith', 'Working MVP, unit tests, API documentation', 'UI/UX designs approved', 'All core features implemented and tested'),
(1, 'Beta Release', 'Beta version ready for limited user testing', '2024-09-15', NULL, 'IN_PROGRESS', 'HIGH', 75, 'John Smith', 'Beta application, user testing plan', 'SIT completion', 'Application deployed to staging environment'),
(1, 'Performance Optimization', 'System performance meets requirements', '2024-10-01', NULL, 'PENDING', 'MEDIUM', 0, 'Mike Chen', 'Performance test results, optimization report', 'Beta feedback incorporation', 'Page load time under 2 seconds'),
(1, 'Go Live', 'Production deployment and system launch', '2024-10-31', NULL, 'PENDING', 'CRITICAL', 0, 'John Smith', 'Production deployment, monitoring setup', 'UAT sign-off', 'System live with zero critical issues'),

-- Customer Data Migration milestones
(2, 'Data Quality Assessment', 'Complete analysis of legacy data quality', '2024-03-01', '2024-02-28', 'COMPLETED', 'HIGH', 100, 'David Brown', 'Data quality report, cleansing strategy', 'Legacy system access', 'Data quality issues identified and documented'),
(2, 'Migration Tools Ready', 'All migration and validation tools completed', '2024-06-15', '2024-06-20', 'COMPLETED', 'HIGH', 100, 'Lisa Wang', 'Migration scripts, validation tools, rollback procedures', 'Data mapping complete', 'Tools tested with sample data'),
(2, 'Pilot Migration Success', 'Successful migration of pilot dataset', '2024-08-01', NULL, 'IN_PROGRESS', 'CRITICAL', 60, 'David Brown', 'Pilot data migrated, validation report', 'Migration tools ready', 'Pilot data passes all validation checks'),
(2, 'Full Migration Complete', 'All customer data successfully migrated', '2024-09-30', NULL, 'PENDING', 'CRITICAL', 0, 'David Brown', 'Complete migrated dataset, validation report', 'Pilot migration approval', 'All data migrated with 99.9% accuracy'),

-- Mobile App Development milestones
(3, 'Cross-Platform Framework Selection', 'Technology stack decision for mobile app', '2024-02-01', '2024-02-05', 'COMPLETED', 'HIGH', 100, 'Sarah Johnson', 'Technology comparison report, framework selection', 'Requirements analysis', 'Framework selected and approved'),
(3, 'UI/UX Design Complete', 'Complete mobile app design and prototypes', '2024-04-15', '2024-04-20', 'COMPLETED', 'HIGH', 100, 'Sarah Johnson', 'UI mockups, interactive prototypes, design system', 'User research completion', 'Designs approved by stakeholders'),
(3, 'MVP Development', 'Core mobile app functionality implemented', '2024-08-30', NULL, 'DELAYED', 'CRITICAL', 40, 'Mike Chen', 'Working mobile app, core features', 'Backend API availability', 'App runs on both iOS and Android'),
(3, 'App Store Submission', 'App submitted to Apple App Store and Google Play', '2024-10-15', NULL, 'PENDING', 'HIGH', 0, 'Sarah Johnson', 'App store packages, metadata, screenshots', 'MVP completion, testing sign-off', 'App successfully submitted to stores'),

-- DevOps Infrastructure milestones
(4, 'Kubernetes Cluster Setup', 'Production-ready Kubernetes cluster', '2024-07-31', '2024-07-28', 'COMPLETED', 'HIGH', 100, 'Emily Davis', 'Kubernetes cluster, monitoring setup', 'Security approval', 'Cluster passes all security and performance tests'),
(4, 'CI/CD Pipeline Implementation', 'Automated deployment pipelines', '2024-09-10', NULL, 'IN_PROGRESS', 'HIGH', 70, 'Tom Wilson', 'CI/CD pipelines, deployment automation', 'Kubernetes cluster ready', 'Automated deployments working for all environments'),
(4, 'Legacy System Migration', 'All services migrated to new infrastructure', '2024-10-15', NULL, 'PENDING', 'CRITICAL', 0, 'Emily Davis', 'Migrated services, performance reports', 'CI/CD pipeline ready', 'All services running with improved performance'),

-- AI Analytics Dashboard milestones
(5, 'Data Pipeline Setup', 'Data ingestion and processing pipeline', '2024-06-30', '2024-07-05', 'COMPLETED', 'HIGH', 100, 'Rachel Green', 'Data pipeline, ETL processes', 'Data warehouse completion', 'Data flowing correctly with real-time updates'),
(5, 'ML Model Training', 'Initial machine learning models trained', '2024-09-05', NULL, 'IN_PROGRESS', 'CRITICAL', 65, 'Steve Jobs', 'Trained models, accuracy reports', 'Training data availability', 'Models achieve 85% accuracy on test data'),
(5, 'Dashboard Beta Version', 'Interactive dashboard with basic analytics', '2024-10-31', NULL, 'PENDING', 'HIGH', 0, 'Rachel Green', 'Working dashboard, user documentation', 'ML models ready', 'Dashboard displays real-time insights'),
(5, 'Production Deployment', 'Full system deployed and operational', '2024-12-01', NULL, 'PENDING', 'CRITICAL', 0, 'Rachel Green', 'Production system, user training materials', 'Beta testing completion', 'System handling production load successfully');

-- Update sequences to avoid conflicts
SELECT setval('teams_id_seq', (SELECT MAX(id) FROM teams));
SELECT setval('team_members_id_seq', (SELECT MAX(id) FROM team_members));
SELECT setval('projects_id_seq', (SELECT MAX(id) FROM projects));
SELECT setval('project_phases_id_seq', (SELECT MAX(id) FROM project_phases));
SELECT setval('key_milestones_id_seq', (SELECT MAX(id) FROM key_milestones));
