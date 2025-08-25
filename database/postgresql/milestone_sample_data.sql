-- PostgreSQL Milestone Sample Data
-- This script inserts sample milestone data for testing
-- Run this AFTER test_data.sql to ensure projects exist

-- Insert sample milestone data to demonstrate new features - Updated to 2025
INSERT INTO key_milestones (
    project_id, milestone_name, description, target_date, status, priority, progress, 
    owner, deliverables, dependencies, budget, risk_assessment, success_criteria,
    created_date, created_at
) VALUES 
(1, 'Project Kickoff', 'Official project start with stakeholder meeting', '2025-02-01', 'COMPLETED', 'HIGH', 100, 
 'Project Manager', 'Kickoff presentation, Project charter', '', 5000.00, 'Low risk - standard process', 
 'All stakeholders attend, Project charter approved', '2025-01-15', NOW()),

(1, 'Requirements Gathering', 'Complete functional and technical requirements', '2025-02-15', 'COMPLETED', 'CRITICAL', 100,
 'Business Analyst', 'Requirements document, User stories', 'Project Kickoff', 8000.00, 'Medium risk - scope changes possible',
 'Requirements signed off by stakeholders', '2025-01-15', NOW()),

(1, 'System Design', 'Complete system architecture and design', '2025-03-01', 'IN_PROGRESS', 'HIGH', 75,
 'Solution Architect', 'System design document, Architecture diagrams', 'Requirements Gathering', 12000.00, 
 'Medium risk - technical complexity', 'Design approved by technical committee', '2025-01-15', NOW()),

(1, 'Development Phase 1', 'Core functionality development', '2025-04-15', 'PENDING', 'CRITICAL', 0,
 'Lead Developer', 'Core modules, Database schema', 'System Design', 25000.00, 
 'High risk - new technology stack', 'Core features working as per requirements', '2025-01-15', NOW()),

(1, 'Testing Phase', 'System and user acceptance testing', '2025-05-30', 'PENDING', 'HIGH', 0,
 'QA Manager', 'Test reports, Bug fixes', 'Development Phase 1', 15000.00,
 'Medium risk - timeline dependent on dev completion', 'All critical bugs resolved, UAT passed', '2025-01-15', NOW()),

(1, 'Go Live', 'Production deployment and launch', '2025-06-15', 'PENDING', 'CRITICAL', 0,
 'DevOps Engineer', 'Production system, Training materials', 'Testing Phase', 10000.00,
 'High risk - production deployment', 'System live and stable for 48 hours', '2025-01-15', NOW()),

-- Sample data for additional projects (project_id 2-5 should exist from test_data.sql)
(2, 'Market Research', 'Comprehensive market analysis', '2025-02-28', 'IN_PROGRESS', 'MEDIUM', 60,
 'Marketing Manager', 'Market research report', '', 7500.00,
 'Low risk - external research firm engaged', 'Research report delivered and reviewed', '2025-01-20', NOW()),

(2, 'Product Prototype', 'Initial product prototype development', '2025-03-31', 'PENDING', 'HIGH', 0,
 'Product Manager', 'Working prototype, Demo materials', 'Market Research', 20000.00,
 'Medium risk - prototype complexity', 'Prototype demonstrates key features', '2025-01-20', NOW()),

(3, 'UI/UX Design', 'Mobile app design and user experience', '2025-03-15', 'COMPLETED', 'HIGH', 100,
 'UI/UX Designer', 'Design mockups, User flow diagrams', '', 8000.00,
 'Low risk - design process well established', 'Designs approved by stakeholders', '2025-01-25', NOW()),

(3, 'Beta Testing', 'Mobile app beta testing with users', '2025-05-01', 'PENDING', 'CRITICAL', 0,
 'QA Lead', 'Beta test report, Bug fixes', 'Development completion', 5000.00,
 'Medium risk - user feedback unpredictable', 'Beta version passes all tests', '2025-01-25', NOW()),

(4, 'Infrastructure Setup', 'DevOps infrastructure foundation', '2025-03-01', 'IN_PROGRESS', 'HIGH', 80,
 'DevOps Engineer', 'Infrastructure documentation, Monitoring setup', '', 15000.00,
 'Medium risk - cloud provider dependencies', 'Infrastructure stable and monitored', '2025-01-30', NOW()),

(5, 'Data Pipeline', 'AI data processing pipeline setup', '2025-04-01', 'PENDING', 'CRITICAL', 0,
 'Data Engineer', 'Data pipeline, ETL processes', 'Data analysis completion', 12000.00,
 'High risk - data quality issues', 'Pipeline processes data accurately', '2025-02-01', NOW())
ON CONFLICT DO NOTHING;

-- Update sequences to avoid ID conflicts
SELECT setval('key_milestones_id_seq', (SELECT MAX(id) FROM key_milestones));

COMMIT;
