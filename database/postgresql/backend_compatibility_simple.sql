-- PostgreSQL Backend Compatibility Update Script (Simple Version)
-- This script ensures database schema matches backend model expectations
-- Compatible with PostgreSQL 9.0+

-- Note: This simplified version avoids advanced syntax that might not be supported in older PostgreSQL versions

-- Update key_milestones table constraints manually (if needed)
-- Run these individually if the main script fails:

-- Add progress constraint manually
-- ALTER TABLE key_milestones ADD CONSTRAINT chk_progress_range CHECK (progress >= 0 AND progress <= 100);

-- Add project_phases constraint manually  
-- ALTER TABLE project_phases ADD CONSTRAINT chk_progress_percentage_range CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Create indexes manually
-- CREATE INDEX idx_milestones_project_target_date ON key_milestones (project_id, target_date);
-- CREATE INDEX idx_milestones_status ON key_milestones (status);
-- CREATE INDEX idx_milestones_priority ON key_milestones (priority);
-- CREATE INDEX idx_milestones_owner ON key_milestones (owner);
-- CREATE INDEX idx_phases_project_status ON project_phases (project_id, status);
-- CREATE INDEX idx_phases_dates ON project_phases (start_date, end_date);
-- CREATE INDEX idx_phases_planned_dates ON project_phases (planned_start_date, planned_end_date);

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
