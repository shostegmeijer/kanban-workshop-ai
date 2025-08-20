-- Debug script to check Supabase real-time setup
-- Run this in the Supabase SQL editor

-- 1. Check if tables exist and have data
SELECT 'tasks' as table_name, COUNT(*) as row_count FROM tasks
UNION ALL
SELECT 'columns' as table_name, COUNT(*) as row_count FROM columns
UNION ALL
SELECT 'users' as table_name, COUNT(*) as row_count FROM users;

-- 2. Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tasks', 'columns', 'users');

-- 3. Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public';

-- 4. Enable real-time for all tables (if not already enabled)
-- This needs to be run in Supabase dashboard under Database > Replication
-- ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
-- ALTER PUBLICATION supabase_realtime ADD TABLE columns;  
-- ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- 5. Disable RLS temporarily for debugging (DANGEROUS - only for development)
-- ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE columns DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- 6. Check task ordering issues
SELECT column_id, id, title, "order", created_at 
FROM tasks 
ORDER BY column_id, "order", created_at;