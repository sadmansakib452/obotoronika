-- Users Table

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- Links to Supabase auth
    avatar TEXT,
    address TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('super_admin', 'admin', 'manager', 'customer', 'seller')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'banned')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update the updated_at column
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Enable Row-Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all users to insert their own profile
CREATE POLICY "Users can create their own profile"
ON users
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile except role and status
CREATE POLICY "Users can update their own profile except role and status"
ON users
FOR UPDATE
USING (
    auth.uid() = id 
    AND role = current_setting('request.jwt.claims')::json->>'role'
    AND status = current_setting('request.jwt.claims')::json->>'status'
)
WITH CHECK (
    auth.uid() = id
    AND role = current_setting('request.jwt.claims')::json->>'role'
    AND status = current_setting('request.jwt.claims')::json->>'status'
);

-- Policy: Only super_admin and admin can update role and status
CREATE POLICY "Admins can update role and status"
ON users
FOR UPDATE
USING (
    current_setting('request.jwt.claims')::json->>'role' IN ('super_admin', 'admin')
)
WITH CHECK (
    current_setting('request.jwt.claims')::json->>'role' IN ('super_admin', 'admin')
);

-- Policy: Prevent admins from modifying super_admin accounts
CREATE POLICY "Admins cannot change super_admin accounts"
ON users
FOR UPDATE
USING (
    NOT EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = id AND u.role = 'super_admin'
    )
    OR current_setting('request.jwt.claims')::json->>'role' = 'super_admin'
);

-- Drop existing select policy
DROP POLICY IF EXISTS "Any user can get user by id" ON users;

-- Create new policy for viewing users
CREATE POLICY "Users access control for viewing profiles"
ON users
FOR SELECT
USING (
    -- Allow admins, super_admins, and managers to view all users
    current_setting('request.jwt.claims')::json->>'role' IN ('super_admin', 'admin', 'manager')
    OR
    -- Regular users can only view their own profile
    auth.uid() = id
);

-- TODO: need to prevent update role and status of super_admin and admin