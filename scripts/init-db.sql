-- Database Initialization Script for FitKart
-- This script runs when the postgres container starts

-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create test database for testing
CREATE DATABASE fitkart_test
  WITH OWNER postgres
  ENCODING 'UTF8'
  LOCALE 'C';

-- Connect to fitkart database and grant permissions
\c fitkart;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;

-- Grant permissions on fitkart_test database
GRANT ALL PRIVILEGES ON DATABASE fitkart_test TO postgres;

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_steps_user_date ON steps(user_id, created_at);
CREATE INDEX idx_coins_user_date ON coins(user_id, created_at);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Log initialization completion
SELECT 'FitKart database initialized successfully' as status;
