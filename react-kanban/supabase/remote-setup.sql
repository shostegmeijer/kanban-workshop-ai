-- Kanban Board Database Schema for Remote Supabase Project
-- Run this in your Supabase SQL Editor (https://app.supabase.com)

-- Create custom types
CREATE TYPE priority_type AS ENUM ('low', 'medium', 'high');

-- Create columns table
CREATE TABLE IF NOT EXISTS public.columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    avatar TEXT,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    assignee TEXT,
    priority priority_type NOT NULL DEFAULT 'medium',
    column_id UUID NOT NULL REFERENCES public.columns(id) ON DELETE CASCADE,
    "order" INTEGER NOT NULL DEFAULT 0,
    user_id UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON public.tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_order ON public.tasks("order");
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_columns_order ON public.columns("order");

-- Enable RLS on all tables
ALTER TABLE public.columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (workshop environment - adjust for production)
CREATE POLICY "Enable read access for all users" ON public.columns FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.columns FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.columns FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.columns FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.users FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.users FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON public.tasks FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON public.tasks FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON public.tasks FOR DELETE USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_columns_updated_at BEFORE UPDATE ON public.columns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default columns
INSERT INTO public.columns (id, title, "order") VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'To Do', 0),
    ('550e8400-e29b-41d4-a716-446655440002', 'In Progress', 1),
    ('550e8400-e29b-41d4-a716-446655440003', 'Done', 2)
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
INSERT INTO public.users (id, name, avatar, is_online) VALUES
    ('550e8400-e29b-41d4-a716-446655440011', 'Alice Johnson', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150', true),
    ('550e8400-e29b-41d4-a716-446655440012', 'Bob Smith', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', true),
    ('550e8400-e29b-41d4-a716-446655440013', 'Carol Davis', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', false)
ON CONFLICT (id) DO NOTHING;

-- Insert sample tasks
INSERT INTO public.tasks (id, title, description, assignee, priority, column_id, "order", user_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440021', 'Design user authentication flow', 'Create wireframes and mockups for login and signup process', 'Alice Johnson', 'high', '550e8400-e29b-41d4-a716-446655440001', 0, '550e8400-e29b-41d4-a716-446655440011'),
    ('550e8400-e29b-41d4-a716-446655440022', 'Set up database schema', 'Create tables for users, projects, and tasks', 'Bob Smith', 'high', '550e8400-e29b-41d4-a716-446655440001', 1, '550e8400-e29b-41d4-a716-446655440012'),
    ('550e8400-e29b-41d4-a716-446655440023', 'Implement drag and drop functionality', 'Add @dnd-kit to enable task reordering', 'Alice Johnson', 'medium', '550e8400-e29b-41d4-a716-446655440002', 0, '550e8400-e29b-41d4-a716-446655440011'),
    ('550e8400-e29b-41d4-a716-446655440024', 'Write API documentation', 'Document all endpoints with examples', 'Carol Davis', 'low', '550e8400-e29b-41d4-a716-446655440002', 1, '550e8400-e29b-41d4-a716-446655440013'),
    ('550e8400-e29b-41d4-a716-446655440025', 'Set up CI/CD pipeline', 'Configure GitHub Actions for automated testing and deployment', 'Bob Smith', 'medium', '550e8400-e29b-41d4-a716-446655440003', 0, '550e8400-e29b-41d4-a716-446655440012'),
    ('550e8400-e29b-41d4-a716-446655440026', 'Create project structure', 'Set up folder structure and initial configuration', 'Alice Johnson', 'high', '550e8400-e29b-41d4-a716-446655440003', 1, '550e8400-e29b-41d4-a716-446655440011')
ON CONFLICT (id) DO NOTHING;