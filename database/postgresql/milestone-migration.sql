-- PostgreSQL Migration script to update key_milestones table with new fields
-- Run this script to add new columns to the existing key_milestones table

-- Create enum types for PostgreSQL
DO $$ BEGIN
    CREATE TYPE milestone_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD', 'DELAYED', 'AT_RISK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE milestone_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add new columns to key_milestones table (only if they don't exist)
-- Most fields already exist in schema.sql, so we only add missing ones

-- Add target_date as alias/copy of milestone_date if needed
ALTER TABLE key_milestones 
ADD COLUMN IF NOT EXISTS target_date DATE;

-- Update target_date to match milestone_date for existing records
UPDATE key_milestones SET target_date = milestone_date WHERE target_date IS NULL AND milestone_date IS NOT NULL;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_key_milestones_updated_at ON key_milestones;
CREATE TRIGGER update_key_milestones_updated_at
    BEFORE UPDATE ON key_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update existing records to ensure data consistency
-- Convert existing status values to use the enum values
UPDATE key_milestones SET 
    target_date = COALESCE(target_date, milestone_date),
    created_date = COALESCE(created_date, DATE(created_at))
WHERE target_date IS NULL OR created_date IS NULL;

-- Keep milestone_name field for backend compatibility
-- No need to rename milestone_name to name as backend expects milestone_name

-- Add additional constraints and indexes (if they don't already exist)
-- Note: progress constraint already exists in schema.sql

CREATE INDEX IF NOT EXISTS idx_key_milestones_target_date ON key_milestones (target_date);
CREATE INDEX IF NOT EXISTS idx_key_milestones_status ON key_milestones (status);
CREATE INDEX IF NOT EXISTS idx_key_milestones_priority ON key_milestones (priority);
CREATE INDEX IF NOT EXISTS idx_key_milestones_owner ON key_milestones (owner);
CREATE INDEX IF NOT EXISTS idx_key_milestones_project_target_date ON key_milestones (project_id, target_date);

-- Create a view for milestone dashboard
CREATE OR REPLACE VIEW milestone_dashboard AS
SELECT 
    p.project_name,
    km.milestone_name,
    km.target_date,
    km.actual_date,
    km.status,
    km.priority,
    km.progress,
    km.owner,
    km.budget,
    CASE 
        WHEN km.status = 'COMPLETED' THEN 'On Time'
        WHEN km.target_date < CURRENT_DATE AND km.status != 'COMPLETED' THEN 'Overdue'
        WHEN km.target_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'Due Soon'
        ELSE 'On Track'
    END as timeline_status,
    (km.target_date - CURRENT_DATE) as days_until_due
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
    SUM(CASE WHEN km.target_date < CURRENT_DATE AND km.status != 'COMPLETED' THEN 1 ELSE 0 END) as overdue_milestones,
    SUM(CASE WHEN km.priority IN ('HIGH', 'CRITICAL') THEN 1 ELSE 0 END) as critical_milestones,
    AVG(km.progress) as avg_progress,
    SUM(km.budget) as total_budget,
    MIN(km.target_date) as earliest_milestone,
    MAX(km.target_date) as latest_milestone
FROM projects p
LEFT JOIN key_milestones km ON p.id = km.project_id
GROUP BY p.id, p.project_name;

-- Add comments to document the table structure
COMMENT ON TABLE key_milestones IS 'Enhanced milestone tracking table with comprehensive project management fields';

-- Add column comments
COMMENT ON COLUMN key_milestones.milestone_name IS 'Milestone name/title';
COMMENT ON COLUMN key_milestones.description IS 'Detailed milestone description';
COMMENT ON COLUMN key_milestones.target_date IS 'Planned completion date';
COMMENT ON COLUMN key_milestones.actual_date IS 'Actual completion date';
COMMENT ON COLUMN key_milestones.status IS 'Current milestone status';
COMMENT ON COLUMN key_milestones.priority IS 'Milestone priority level';
COMMENT ON COLUMN key_milestones.progress IS 'Completion percentage (0-100)';
COMMENT ON COLUMN key_milestones.owner IS 'Person responsible for milestone';
COMMENT ON COLUMN key_milestones.deliverables IS 'Expected deliverables for this milestone';
COMMENT ON COLUMN key_milestones.dependencies IS 'Dependencies required before milestone completion';
COMMENT ON COLUMN key_milestones.budget IS 'Budget allocated for this milestone';
COMMENT ON COLUMN key_milestones.risk_assessment IS 'Risk analysis and mitigation strategies';
COMMENT ON COLUMN key_milestones.success_criteria IS 'Criteria to determine milestone success';

COMMIT;
