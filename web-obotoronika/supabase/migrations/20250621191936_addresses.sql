CREATE TABLE IF NOT EXISTS addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    fullname TEXT NOT NULL,
    phone TEXT NOT NULL,
    region TEXT NOT NULL,
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    address_type TEXT DEFAULT 'home' CHECK (address_type IN ('home', 'office')),
    is_default BOOLEAN DEFAULT FALSE,
    is_billing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);