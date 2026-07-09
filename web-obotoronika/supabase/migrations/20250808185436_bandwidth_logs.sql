-- Table to log bandwidth usage per request
CREATE TABLE IF NOT EXISTS bandwidth_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NULL,                   -- Optional: link to user (if available)
    ip_address INET NOT NULL,            -- IP address of client
    method TEXT NOT NULL,                 -- HTTP method: GET, POST, etc.
    url TEXT NOT NULL,                    -- Requested URL/path
    request_size_bytes BIGINT NOT NULL,  -- Size of request body in bytes
    response_size_bytes BIGINT NOT NULL, -- Size of response body in bytes
    status_code INTEGER NOT NULL,        -- HTTP response status code
    user_agent TEXT,                     -- Client user agent string
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index to query by user efficiently
CREATE INDEX IF NOT EXISTS idx_bandwidth_logs_user_id ON bandwidth_logs(user_id);

-- Index to query by date
CREATE INDEX IF NOT EXISTS idx_bandwidth_logs_created_at ON bandwidth_logs(created_at);
