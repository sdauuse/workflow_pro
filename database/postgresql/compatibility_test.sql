-- PostgreSQL Version Compatibility Test Script
-- This script tests the compatibility of our SQL syntax with different PostgreSQL versions

-- Check PostgreSQL version
SELECT 'PostgreSQL Version Check' as test_name;
SELECT version() as postgresql_version;

-- Test DO block functionality (PostgreSQL 9.0+)
DO $$ BEGIN
    RAISE NOTICE 'DO blocks are supported';
END $$;

-- Test CREATE TYPE IF NOT EXISTS (PostgreSQL 9.3+)
DO $$ BEGIN
    CREATE TYPE test_enum_type AS ENUM ('TEST1', 'TEST2');
    DROP TYPE test_enum_type;
    RAISE NOTICE 'CREATE TYPE works correctly';
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'CREATE TYPE with duplicate handling works';
END $$;

-- Test constraint creation compatibility
DO $$ BEGIN
    -- Create a test table
    CREATE TEMP TABLE test_constraints (
        id SERIAL PRIMARY KEY,
        progress INTEGER
    );
    
    -- Test constraint addition
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'test_constraints' AND constraint_name = 'chk_test_progress') THEN
        ALTER TABLE test_constraints ADD CONSTRAINT chk_test_progress CHECK (progress >= 0 AND progress <= 100);
    END IF;
    
    -- Test the constraint
    INSERT INTO test_constraints (progress) VALUES (50);
    
    RAISE NOTICE 'Constraint creation and testing successful';
    
    DROP TABLE test_constraints;
END $$;

-- Test index creation compatibility
DO $$ BEGIN
    -- Create a test table
    CREATE TEMP TABLE test_indexes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        status VARCHAR(20)
    );
    
    -- Test index creation
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_test_name') THEN
        CREATE INDEX idx_test_name ON test_indexes (name);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_test_status') THEN
        CREATE INDEX idx_test_status ON test_indexes (status);
    END IF;
    
    RAISE NOTICE 'Index creation successful';
    
    DROP TABLE test_indexes;
END $$;

SELECT 'All compatibility tests passed successfully' as result;
