-- PostgreSQL Database Schema for Project Management System
-- Create database (run this command separately as superuser)
-- CREATE DATABASE project_management_system;

-- Connect to the database
-- \c project_management_system;

-- Create enum types for project phases
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

-- Create sequences for auto-increment columns
CREATE SEQUENCE IF NOT EXISTS projects_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS teams_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS team_members_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS project_phases_id_seq START 1;
CREATE SEQUENCE IF NOT EXISTS key_milestones_id_seq START 1;

-- Create Teams table
CREATE TABLE IF NOT EXISTS teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Team Members table
CREATE TABLE IF NOT EXISTS team_members (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    role VARCHAR(100),
    team_id BIGINT,
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
);

-- Create Projects table
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    da_record VARCHAR(100) UNIQUE,
    team_id BIGINT,
    lead_id BIGINT,
    it_project_status VARCHAR(20) DEFAULT 'AMBER' CHECK (it_project_status IN ('GREEN', 'AMBER', 'RED')),
    near_milestone VARCHAR(255),
    near_milestone_date DATE,
    it_executive_summary TEXT,
    key_issue_and_risk TEXT,
    escalation BOOLEAN DEFAULT FALSE,
    next_check_date DATE,
    go_live_date DATE,
    dependency TEXT,
    related_materials TEXT,
    project_jira_link VARCHAR(500),
    estimation DECIMAL(10,2),
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL,
    FOREIGN KEY (lead_id) REFERENCES team_members(id) ON DELETE SET NULL
);

-- Create Project Phases table
CREATE TABLE IF NOT EXISTS project_phases (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    phase_name phase_name_enum NOT NULL,
    start_date DATE,
    end_date DATE,
    planned_start_date DATE,
    planned_end_date DATE,
    status phase_status_enum DEFAULT 'NOT_STARTED',
    progress_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    is_completed BOOLEAN DEFAULT FALSE,
    is_overdue BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create Key Milestones table
CREATE TABLE IF NOT EXISTS key_milestones (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    milestone_name VARCHAR(255) NOT NULL,
    description TEXT,
    milestone_date DATE,
    actual_date DATE,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD', 'DELAYED', 'AT_RISK')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    owner VARCHAR(255),
    deliverables TEXT,
    dependencies TEXT,
    budget DECIMAL(12,2),
    risk_assessment TEXT,
    success_criteria TEXT,
    created_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects(lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(it_project_status);
CREATE INDEX IF NOT EXISTS idx_projects_escalation ON projects(escalation);
CREATE INDEX IF NOT EXISTS idx_projects_next_check_date ON projects(next_check_date);

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);

CREATE INDEX IF NOT EXISTS idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX IF NOT EXISTS idx_project_phases_status ON project_phases(status);
CREATE INDEX IF NOT EXISTS idx_project_phases_phase_name ON project_phases(phase_name);

CREATE INDEX IF NOT EXISTS idx_key_milestones_project_id ON key_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_key_milestones_status ON key_milestones(status);
CREATE INDEX IF NOT EXISTS idx_key_milestones_milestone_date ON key_milestones(milestone_date);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_phases_updated_at BEFORE UPDATE ON project_phases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_key_milestones_updated_at BEFORE UPDATE ON key_milestones
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for common queries
CREATE OR REPLACE VIEW v_projects_with_teams AS
SELECT 
    p.*,
    t.name as team_name,
    tm.name as lead_name,
    tm.email as lead_email
FROM projects p
LEFT JOIN teams t ON p.team_id = t.id
LEFT JOIN team_members tm ON p.lead_id = tm.id;

CREATE OR REPLACE VIEW v_project_progress AS
SELECT 
    p.id,
    p.project_name,
    p.it_project_status,
    COUNT(ph.id) as total_phases,
    COUNT(CASE WHEN ph.is_completed = true THEN 1 END) as completed_phases,
    ROUND(
        CASE 
            WHEN COUNT(ph.id) > 0 THEN 
                (COUNT(CASE WHEN ph.is_completed = true THEN 1 END)::DECIMAL / COUNT(ph.id)::DECIMAL) * 100
            ELSE 0 
        END, 2
    ) as completion_percentage
FROM projects p
LEFT JOIN project_phases ph ON p.id = ph.project_id
GROUP BY p.id, p.project_name, p.it_project_status;

-- Comments for documentation
COMMENT ON TABLE teams IS 'Teams in the organization';
COMMENT ON TABLE team_members IS 'Individual team members';
COMMENT ON TABLE projects IS 'Main projects table';
COMMENT ON TABLE project_phases IS 'Project phases/stages';
COMMENT ON TABLE key_milestones IS 'Project milestones and deliverables';

COMMENT ON COLUMN projects.it_project_status IS 'Project status: GREEN (on track), AMBER (at risk), RED (critical)';
COMMENT ON COLUMN projects.escalation IS 'Whether the project has been escalated to management';
COMMENT ON COLUMN project_phases.phase_name IS 'Phase type: ESTIMATED, PLANNING, DEVELOPMENT, SIT, UAT, PPE, LIVE';
COMMENT ON COLUMN key_milestones.status IS 'Milestone status: PENDING, IN_PROGRESS, COMPLETED, CANCELLED, ON_HOLD, DELAYED, AT_RISK';
