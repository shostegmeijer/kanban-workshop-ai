-- Setup Row Level Security policies for Kanban board
-- Run this in Supabase SQL Editor

-- For development/testing, we'll make everything public
-- In production, you'd want proper user-based policies

-- Tasks table policies
DROP POLICY IF EXISTS "Enable all operations for tasks" ON tasks;
CREATE POLICY "Enable all operations for tasks" 
ON tasks FOR ALL 
USING (true) 
WITH CHECK (true);

-- Columns table policies  
DROP POLICY IF EXISTS "Enable all operations for columns" ON columns;
CREATE POLICY "Enable all operations for columns" 
ON columns FOR ALL 
USING (true) 
WITH CHECK (true);

-- Users table policies
DROP POLICY IF EXISTS "Enable all operations for users" ON users;
CREATE POLICY "Enable all operations for users" 
ON users FOR ALL 
USING (true) 
WITH CHECK (true);

-- Enable RLS on all tables
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Enable real-time for all tables
-- Note: This needs to be done in Supabase Dashboard > Database > Replication
-- OR use these commands if you have the right permissions:
-- ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
-- ALTER PUBLICATION supabase_realtime ADD TABLE columns;
-- ALTER PUBLICATION supabase_realtime ADD TABLE users;