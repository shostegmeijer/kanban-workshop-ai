-- Clean up mock users from the database
DELETE FROM users WHERE name IN ('Alice Johnson', 'Bob Smith', 'Carol Davis');

-- Alternatively, delete all users (since we'll populate with real Clerk users)
-- DELETE FROM users;