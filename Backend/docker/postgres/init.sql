-- ============================================================
-- AdoraTrip — PostgreSQL Initialization Script
-- Runs once when the database container is first created
-- ============================================================

-- Enable useful PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Trigram search (fuzzy search)
CREATE EXTENSION IF NOT EXISTS "unaccent";       -- Accent-insensitive search
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- GIN index for B-tree types

-- Set timezone
SET timezone = 'Asia/Phnom_Penh';

-- Log
SELECT 'AdoraTrip database initialized successfully' AS status;
