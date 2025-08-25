-- Test script to verify status constraint fix
-- This script tests that all status values are now accepted

-- Test inserting records with all allowed status values
INSERT INTO key_milestones (
    project_id, milestone_name, description, milestone_date, status, priority, progress, owner
) VALUES 
-- Test each status value
(1, 'Test PENDING', 'Test milestone with PENDING status', '2025-12-01', 'PENDING', 'LOW', 0, 'Test User'),
(1, 'Test IN_PROGRESS', 'Test milestone with IN_PROGRESS status', '2025-12-02', 'IN_PROGRESS', 'MEDIUM', 50, 'Test User'),
(1, 'Test COMPLETED', 'Test milestone with COMPLETED status', '2025-12-03', 'COMPLETED', 'HIGH', 100, 'Test User'),
(1, 'Test CANCELLED', 'Test milestone with CANCELLED status', '2025-12-04', 'CANCELLED', 'LOW', 0, 'Test User'),
(1, 'Test ON_HOLD', 'Test milestone with ON_HOLD status', '2025-12-05', 'ON_HOLD', 'MEDIUM', 25, 'Test User'),
(1, 'Test DELAYED', 'Test milestone with DELAYED status', '2025-12-06', 'DELAYED', 'HIGH', 75, 'Test User'),
(1, 'Test AT_RISK', 'Test milestone with AT_RISK status', '2025-12-07', 'AT_RISK', 'CRITICAL', 30, 'Test User')
ON CONFLICT DO NOTHING;

-- Verify the test data was inserted successfully
SELECT 'Status Constraint Test Results' as test_name;
SELECT milestone_name, status FROM key_milestones 
WHERE milestone_name LIKE 'Test %' 
ORDER BY milestone_name;

-- Clean up test data
DELETE FROM key_milestones WHERE milestone_name LIKE 'Test %';

SELECT 'Status constraint test completed successfully' as result;
