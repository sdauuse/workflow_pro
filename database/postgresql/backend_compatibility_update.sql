-- PostgreSQL Backend Compatibility Update Script
-- This script ensures database schema matches backend model expectations

-- Update key_milestones table to match backend model
-- The backend uses 'milestone_name' and 'milestone_date' as field names in @Column annotations

-- Add actual_date if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'key_milestones' AND column_name = 'actual_date') THEN
        ALTER TABLE key_milestones ADD COLUMN actual_date DATE;
    END IF;
END $$;

-- Add budget if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'key_milestones' AND column_name = 'budget') THEN
        ALTER TABLE key_milestones ADD COLUMN budget DECIMAL(15,2);
    END IF;
END $$;

-- Add risk_assessment if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'key_milestones' AND column_name = 'risk_assessment') THEN
        ALTER TABLE key_milestones ADD COLUMN risk_assessment TEXT;
    END IF;
END $$;

-- Add target_date if it doesn't exist (alias for milestone_date)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'key_milestones' AND column_name = 'target_date') THEN
        ALTER TABLE key_milestones ADD COLUMN target_date DATE;
    END IF;
END $$;

-- Create enum types if they don't exist
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

-- Add status if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'key_milestones' AND column_name = 'status') THEN
        ALTER TABLE key_milestones ADD COLUMN status milestone_status DEFAULT 'PENDING';
    END IF;
END $$;

-- Add priority if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'key_milestones' AND column_name = 'priority') THEN
        ALTER TABLE key_milestones ADD COLUMN priority milestone_priority DEFAULT 'MEDIUM';
    END IF;
END $$;

-- Add progress if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'key_milestones' AND column_name = 'progress') THEN
        ALTER TABLE key_milestones ADD COLUMN progress INTEGER DEFAULT 0;
    END IF;
END $$;

-- Add owner if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'key_milestones' AND column_name = 'owner') THEN
        ALTER TABLE key_milestones ADD COLUMN owner VARCHAR(100);
    END IF;
END $$;

-- Add deliverables if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'key_milestones' AND column_name = 'deliverables') THEN
        ALTER TABLE key_milestones ADD COLUMN deliverables TEXT;
    END IF;
END $$;

-- Add dependencies if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'key_milestones' AND column_name = 'dependencies') THEN
        ALTER TABLE key_milestones ADD COLUMN dependencies TEXT;
    END IF;
END $$;

-- Add success_criteria if it doesn't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'key_milestones' AND column_name = 'success_criteria') THEN
        ALTER TABLE key_milestones ADD COLUMN success_criteria TEXT;
    END IF;
END $$;

-- Sync target_date with milestone_date where needed
UPDATE key_milestones 
SET target_date = milestone_date 
WHERE target_date IS NULL AND milestone_date IS NOT NULL;

-- Update progress based on status field
UPDATE key_milestones 
SET progress = CASE WHEN status = 'COMPLETED' THEN 100 ELSE COALESCE(progress, 0) END
WHERE progress IS NULL OR (status = 'COMPLETED' AND progress != 100);

-- Update status based on milestone dates and current status
UPDATE key_milestones 
SET status = CASE 
    WHEN status = 'COMPLETED' THEN 'COMPLETED'
    WHEN milestone_date < CURRENT_DATE AND status NOT IN ('COMPLETED', 'CANCELLED') THEN 'DELAYED'
    WHEN status IS NULL OR status = '' THEN 'PENDING'
    ELSE status
END
WHERE status IS NULL OR status = '';

-- Ensure projects table has backend-compatible fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'estimation') THEN
        ALTER TABLE projects ADD COLUMN estimation DECIMAL(8,2) DEFAULT NULL;
    END IF;
END $$;

-- Update project_phases table for backend compatibility
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_phases' AND column_name = 'created_at') THEN
        ALTER TABLE project_phases ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_phases' AND column_name = 'updated_at') THEN
        ALTER TABLE project_phases ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_key_milestones_updated_at ON key_milestones;
CREATE TRIGGER update_key_milestones_updated_at
    BEFORE UPDATE ON key_milestones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_project_phases_updated_at ON project_phases;
CREATE TRIGGER update_project_phases_updated_at
    BEFORE UPDATE ON project_phases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add constraints for data integrity (using DO blocks for compatibility)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'key_milestones' AND constraint_name = 'chk_progress_range') THEN
        ALTER TABLE key_milestones ADD CONSTRAINT chk_progress_range CHECK (progress >= 0 AND progress <= 100);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'project_phases' AND constraint_name = 'chk_progress_percentage_range') THEN
        ALTER TABLE project_phases ADD CONSTRAINT chk_progress_percentage_range CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
    END IF;
END $$;

-- Create indexes for performance (using DO blocks for maximum compatibility)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_milestones_project_target_date') THEN
        CREATE INDEX idx_milestones_project_target_date ON key_milestones (project_id, target_date);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_milestones_status') THEN
        CREATE INDEX idx_milestones_status ON key_milestones (status);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_milestones_priority') THEN
        CREATE INDEX idx_milestones_priority ON key_milestones (priority);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_milestones_owner') THEN
        CREATE INDEX idx_milestones_owner ON key_milestones (owner);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_phases_project_status') THEN
        CREATE INDEX idx_phases_project_status ON project_phases (project_id, status);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_phases_dates') THEN
        CREATE INDEX idx_phases_dates ON project_phases (start_date, end_date);
    END IF;
END $$;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_phases_planned_dates') THEN
        CREATE INDEX idx_phases_planned_dates ON project_phases (planned_start_date, planned_end_date);
    END IF;
END $$;

-- Create view for backend API compatibility
CREATE OR REPLACE VIEW project_summary_view AS
SELECT 
    p.id,
    p.project_name,
    p.da_record,
    p.it_project_status,
    p.estimation,
    p.escalation,
    p.next_check_date,
    p.go_live_date,
    t.name as team_name,
    tm.name as lead_name,
    COUNT(DISTINCT km.id) as total_milestones,
    COUNT(DISTINCT CASE WHEN km.status = 'COMPLETED' THEN km.id END) as completed_milestones,
    COUNT(DISTINCT pp.id) as total_phases,
    COUNT(DISTINCT CASE WHEN pp.is_completed THEN pp.id END) as completed_phases,
    AVG(pp.progress_percentage) as overall_progress
FROM projects p
LEFT JOIN teams t ON p.team_id = t.id
LEFT JOIN team_members tm ON p.lead_id = tm.id
LEFT JOIN key_milestones km ON p.id = km.project_id
LEFT JOIN project_phases pp ON p.id = pp.project_id
GROUP BY p.id, p.project_name, p.da_record, p.it_project_status, p.estimation, 
         p.escalation, p.next_check_date, p.go_live_date, t.name, tm.name;

-- Add column comments for documentation
COMMENT ON COLUMN key_milestones.target_date IS 'Target completion date (alias for milestone_date)';
COMMENT ON COLUMN key_milestones.actual_date IS 'Actual completion date';
COMMENT ON COLUMN key_milestones.status IS 'Current milestone status';
COMMENT ON COLUMN key_milestones.priority IS 'Milestone priority level';
COMMENT ON COLUMN key_milestones.progress IS 'Completion percentage (0-100)';
COMMENT ON COLUMN key_milestones.owner IS 'Person responsible for milestone';
COMMENT ON COLUMN key_milestones.budget IS 'Budget allocated for milestone';
COMMENT ON COLUMN key_milestones.deliverables IS 'Expected deliverables';
COMMENT ON COLUMN key_milestones.dependencies IS 'Dependencies required';
COMMENT ON COLUMN key_milestones.success_criteria IS 'Success criteria';

COMMIT;
