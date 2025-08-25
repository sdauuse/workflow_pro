-- Migration script for Gantt Chart functionality
-- Execute this script if you have an existing database without project phases and enhanced milestones

-- Check if project_phases table exists, if not create it
CREATE TABLE IF NOT EXISTS project_phases (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    phase_name ENUM('ESTIMATED', 'PLANNING', 'DEVELOPMENT', 'SIT', 'UAT', 'PPE', 'LIVE') NOT NULL,
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

-- Add enhanced fields to key_milestones table if they don't exist
SET @sql = '';
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'key_milestones' 
  AND column_name = 'status';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE key_milestones 
     ADD COLUMN status ENUM(''PENDING'', ''IN_PROGRESS'', ''COMPLETED'', ''AT_RISK'', ''DELAYED'', ''CANCELLED'') DEFAULT ''PENDING'',
     ADD COLUMN priority ENUM(''LOW'', ''MEDIUM'', ''HIGH'', ''CRITICAL'') DEFAULT ''MEDIUM'',
     ADD COLUMN progress INT DEFAULT 0,
     ADD COLUMN owner VARCHAR(100),
     ADD COLUMN deliverables TEXT,
     ADD COLUMN dependencies TEXT,
     ADD COLUMN success_criteria TEXT,
     ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
     ADD INDEX idx_milestone_status (status),
     ADD INDEX idx_milestone_priority (priority);', 
    'SELECT ''Enhanced milestone fields already exist'';');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Update existing milestones with default enhanced field values
UPDATE key_milestones SET 
    status = CASE 
        WHEN is_completed = 1 THEN 'COMPLETED' 
        ELSE 'PENDING' 
    END,
    priority = 'MEDIUM',
    progress = CASE 
        WHEN is_completed = 1 THEN 100 
        ELSE 0 
    END
WHERE status IS NULL OR status = '';

-- Insert sample project phases for existing projects (if not already present)
INSERT IGNORE INTO project_phases (project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date, status, progress_percentage, is_completed, is_overdue, description) 
SELECT 
    p.id as project_id,
    phase_data.phase_name,
    phase_data.start_date,
    phase_data.end_date,
    phase_data.planned_start_date,
    phase_data.planned_end_date,
    phase_data.status,
    phase_data.progress_percentage,
    phase_data.is_completed,
    phase_data.is_overdue,
    CONCAT(p.project_name, ' - ', phase_data.phase_description) as description
FROM projects p
CROSS JOIN (
    SELECT 'ESTIMATED' as phase_name, 
           DATE_SUB(CURDATE(), INTERVAL 60 DAY) as start_date, 
           DATE_SUB(CURDATE(), INTERVAL 45 DAY) as end_date, 
           DATE_SUB(CURDATE(), INTERVAL 60 DAY) as planned_start_date, 
           DATE_SUB(CURDATE(), INTERVAL 45 DAY) as planned_end_date,
           'COMPLETED' as status, 100.00 as progress_percentage, TRUE as is_completed, FALSE as is_overdue,
           'Estimation and planning phase' as phase_description
    UNION ALL
    SELECT 'PLANNING', 
           DATE_SUB(CURDATE(), INTERVAL 44 DAY), 
           DATE_SUB(CURDATE(), INTERVAL 30 DAY), 
           DATE_SUB(CURDATE(), INTERVAL 44 DAY), 
           DATE_SUB(CURDATE(), INTERVAL 30 DAY),
           'COMPLETED', 100.00, TRUE, FALSE,
           'Planning and design phase'
    UNION ALL
    SELECT 'DEVELOPMENT', 
           DATE_SUB(CURDATE(), INTERVAL 29 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 15 DAY),
           DATE_SUB(CURDATE(), INTERVAL 29 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 15 DAY),
           'IN_PROGRESS', 60.00, FALSE, FALSE,
           'Development and implementation phase'
    UNION ALL
    SELECT 'SIT', 
           DATE_ADD(CURDATE(), INTERVAL 16 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 45 DAY),
           DATE_ADD(CURDATE(), INTERVAL 16 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 45 DAY),
           'NOT_STARTED', 0.00, FALSE, FALSE,
           'System Integration Testing phase'
    UNION ALL
    SELECT 'UAT', 
           DATE_ADD(CURDATE(), INTERVAL 46 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 75 DAY),
           DATE_ADD(CURDATE(), INTERVAL 46 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 75 DAY),
           'NOT_STARTED', 0.00, FALSE, FALSE,
           'User Acceptance Testing phase'
    UNION ALL
    SELECT 'PPE', 
           DATE_ADD(CURDATE(), INTERVAL 76 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 90 DAY),
           DATE_ADD(CURDATE(), INTERVAL 76 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 90 DAY),
           'NOT_STARTED', 0.00, FALSE, FALSE,
           'Pre-Production Environment testing phase'
    UNION ALL
    SELECT 'LIVE', 
           DATE_ADD(CURDATE(), INTERVAL 91 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 105 DAY),
           DATE_ADD(CURDATE(), INTERVAL 91 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 105 DAY),
           'NOT_STARTED', 0.00, FALSE, FALSE,
           'Production deployment and go-live phase'
) phase_data
WHERE NOT EXISTS (
    SELECT 1 FROM project_phases pp 
    WHERE pp.project_id = p.id AND pp.phase_name = phase_data.phase_name
);

-- Create views for Gantt chart statistics
CREATE OR REPLACE VIEW project_gantt_stats AS
SELECT 
    COUNT(*) as total_projects,
    SUM(CASE WHEN overall_status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_projects,
    SUM(CASE WHEN overall_status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_projects,
    SUM(CASE WHEN overall_status = 'NOT_STARTED' THEN 1 ELSE 0 END) as not_started_projects,
    ROUND(
        (SUM(CASE WHEN overall_status = 'COMPLETED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2
    ) as completion_rate,
    SUM(CASE WHEN has_overdue_phases = TRUE THEN 1 ELSE 0 END) as overdue_projects,
    ROUND(
        (SUM(CASE WHEN has_overdue_phases = TRUE THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2
    ) as overdue_rate
FROM (
    SELECT 
        p.id,
        CASE 
            WHEN COUNT(ph.id) = SUM(CASE WHEN ph.is_completed = TRUE THEN 1 ELSE 0 END) THEN 'COMPLETED'
            WHEN SUM(CASE WHEN ph.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) > 0 THEN 'IN_PROGRESS'
            ELSE 'NOT_STARTED'
        END as overall_status,
        MAX(ph.is_overdue) as has_overdue_phases
    FROM projects p
    LEFT JOIN project_phases ph ON p.id = ph.project_id
    GROUP BY p.id
) project_summary;

CREATE OR REPLACE VIEW phase_stats AS
SELECT 
    phase_name,
    COUNT(*) as total_phases,
    SUM(CASE WHEN status = 'NOT_STARTED' THEN 1 ELSE 0 END) as not_started_count,
    SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_count,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN is_overdue = TRUE THEN 1 ELSE 0 END) as overdue_count
FROM project_phases
GROUP BY phase_name;

-- Verify the migration
SELECT 'Migration completed successfully' as status;
SELECT COUNT(*) as project_phases_count FROM project_phases;
SELECT COUNT(*) as enhanced_milestones_count FROM key_milestones WHERE status IS NOT NULL;

COMMIT;
