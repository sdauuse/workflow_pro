-- PostgreSQL Migration script for Gantt Chart functionality
-- Execute this script if you have an existing database without project phases and enhanced milestones

-- Create enum types for PostgreSQL if they don't exist
DO $$ BEGIN
    CREATE TYPE phase_name_enum AS ENUM ('ESTIMATED', 'PLANNING', 'DEVELOPMENT', 'SIT', 'UAT', 'PPE', 'LIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE phase_status_enum AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'ON_HOLD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Check if project_phases table exists, if not create it
CREATE TABLE IF NOT EXISTS project_phases (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    phase_name phase_name_enum NOT NULL,
    start_date DATE,
    end_date DATE,
    planned_start_date DATE,
    planned_end_date DATE,
    status phase_status_enum DEFAULT 'NOT_STARTED',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_completed BOOLEAN DEFAULT FALSE,
    is_overdue BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE (project_id, phase_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_phase_status ON project_phases (project_id, status);
CREATE INDEX IF NOT EXISTS idx_phase_dates ON project_phases (start_date, end_date);

-- Create function to auto-update updated_at timestamp for project_phases
CREATE OR REPLACE FUNCTION update_project_phases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at on project_phases
DROP TRIGGER IF EXISTS update_project_phases_updated_at ON project_phases;
CREATE TRIGGER update_project_phases_updated_at
    BEFORE UPDATE ON project_phases
    FOR EACH ROW
    EXECUTE FUNCTION update_project_phases_updated_at();

-- Add enhanced fields to key_milestones table if they don't exist
-- (These would have been added by the milestone migration script)

-- Check if projects table has the required fields, add them if missing
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'estimation') THEN
        ALTER TABLE projects ADD COLUMN estimation DECIMAL(8,2) DEFAULT NULL;
        COMMENT ON COLUMN projects.estimation IS 'Project estimation in headcount/month';
    END IF;
END $$;

-- Create or update project phase triggers and procedures

-- Function to automatically update project overdue status
CREATE OR REPLACE FUNCTION check_project_phase_overdue()
RETURNS TRIGGER AS $$
BEGIN
    -- Update is_overdue flag based on current date and planned end date
    IF NEW.planned_end_date IS NOT NULL AND NEW.status != 'COMPLETED' THEN
        NEW.is_overdue = (NEW.planned_end_date < CURRENT_DATE);
    END IF;
    
    -- Auto-complete phase if progress is 100%
    IF NEW.progress_percentage >= 100 THEN
        NEW.is_completed = TRUE;
        NEW.status = 'COMPLETED';
        IF NEW.end_date IS NULL THEN
            NEW.end_date = CURRENT_DATE;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for automatic overdue checking
DROP TRIGGER IF EXISTS check_overdue_on_update ON project_phases;
CREATE TRIGGER check_overdue_on_update
    BEFORE INSERT OR UPDATE ON project_phases
    FOR EACH ROW
    EXECUTE FUNCTION check_project_phase_overdue();

-- Create view for Gantt chart data
CREATE OR REPLACE VIEW gantt_chart_view AS
SELECT 
    p.id as project_id,
    p.project_name,
    p.it_project_status,
    p.estimation,
    pp.id as phase_id,
    pp.phase_name,
    pp.start_date,
    pp.end_date,
    pp.planned_start_date,
    pp.planned_end_date,
    pp.status,
    pp.progress_percentage,
    pp.is_completed,
    pp.is_overdue,
    pp.description as phase_description,
    CASE 
        WHEN pp.end_date IS NOT NULL AND pp.planned_end_date IS NOT NULL THEN
            pp.end_date - pp.planned_end_date
        ELSE NULL
    END as schedule_variance_days,
    CASE 
        WHEN pp.status = 'COMPLETED' THEN 'Completed'
        WHEN pp.is_overdue THEN 'Overdue'
        WHEN pp.planned_start_date <= CURRENT_DATE + INTERVAL '7 days' AND pp.status = 'NOT_STARTED' THEN 'Starting Soon'
        WHEN pp.status = 'IN_PROGRESS' THEN 'In Progress'
        ELSE 'Scheduled'
    END as timeline_status
FROM projects p
LEFT JOIN project_phases pp ON p.id = pp.project_id
ORDER BY p.id, 
    CASE pp.phase_name 
        WHEN 'ESTIMATED' THEN 1
        WHEN 'PLANNING' THEN 2
        WHEN 'DEVELOPMENT' THEN 3
        WHEN 'SIT' THEN 4
        WHEN 'UAT' THEN 5
        WHEN 'PPE' THEN 6
        WHEN 'LIVE' THEN 7
    END;

-- Create summary view for project progress
CREATE OR REPLACE VIEW project_progress_summary AS
SELECT 
    p.id as project_id,
    p.project_name,
    p.it_project_status,
    COUNT(pp.id) as total_phases,
    SUM(CASE WHEN pp.is_completed THEN 1 ELSE 0 END) as completed_phases,
    SUM(CASE WHEN pp.is_overdue THEN 1 ELSE 0 END) as overdue_phases,
    AVG(pp.progress_percentage) as avg_progress,
    MIN(pp.planned_start_date) as project_start_date,
    MAX(pp.planned_end_date) as project_end_date,
    MAX(pp.end_date) as actual_completion_date,
    CASE 
        WHEN COUNT(pp.id) = SUM(CASE WHEN pp.is_completed THEN 1 ELSE 0 END) THEN 'Completed'
        WHEN SUM(CASE WHEN pp.is_overdue THEN 1 ELSE 0 END) > 0 THEN 'At Risk'
        WHEN SUM(CASE WHEN pp.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) > 0 THEN 'In Progress'
        ELSE 'Scheduled'
    END as overall_status
FROM projects p
LEFT JOIN project_phases pp ON p.id = pp.project_id
GROUP BY p.id, p.project_name, p.it_project_status;

-- Insert sample project phases for existing projects
INSERT INTO project_phases (project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date, status, progress_percentage, is_completed, is_overdue)
SELECT 1, 'ESTIMATED', '2025-06-01', '2025-06-15', '2025-06-01', '2025-06-15', 'COMPLETED', 100.00, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM project_phases WHERE project_id = 1 AND phase_name = 'ESTIMATED');

INSERT INTO project_phases (project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date, status, progress_percentage, is_completed, is_overdue)
SELECT 1, 'PLANNING', '2025-06-16', '2025-07-15', '2025-06-16', '2025-07-15', 'COMPLETED', 100.00, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM project_phases WHERE project_id = 1 AND phase_name = 'PLANNING');

INSERT INTO project_phases (project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date, status, progress_percentage, is_completed, is_overdue)
SELECT 1, 'DEVELOPMENT', '2025-07-16', NULL, '2025-07-16', '2025-09-15', 'IN_PROGRESS', 75.00, FALSE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM project_phases WHERE project_id = 1 AND phase_name = 'DEVELOPMENT');

INSERT INTO project_phases (project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date, status, progress_percentage, is_completed, is_overdue)
SELECT 1, 'SIT', NULL, NULL, '2025-09-16', '2025-10-15', 'NOT_STARTED', 0.00, FALSE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM project_phases WHERE project_id = 1 AND phase_name = 'SIT');

INSERT INTO project_phases (project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date, status, progress_percentage, is_completed, is_overdue)
SELECT 1, 'UAT', NULL, NULL, '2025-10-16', '2025-11-15', 'NOT_STARTED', 0.00, FALSE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM project_phases WHERE project_id = 1 AND phase_name = 'UAT');

INSERT INTO project_phases (project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date, status, progress_percentage, is_completed, is_overdue)
SELECT 1, 'LIVE', NULL, NULL, '2025-11-16', '2025-12-01', 'NOT_STARTED', 0.00, FALSE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM project_phases WHERE project_id = 1 AND phase_name = 'LIVE');

-- Add comments to document the table structures
COMMENT ON TABLE project_phases IS 'Project phases for Gantt chart functionality with timeline tracking';
COMMENT ON COLUMN project_phases.phase_name IS 'Project phase type';
COMMENT ON COLUMN project_phases.start_date IS 'Actual start date of the phase';
COMMENT ON COLUMN project_phases.end_date IS 'Actual end date of the phase';
COMMENT ON COLUMN project_phases.planned_start_date IS 'Originally planned start date';
COMMENT ON COLUMN project_phases.planned_end_date IS 'Originally planned end date';
COMMENT ON COLUMN project_phases.status IS 'Current phase status';
COMMENT ON COLUMN project_phases.progress_percentage IS 'Phase completion percentage (0.00-100.00)';
COMMENT ON COLUMN project_phases.is_completed IS 'Whether the phase is completed';
COMMENT ON COLUMN project_phases.is_overdue IS 'Whether the phase is overdue based on planned dates';

COMMIT;
