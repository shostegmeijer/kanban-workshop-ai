-- Fix UUID type issues by changing ID columns to TEXT
-- Run this in Supabase SQL Editor
-- This version handles all foreign key dependencies properly

-- Step 1: Drop all foreign key constraints first
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_column_id_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_user_id_fkey;

-- Step 2: Drop all primary key constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_pkey CASCADE;
ALTER TABLE columns DROP CONSTRAINT IF EXISTS columns_pkey CASCADE;  
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey CASCADE;

-- Step 3: Change all ID columns to TEXT type
ALTER TABLE tasks ALTER COLUMN id TYPE TEXT;
ALTER TABLE tasks ALTER COLUMN column_id TYPE TEXT;
-- Only change user_id if it exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='tasks' AND column_name='user_id') THEN
        ALTER TABLE tasks ALTER COLUMN user_id TYPE TEXT;
    END IF;
END $$;

ALTER TABLE columns ALTER COLUMN id TYPE TEXT;
ALTER TABLE users ALTER COLUMN id TYPE TEXT;

-- Step 4: Re-add primary key constraints  
ALTER TABLE tasks ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);
ALTER TABLE columns ADD CONSTRAINT columns_pkey PRIMARY KEY (id);
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Step 5: Re-add foreign key constraints
ALTER TABLE tasks ADD CONSTRAINT tasks_column_id_fkey 
    FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE;

-- Only add user foreign key if user_id column exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='tasks' AND column_name='user_id') THEN
        ALTER TABLE tasks ADD CONSTRAINT tasks_user_id_fkey 
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Step 6: Clean up any test/invalid data
DELETE FROM tasks WHERE id LIKE 'test-%';
DELETE FROM columns WHERE id LIKE 'test-%';
DELETE FROM users WHERE id LIKE 'test-%';

-- Step 7: Show updated schema to verify changes
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('tasks', 'columns', 'users')
  AND column_name LIKE '%id%'
ORDER BY table_name, ordinal_position;

-- Step 8: Show foreign key constraints to verify they're restored
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema='public'
  AND tc.table_name IN ('tasks', 'columns', 'users');

-- Optional: Show sample data to verify everything still works
SELECT 'Sample Data Check' as info;
SELECT 'tasks' as table_name, COUNT(*) as count FROM tasks;
SELECT 'columns' as table_name, COUNT(*) as count FROM columns;
SELECT 'users' as table_name, COUNT(*) as count FROM users;