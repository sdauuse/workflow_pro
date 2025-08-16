-- Migration script to update key_milestones table with new fields
-- Run this script to add new columns to the existing key_milestones table

-- Add new columns to key_milestones table
ALTER TABLE key_milestones 
ADD COLUMN target_date DATE,
ADD COLUMN actual_date DATE,
ADD COLUMN status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'AT_RISK', 'DELAYED', 'CANCELLED') DEFAULT 'PENDING',
ADD COLUMN priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
ADD COLUMN progress INT DEFAULT 0,
ADD COLUMN owner VARCHAR(100),
ADD COLUMN deliverables TEXT,
ADD COLUMN dependencies TEXT,
ADD COLUMN budget DECIMAL(15,2),
ADD COLUMN risk_assessment TEXT,
ADD COLUMN success_criteria TEXT,
ADD COLUMN created_date DATE,
ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing records to use new field names and set default values
UPDATE key_milestones SET 
    target_date = milestone_date,
    status = CASE 
        WHEN is_completed = 1 THEN 'COMPLETED' 
        ELSE 'PENDING' 
    END,
    priority = 'MEDIUM',
    progress = CASE 
        WHEN is_completed = 1 THEN 100 
        ELSE 0 
    END,
    created_date = DATE(created_at)
WHERE target_date IS NULL;

-- Rename milestone_name column to name (if needed)
ALTER TABLE key_milestones CHANGE COLUMN milestone_name name VARCHAR(255) NOT NULL;

-- Add constraints and indexes
ALTER TABLE key_milestones 
ADD CONSTRAINT chk_progress CHECK (progress >= 0 AND progress <= 100),
ADD INDEX idx_target_date (target_date),
ADD INDEX idx_status (status),
ADD INDEX idx_priority (priority),
ADD INDEX idx_owner (owner),
ADD INDEX idx_project_target_date (project_id, target_date);

-- Optional: Drop old columns after data migration (uncomment if you want to remove them)
-- ALTER TABLE key_milestones 
-- DROP COLUMN milestone_date,
-- DROP COLUMN is_completed;

-- Insert sample milestone data to demonstrate new features - Updated to 2025
INSERT INTO key_milestones (
    project_id, name, description, target_date, status, priority, progress, 
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

-- Sample data for additional projects if they exist
(2, 'Market Research', 'Comprehensive market analysis', '2025-02-28', 'IN_PROGRESS', 'MEDIUM', 60,
 'Marketing Manager', 'Market research report', '', 7500.00,
 'Low risk - external research firm engaged', 'Research report delivered and reviewed', '2025-01-20', NOW()),

(2, 'Product Prototype', 'Initial product prototype development', '2025-03-31', 'PENDING', 'HIGH', 0,
 'Product Manager', 'Working prototype, Demo materials', 'Market Research', 20000.00,
 'Medium risk - prototype complexity', 'Prototype demonstrates key features', '2025-01-20', NOW());

-- Create a view for milestone dashboard
CREATE OR REPLACE VIEW milestone_dashboard AS
SELECT 
    p.project_name,
    km.name as milestone_name,
    km.target_date,
    km.actual_date,
    km.status,
    km.priority,
    km.progress,
    km.owner,
    km.budget,
    CASE 
        WHEN km.status = 'COMPLETED' THEN 'On Time'
        WHEN km.target_date < CURDATE() AND km.status != 'COMPLETED' THEN 'Overdue'
        WHEN km.target_date <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Due Soon'
        ELSE 'On Track'
    END as timeline_status,
    DATEDIFF(km.target_date, CURDATE()) as days_until_due
FROM key_milestones km
INNER JOIN projects p ON km.project_id = p.id
ORDER BY km.target_date ASC;

-- Create summary statistics view
CREATE OR REPLACE VIEW milestone_statistics AS
SELECT 
    p.id as project_id,
    p.project_name,
    COUNT(km.id) as total_milestones,
    SUM(CASE WHEN km.status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_milestones,
    SUM(CASE WHEN km.target_date < CURDATE() AND km.status != 'COMPLETED' THEN 1 ELSE 0 END) as overdue_milestones,
    SUM(CASE WHEN km.priority IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END) as critical_milestones,
    AVG(km.progress) as avg_progress,
    SUM(km.budget) as total_budget,
    MIN(km.target_date) as earliest_milestone,
    MAX(km.target_date) as latest_milestone
FROM projects p
LEFT JOIN key_milestones km ON p.id = km.project_id
GROUP BY p.id, p.project_name;

-- Add comments to document the table structure
ALTER TABLE key_milestones 
COMMENT = 'Enhanced milestone tracking table with comprehensive project management fields';

-- Add column comments
ALTER TABLE key_milestones 
MODIFY COLUMN name VARCHAR(255) NOT NULL COMMENT 'Milestone name/title',
MODIFY COLUMN description TEXT COMMENT 'Detailed milestone description',
MODIFY COLUMN target_date DATE COMMENT 'Planned completion date',
MODIFY COLUMN actual_date DATE COMMENT 'Actual completion date',
MODIFY COLUMN status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'AT_RISK', 'DELAYED', 'CANCELLED') DEFAULT 'PENDING' COMMENT 'Current milestone status',
MODIFY COLUMN priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM' COMMENT 'Milestone priority level',
MODIFY COLUMN progress INT DEFAULT 0 COMMENT 'Completion percentage (0-100)',
MODIFY COLUMN owner VARCHAR(100) COMMENT 'Person responsible for milestone',
MODIFY COLUMN deliverables TEXT COMMENT 'Expected deliverables for this milestone',
MODIFY COLUMN dependencies TEXT COMMENT 'Dependencies required before milestone completion',
MODIFY COLUMN budget DECIMAL(15,2) COMMENT 'Budget allocated for this milestone',
MODIFY COLUMN risk_assessment TEXT COMMENT 'Risk analysis and mitigation strategies',
MODIFY COLUMN success_criteria TEXT COMMENT 'Criteria to determine milestone success';

COMMIT;
