-- Fix UUID type issues by changing ID columns to TEXT
-- Run this in Supabase SQL Editor

-- First, drop existing constraints and indexes
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_column_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_pkey;
ALTER TABLE columns DROP CONSTRAINT IF EXISTS columns_pkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey;

-- Change ID columns to TEXT type
ALTER TABLE tasks ALTER COLUMN id TYPE TEXT;
ALTER TABLE tasks ALTER COLUMN column_id TYPE TEXT;
ALTER TABLE columns ALTER COLUMN id TYPE TEXT;
ALTER TABLE users ALTER COLUMN id TYPE TEXT;

-- Re-add primary key constraints
ALTER TABLE tasks ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);
ALTER TABLE columns ADD CONSTRAINT columns_pkey PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Re-add foreign key constraint
ALTER TABLE tasks ADD CONSTRAINT tasks_column_id_fkey 
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE;

-- Update any existing data to ensure consistency
-- Remove any test data or fix existing UUIDs if needed
DELETE FROM tasks WHERE id LIKE 'test-%';
DELETE FROM columns WHERE id LIKE 'test-%';
DELETE FROM users WHERE id LIKE 'test-%';

-- Show updated schema
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('tasks', 'columns', 'users')
  AND column_name = 'id'
ORDER BY table_name, ordinal_position;