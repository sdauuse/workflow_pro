-- 项目阶段表
CREATE TABLE project_phases (
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
    UNIQUE KEY unique_project_phase (project_id, phase_name)
);

-- 项目甘特图统计视图
CREATE VIEW project_gantt_stats AS
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

-- 阶段统计视图
CREATE VIEW phase_stats AS
SELECT 
    phase_name,
    COUNT(*) as total_phases,
    SUM(CASE WHEN status = 'NOT_STARTED' THEN 1 ELSE 0 END) as not_started_count,
    SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as in_progress_count,
    SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_count,
    SUM(CASE WHEN is_overdue = TRUE THEN 1 ELSE 0 END) as overdue_count
FROM project_phases
GROUP BY phase_name;

-- 插入示例项目阶段数据 - Updated to 2025
INSERT INTO project_phases (project_id, phase_name, start_date, end_date, planned_start_date, planned_end_date, status, progress_percentage, is_completed, is_overdue) VALUES
-- 项目1: E-commerce Platform
(1, 'ESTIMATED', '2025-07-01', '2025-07-15', '2025-07-01', '2025-07-15', 'COMPLETED', 100.00, TRUE, FALSE),
(1, 'PLANNING', '2025-07-16', '2025-07-30', '2025-07-16', '2025-07-30', 'COMPLETED', 100.00, TRUE, FALSE),
(1, 'DEVELOPMENT', '2025-08-01', NULL, '2025-08-01', '2025-09-15', 'IN_PROGRESS', 75.00, FALSE, FALSE),
(1, 'SIT', NULL, NULL, '2025-09-16', '2025-10-15', 'NOT_STARTED', 0.00, FALSE, FALSE),
(1, 'UAT', NULL, NULL, '2025-10-16', '2025-11-15', 'NOT_STARTED', 0.00, FALSE, FALSE),
(1, 'LIVE', NULL, NULL, '2025-11-16', '2025-11-30', 'NOT_STARTED', 0.00, FALSE, FALSE),

-- 项目2: Mobile Banking App
(2, 'ESTIMATED', '2025-06-15', '2025-06-30', '2025-06-15', '2025-06-30', 'COMPLETED', 100.00, TRUE, FALSE),
(2, 'PLANNING', '2025-07-01', '2025-07-20', '2025-07-01', '2025-07-20', 'COMPLETED', 100.00, TRUE, FALSE),
(2, 'DEVELOPMENT', '2025-07-21', '2025-08-20', '2025-07-21', '2025-08-15', 'COMPLETED', 100.00, TRUE, TRUE),
(2, 'SIT', '2025-08-21', NULL, '2025-08-16', '2025-08-25', 'IN_PROGRESS', 60.00, FALSE, FALSE),
(2, 'UAT', NULL, NULL, '2025-08-26', '2025-09-25', 'NOT_STARTED', 0.00, FALSE, FALSE),
(2, 'LIVE', NULL, NULL, '2025-09-26', '2025-10-15', 'NOT_STARTED', 0.00, FALSE, FALSE),

-- 项目3: Data Analytics Dashboard
(3, 'ESTIMATED', '2025-06-01', '2025-06-15', '2025-06-01', '2025-06-15', 'COMPLETED', 100.00, TRUE, FALSE),
(3, 'PLANNING', '2025-06-16', '2025-07-15', '2025-06-16', '2025-07-10', 'COMPLETED', 100.00, TRUE, TRUE),
(3, 'DEVELOPMENT', '2025-07-16', NULL, '2025-07-11', '2025-08-20', 'IN_PROGRESS', 30.00, FALSE, TRUE),
(3, 'SIT', NULL, NULL, '2025-08-21', '2025-09-20', 'NOT_STARTED', 0.00, FALSE, FALSE),
(3, 'UAT', NULL, NULL, '2025-09-21', '2025-10-20', 'NOT_STARTED', 0.00, FALSE, FALSE),
(3, 'LIVE', NULL, NULL, '2025-10-21', '2025-11-20', 'NOT_STARTED', 0.00, FALSE, FALSE);
