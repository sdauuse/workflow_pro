-- MySQL Gantt Chart Test Data
-- Additional sample data for testing the new Gantt chart implementation
-- This script adds more realistic project phase data for demonstration

-- Additional sample projects for MySQL
INSERT INTO projects (
    project_name, 
    it_project_status,
    estimation,
    da_record,
    lead_id,
    team_id,
    near_milestone,
    near_milestone_date,
    next_check_date,
    go_live_date,
    escalation,
    it_executive_summary,
    key_issue_and_risk,
    dependency,
    project_jira_link,
    related_materials
) VALUES 
('Customer Portal Redesign', 'AMBER', 18.5, 'DA-2025-002', 2, 2, 'Security Testing', '2025-08-25', '2025-08-20', '2025-11-15', FALSE, 
 'Customer portal redesign progressing with some security concerns', 'Security compliance requirements may cause delays', 'Security audit completion', 
 'https://jira.company.com/projects/CPR', 'UI/UX designs, Security requirements'),

('API Gateway Implementation', 'GREEN', 12.0, 'DA-2025-003', 3, 3, 'API Development', '2025-09-10', '2025-08-28', '2025-10-30', FALSE,
 'API Gateway implementation on track', 'No significant issues identified', 'Cloud infrastructure setup', 
 'https://jira.company.com/projects/AGI', 'API specifications, Architecture diagrams'),

('Data Warehouse Migration', 'RED', 45.0, 'DA-2025-004', 4, 2, 'Data Migration', '2025-12-01', '2025-08-26', '2026-03-15', TRUE,
 'Data warehouse migration facing significant challenges', 'Legacy system integration complexity higher than expected', 'Legacy system documentation',
 'https://jira.company.com/projects/DWM', 'Migration strategy, Risk assessment');

-- Enhanced project phases with more realistic timelines and dependencies
-- Remove existing phases for projects 2, 3, 4 if they exist
DELETE FROM project_phases WHERE project_id IN (2, 3, 4);

-- Customer Portal Redesign (project_id = 2) phases
INSERT INTO project_phases (project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date, status, progress_percentage, is_completed, is_overdue) VALUES
(2, 'ESTIMATED', '2025-06-01', '2025-06-15', '2025-06-01', '2025-06-15', 'COMPLETED', 100.00, TRUE, FALSE),
(2, 'PLANNING', '2025-06-16', '2025-07-10', '2025-06-16', '2025-07-05', 'COMPLETED', 100.00, TRUE, TRUE),
(2, 'DEVELOPMENT', '2025-07-11', '2025-08-20', '2025-07-06', '2025-08-15', 'IN_PROGRESS', 85.00, FALSE, TRUE),
(2, 'SIT', NULL, NULL, '2025-08-16', '2025-09-10', 'NOT_STARTED', 0.00, FALSE, FALSE),
(2, 'UAT', NULL, NULL, '2025-09-11', '2025-10-05', 'NOT_STARTED', 0.00, FALSE, FALSE),
(2, 'LIVE', NULL, NULL, '2025-10-06', '2025-11-15', 'NOT_STARTED', 0.00, FALSE, FALSE);

-- API Gateway Implementation (project_id = 3) phases
INSERT INTO project_phases (project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date, status, progress_percentage, is_completed, is_overdue) VALUES
(3, 'ESTIMATED', '2025-07-01', '2025-07-10', '2025-07-01', '2025-07-10', 'COMPLETED', 100.00, TRUE, FALSE),
(3, 'PLANNING', '2025-07-11', '2025-07-25', '2025-07-11', '2025-07-25', 'COMPLETED', 100.00, TRUE, FALSE),
(3, 'DEVELOPMENT', '2025-07-26', NULL, '2025-07-26', '2025-09-10', 'IN_PROGRESS', 60.00, FALSE, FALSE),
(3, 'SIT', NULL, NULL, '2025-09-11', '2025-09-25', 'NOT_STARTED', 0.00, FALSE, FALSE),
(3, 'UAT', NULL, NULL, '2025-09-26', '2025-10-10', 'NOT_STARTED', 0.00, FALSE, FALSE),
(3, 'LIVE', NULL, NULL, '2025-10-11', '2025-10-30', 'NOT_STARTED', 0.00, FALSE, FALSE);

-- Data Warehouse Migration (project_id = 4) phases
INSERT INTO project_phases (project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date, status, progress_percentage, is_completed, is_overdue) VALUES
(4, 'ESTIMATED', '2025-05-01', '2025-05-30', '2025-05-01', '2025-05-20', 'COMPLETED', 100.00, TRUE, TRUE),
(4, 'PLANNING', '2025-06-01', '2025-07-15', '2025-05-21', '2025-06-30', 'COMPLETED', 100.00, TRUE, TRUE),
(4, 'DEVELOPMENT', '2025-07-16', NULL, '2025-07-01', '2025-11-30', 'IN_PROGRESS', 35.00, FALSE, TRUE),
(4, 'SIT', NULL, NULL, '2025-12-01', '2026-01-15', 'NOT_STARTED', 0.00, FALSE, FALSE),
(4, 'UAT', NULL, NULL, '2026-01-16', '2026-02-15', 'NOT_STARTED', 0.00, FALSE, FALSE),
(4, 'LIVE', NULL, NULL, '2026-02-16', '2026-03-15', 'NOT_STARTED', 0.00, FALSE, FALSE);

-- Update the original SAGE project phases with more realistic data
UPDATE project_phases SET 
    start_date = '2025-08-01',
    progress_percentage = 80.00,
    status = 'IN_PROGRESS'
WHERE project_id = 1 AND phase_name = 'DEVELOPMENT';

UPDATE project_phases SET 
    planned_start_date = '2025-09-16',
    planned_end_date = '2025-10-15'
WHERE project_id = 1 AND phase_name = 'SIT';

UPDATE project_phases SET 
    planned_start_date = '2025-10-16',
    planned_end_date = '2025-11-15'
WHERE project_id = 1 AND phase_name = 'UAT';

UPDATE project_phases SET 
    planned_start_date = '2025-11-16',
    planned_end_date = '2025-12-01'
WHERE project_id = 1 AND phase_name = 'LIVE';
