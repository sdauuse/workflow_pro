-- Post-- 2. Create database -- 4. Execute files in this order (compatible with older PostgreSQL versions):
-- \i schema.sql
-- \i test_data.sql
-- \i add_estimation_migration.sql
-- \i milestone-migration.sql
-- \i backend_compatibility_update.sql  (now with improved compatibility)
-- \i gantt_test_data.sql
-- \i milestone_sample_data.sql

-- 5. Verify the setupas postgres superuser)
DROP DATABASE IF EXISTS project_management_system;
CREATE DATABASE project_management_system;
DROP USER IF EXISTS workflow_user;
CREATE USER workflow_user WITH PASSWORD '12356';
GRANT ALL PRIVILEGES ON DATABASE project_management_system TO workflow_user;

-- 3. Connect to database and grant permissionsanual Setup Test Script
-- Copy and paste these commands into psql manually to test the fixes

-- 1. Check PostgreSQL version compatibility
SELECT 'PostgreSQL Version Check' as step;
SELECT version() as postgresql_version;

-- 2. Create database and user (as postgres superuser)
DROP DATABASE IF EXISTS project_management_system;
CREATE DATABASE project_management_system;
DROP USER IF EXISTS workflow_user;
CREATE USER workflow_user WITH PASSWORD '12356';
GRANT ALL PRIVILEGES ON DATABASE project_management_system TO workflow_user;

-- 2. Connect to database and grant permissions
\c project_management_system;
GRANT ALL ON SCHEMA public TO workflow_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO workflow_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO workflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO workflow_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO workflow_user;

-- 3. Execute files in this order:
-- \i schema.sql
-- \i test_data.sql
-- \i add_estimation_migration.sql
-- \i milestone-migration.sql
-- \i backend_compatibility_update.sql
-- \i gantt_test_data.sql
-- \i milestone_sample_data.sql

-- 4. Verify the setup
SELECT 'Database Setup Verification' as step;

-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check projects exist
SELECT id, project_name FROM projects ORDER BY id;

-- Check milestones exist (should include DELAYED status)
SELECT project_id, milestone_name, status FROM key_milestones ORDER BY project_id, id;

-- Check project phases exist
SELECT project_id, phase_name, status FROM project_phases ORDER BY project_id, id;

-- Test status constraint (verify all status values are allowed)
SELECT 'Testing Status Constraint' as test_step;
INSERT INTO key_milestones (project_id, milestone_name, description, milestone_date, status, priority, progress) 
VALUES (1, 'Constraint Test', 'Testing DELAYED status', '2025-12-31', 'DELAYED', 'LOW', 0);
DELETE FROM key_milestones WHERE milestone_name = 'Constraint Test';

SELECT 'Setup verification complete - Status constraint working correctly' as result;
