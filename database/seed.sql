-- database/seed.sql
-- Password: Admin@123
INSERT INTO users (email, password_hash, full_name, role, status)
VALUES (
  'admin@vu-lms.local',
  '$2b$10$DLIQjJ2fASdHyXPTcc5AMeDOhtA8myI3nWZ.uHjolxAxZ33nB76kC',
  'System Administrator',
  'admin',
  'approved'
)
ON CONFLICT (email) DO NOTHING;