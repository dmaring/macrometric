-- Database initialization script for macrometric
-- This script runs on first database startup

-- Enable useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions (if needed for specific roles in the future)
-- GRANT ALL PRIVILEGES ON DATABASE macrometric TO postgres;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Database initialization completed successfully';
END $$;
