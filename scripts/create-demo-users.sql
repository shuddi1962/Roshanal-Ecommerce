-- Create demo users for Roshanal Global E-commerce
-- This script creates demo accounts for testing authentication

-- Insert demo users with bcrypt-hashed passwords
INSERT INTO users (email, name, role, password_hash, email_verified, is_active, created_at) VALUES
('admin@roshanalglobal.com', 'Super Admin', 'super_admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeXt1jPuMtXM6EoYW', true, true, NOW()),
('manager@roshanalglobal.com', 'Store Manager', 'store_manager', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeXt1jPuMtXM6EoYW', true, true, NOW()),
('accountant@roshanalglobal.com', 'Accountant', 'accountant', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeXt1jPuMtXM6EoYW', true, true, NOW()),
('vendor@roshanalglobal.com', 'Test Vendor', 'vendor', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeXt1jPuMtXM6EoYW', true, true, NOW()),
('customer@test.com', 'Test Customer', 'customer', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeXt1jPuMtXM6EoYW', true, true, NOW())
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  email_verified = EXCLUDED.email_verified,
  is_active = EXCLUDED.is_active;

-- Verify the users were created
SELECT email, name, role, email_verified, is_active FROM users WHERE email IN (
  'admin@roshanalglobal.com',
  'manager@roshanalglobal.com',
  'accountant@roshanalglobal.com',
  'vendor@roshanalglobal.com',
  'customer@test.com'
);