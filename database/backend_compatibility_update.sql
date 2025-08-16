-- Backend Compatibility Update Script
-- This script ensures database schema matches backend model expectations

-- Update key_milestones table to match backend model
-- The backend uses 'milestone_name' and 'milestone_date' as field names in @Column annotations

-- Check current structure and add missing fields if needed
SET @sql = '';

-- Add actual_date if it doesn't exist
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'key_milestones' 
  AND column_name = 'actual_date';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE key_milestones ADD COLUMN actual_date DATE;', 
    'SELECT ''actual_date column already exists'';');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add budget if it doesn't exist
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'key_milestones' 
  AND column_name = 'budget';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE key_milestones ADD COLUMN budget DECIMAL(15,2);', 
    'SELECT ''budget column already exists'';');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add risk_assessment if it doesn't exist
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'key_milestones' 
  AND column_name = 'risk_assessment';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE key_milestones ADD COLUMN risk_assessment TEXT;', 
    'SELECT ''risk_assessment column already exists'';');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add created_date if it doesn't exist
SELECT COUNT(*) INTO @col_exists 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'key_milestones' 
  AND column_name = 'created_date';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE key_milestones ADD COLUMN created_date DATE;', 
    'SELECT ''created_date column already exists'';');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure project_phases table exists (already should be there from previous updates)
CREATE TABLE IF NOT EXISTS project_phases (
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

-- Insert default project phases for existing projects that don't have phases
INSERT IGNORE INTO project_phases (project_id, phase_name, planned_start_date, planned_end_date, status, progress_percentage, is_completed)
SELECT 
    p.id,
    phase_data.phase_name,
    phase_data.planned_start_date,
    phase_data.planned_end_date,
    phase_data.status,
    phase_data.progress_percentage,
    phase_data.is_completed
FROM projects p
CROSS JOIN (
    SELECT 'ESTIMATED' as phase_name, 
           DATE_SUB(CURDATE(), INTERVAL 60 DAY) as planned_start_date, 
           DATE_SUB(CURDATE(), INTERVAL 45 DAY) as planned_end_date,
           'COMPLETED' as status, 100.00 as progress_percentage, TRUE as is_completed
    UNION ALL
    SELECT 'PLANNING', 
           DATE_SUB(CURDATE(), INTERVAL 44 DAY), 
           DATE_SUB(CURDATE(), INTERVAL 30 DAY),
           'COMPLETED', 100.00, TRUE
    UNION ALL
    SELECT 'DEVELOPMENT',
           DATE_SUB(CURDATE(), INTERVAL 29 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 15 DAY),
           'IN_PROGRESS', 60.00, FALSE
    UNION ALL
    SELECT 'SIT',
           DATE_ADD(CURDATE(), INTERVAL 16 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 45 DAY),
           'NOT_STARTED', 0.00, FALSE
    UNION ALL
    SELECT 'UAT',
           DATE_ADD(CURDATE(), INTERVAL 46 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 75 DAY),
           'NOT_STARTED', 0.00, FALSE
    UNION ALL
    SELECT 'LIVE',
           DATE_ADD(CURDATE(), INTERVAL 76 DAY), 
           DATE_ADD(CURDATE(), INTERVAL 90 DAY),
           'NOT_STARTED', 0.00, FALSE
) phase_data
WHERE NOT EXISTS (
    SELECT 1 FROM project_phases pp 
    WHERE pp.project_id = p.id AND pp.phase_name = phase_data.phase_name
);

-- Update created_date for existing milestones if NULL
UPDATE key_milestones 
SET created_date = DATE(created_at) 
WHERE created_date IS NULL AND created_at IS NOT NULL;

-- Verify the backend compatibility
SELECT 'Backend compatibility update completed' as status;

-- Check milestone table structure
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
  AND table_name = 'key_milestones'
ORDER BY ORDINAL_POSITION;

COMMIT;
