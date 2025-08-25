-- PostgreSQL 项目阶段表
-- Create enum types first
DO $$ BEGIN
    CREATE TYPE phase_name_type AS ENUM ('ESTIMATED', 'PLANNING', 'DEVELOPMENT', 'SIT', 'UAT', 'LIVE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE phase_status_type AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'ON_HOLD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 项目阶段表
CREATE TABLE IF NOT EXISTS project_phases (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    phase_name phase_name_type NOT NULL,
    start_date DATE,
    end_date DATE,
    planned_start_date DATE,
    planned_end_date DATE,
    status phase_status_type DEFAULT 'NOT_STARTED',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_completed BOOLEAN DEFAULT FALSE,
    is_overdue BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    UNIQUE (project_id, phase_name)
);

-- Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_project_phases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_project_phases_updated_at ON project_phases;
CREATE TRIGGER update_project_phases_updated_at
    BEFORE UPDATE ON project_phases
    FOR EACH ROW
    EXECUTE FUNCTION update_project_phases_updated_at();

-- 项目甘特图统计视图
CREATE OR REPLACE VIEW project_gantt_stats AS
SELECT 
    COUNT(*) as total_projects,
    SUM(CASE WHEN overall_status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_projects,
    SUM(CASE WHEN overall_status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_projects,
    SUM(CASE WHEN overall_status = 'NOT_STARTED' THEN 1 ELSE 0 END) as not_started_projects,
    ROUND(
        (SUM(CASE WHEN overall_status = 'COMPLETED' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)), 2
    ) as completion_rate,
    ROUND(AVG(overall_progress), 2) as avg_progress
FROM (
    SELECT 
        p.id,
        CASE 
            WHEN COUNT(pp.id) = 0 THEN 'NOT_STARTED'
            WHEN COUNT(pp.id) = SUM(CASE WHEN pp.is_completed THEN 1 ELSE 0 END) THEN 'COMPLETED'
            WHEN SUM(CASE WHEN pp.status = 'IN_PROGRESS' THEN 1 ELSE 0 END) > 0 THEN 'IN_PROGRESS'
            ELSE 'NOT_STARTED'
        END as overall_status,
        COALESCE(AVG(pp.progress_percentage), 0) as overall_progress
    FROM projects p
    LEFT JOIN project_phases pp ON p.id = pp.project_id
    GROUP BY p.id
) project_summary;

-- 项目阶段详细视图
CREATE OR REPLACE VIEW project_phases_detail AS
SELECT 
    p.id as project_id,
    p.project_name,
    p.it_project_status,
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
    pp.description,
    CASE 
        WHEN pp.planned_end_date IS NOT NULL AND pp.end_date IS NOT NULL THEN
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
INNER JOIN project_phases pp ON p.id = pp.project_id
ORDER BY p.id, 
    CASE pp.phase_name 
        WHEN 'ESTIMATED' THEN 1
        WHEN 'PLANNING' THEN 2
        WHEN 'DEVELOPMENT' THEN 3
        WHEN 'SIT' THEN 4
        WHEN 'UAT' THEN 5
        WHEN 'LIVE' THEN 6
    END;

-- 创建索引以提高性能
CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases (project_id);
CREATE INDEX IF NOT EXISTS idx_project_phases_status ON project_phases (status);
CREATE INDEX IF NOT EXISTS idx_project_phases_dates ON project_phases (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_project_phases_planned_dates ON project_phases (planned_start_date, planned_end_date);

-- 添加约束
ALTER TABLE project_phases 
ADD CONSTRAINT IF NOT EXISTS chk_progress_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- 添加注释
COMMENT ON TABLE project_phases IS '项目阶段表，用于甘特图功能';
COMMENT ON COLUMN project_phases.phase_name IS '项目阶段名称';
COMMENT ON COLUMN project_phases.start_date IS '实际开始日期';
COMMENT ON COLUMN project_phases.end_date IS '实际结束日期';
COMMENT ON COLUMN project_phases.planned_start_date IS '计划开始日期';
COMMENT ON COLUMN project_phases.planned_end_date IS '计划结束日期';
COMMENT ON COLUMN project_phases.status IS '阶段状态';
COMMENT ON COLUMN project_phases.progress_percentage IS '完成百分比 (0.00-100.00)';
COMMENT ON COLUMN project_phases.is_completed IS '是否已完成';
COMMENT ON COLUMN project_phases.is_overdue IS '是否超期';
