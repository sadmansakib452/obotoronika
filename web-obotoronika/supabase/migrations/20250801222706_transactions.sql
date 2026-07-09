CREATE TABLE IF NOT EXISTS transactions (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    transaction_id TEXT UNIQUE NOT NULL,        -- Unique transaction reference (e.g., TXN123456)
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending',     -- Fixed: added type
    payment_method TEXT,                        -- e.g., cod, card, bkash
    payment_details JSONB,                      -- Gateway response or additional info
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
