CREATE TABLE IF NOT EXISTS verifications (
    id BIGSERIAL PRIMARY KEY,
    email_or_phone TEXT NOT NULL UNIQUE,
    code TEXT, -- Verification code
    is_verified BOOLEAN DEFAULT FALSE, -- Indicates if the verification is completed
    expires_at TIMESTAMP, -- Expiration date for the verification code
    created_at TIMESTAMP DEFAULT NOW(), -- Timestamp when the record was created
    updated_at TIMESTAMP DEFAULT NOW() -- Timestamp when the record was last updated
);


ALTER TABLE verifications
ALTER COLUMN expires_at TYPE timestamptz
USING expires_at AT TIME ZONE 'Asia/Dhaka';
