-- Seed data for Kanban Workshop

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