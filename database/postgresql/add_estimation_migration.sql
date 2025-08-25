-- PostgreSQL Migration script to add estimation field to existing projects table
-- Execute this if you have an existing database without the estimation field

-- Add estimation column to projects table
ALTER TABLE projects 
ADD COLUMN estimation DECIMAL(8,2) DEFAULT NULL;

-- Add comment to the column (PostgreSQL style)
COMMENT ON COLUMN projects.estimation IS 'Project estimation in headcount/month';

-- Update existing projects with sample estimation values
UPDATE projects SET estimation = 24.5 WHERE project_name = 'SAGE TWD Implementation';
UPDATE projects SET estimation = 18.0 WHERE project_name = 'Customer Portal Redesign';
UPDATE projects SET estimation = 32.5 WHERE project_name = 'API Gateway Implementation';
UPDATE projects SET estimation = 45.0 WHERE project_name = 'Data Lake Migration';
UPDATE projects SET estimation = 28.0 WHERE project_name = 'Mobile App Development';
UPDATE projects SET estimation = 15.5 WHERE project_name = 'DevOps Pipeline Automation';

-- Verify the changes
SELECT id, project_name, estimation FROM projects ORDER BY id;
