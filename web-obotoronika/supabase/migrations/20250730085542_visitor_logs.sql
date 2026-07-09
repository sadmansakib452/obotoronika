-- Drop the existing table (if it exists)
DROP TABLE IF EXISTS visitor_logs;

-- Create the table with a unique constraint
CREATE TABLE visitor_logs (
  id SERIAL PRIMARY KEY,
  ip_address VARCHAR(45) NOT NULL,
  country VARCHAR(100),
  region VARCHAR(100),
  city VARCHAR(100),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  user_agent TEXT,
  page_visited TEXT[],
  referrer TEXT,
  device_type VARCHAR(50),
  session_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_session_ip UNIQUE (session_id, ip_address)
);