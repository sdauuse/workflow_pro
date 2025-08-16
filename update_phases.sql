-- 更新project_phases表的phase_name枚举，添加PPE阶段
USE workflow_pro;

-- 修改枚举类型，添加PPE阶段
ALTER TABLE project_phases MODIFY COLUMN phase_name ENUM('ESTIMATED', 'PLANNING', 'DEVELOPMENT', 'SIT', 'UAT', 'PPE', 'LIVE') NOT NULL;

-- 为已有项目添加PPE阶段数据
INSERT INTO project_phases (project_id, phase_name, status, start_date, end_date, planned_start_date, planned_end_date, progress_percentage, is_completed, is_overdue, description)
SELECT 
    project_id,
    'PPE' as phase_name,
    'NOT_STARTED' as status,
    DATE_ADD((SELECT MAX(end_date) FROM project_phases p2 WHERE p2.project_id = p1.project_id AND p2.phase_name = 'UAT'), INTERVAL 1 DAY) as start_date,
    DATE_ADD((SELECT MAX(end_date) FROM project_phases p2 WHERE p2.project_id = p1.project_id AND p2.phase_name = 'UAT'), INTERVAL 15 DAY) as end_date,
    DATE_ADD((SELECT MAX(planned_end_date) FROM project_phases p2 WHERE p2.project_id = p1.project_id AND p2.phase_name = 'UAT'), INTERVAL 1 DAY) as planned_start_date,
    DATE_ADD((SELECT MAX(planned_end_date) FROM project_phases p2 WHERE p2.project_id = p1.project_id AND p2.phase_name = 'UAT'), INTERVAL 15 DAY) as planned_end_date,
    0 as progress_percentage,
    false as is_completed,
    false as is_overdue,
    CONCAT((SELECT project_name FROM projects WHERE id = p1.project_id), ' - Pre-Production Environment testing phase') as description
FROM (SELECT DISTINCT project_id FROM project_phases WHERE phase_name = 'UAT') p1
WHERE NOT EXISTS (
    SELECT 1 FROM project_phases WHERE project_id = p1.project_id AND phase_name = 'PPE'
);

-- 更新LIVE阶段的开始时间，确保在PPE之后
UPDATE project_phases 
SET 
    start_date = DATE_ADD((SELECT MAX(end_date) FROM project_phases p2 WHERE p2.project_id = project_phases.project_id AND p2.phase_name = 'PPE'), INTERVAL 1 DAY),
    planned_start_date = DATE_ADD((SELECT MAX(planned_end_date) FROM project_phases p2 WHERE p2.project_id = project_phases.project_id AND p2.phase_name = 'PPE'), INTERVAL 1 DAY)
WHERE phase_name = 'LIVE';

SELECT 'Database update completed successfully' as status;
