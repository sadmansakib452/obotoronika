-- ========================================================
-- Refund System Setup - Chapter 1 Step 1.1
-- Purpose: Create return_requests and refund_config tables
-- Created: 2026-01-26
-- ========================================================

-- --------------------------------------------------------
-- Part 1: Create ENUM types for return system
-- --------------------------------------------------------

-- Return request type: cancellation (before delivery) or return (after delivery)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'return_type') THEN
        CREATE TYPE return_type AS ENUM (
            'cancellation',  -- Customer cancels before shipment/delivery
            'return'          -- Customer returns after delivery
        );
    END IF;
END$$;


-- Return request status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'return_status') THEN
        CREATE TYPE return_status AS ENUM (
            'pending',        -- Awaiting admin review
            'approved',       -- Admin approved, waiting for product return
            'rejected',      -- Admin rejected the request
            'received',      -- Product received by merchant
            'processing',    -- Refund is being processed
            'completed',     -- Refund completed successfully
            'failed',        -- Refund failed
            'withdrawn'      -- Customer withdrew the request
        );
    END IF;
END$$;


-- Refund method type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refund_method') THEN
        CREATE TYPE refund_method AS ENUM (
            'original_payment',  -- Refund to original payment method
            'store_credit'       -- Refund as store credit/wallet
        );
    END IF;
END$$;


-- --------------------------------------------------------
-- Part 2: Create return_requests table
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS return_requests (
    id BIGSERIAL PRIMARY KEY,

    -- Reference to original order
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

    -- User who requested the return
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Request type: cancellation or return
    type return_type NOT NULL DEFAULT 'return',

    -- Current status of the return request
    status return_status NOT NULL DEFAULT 'pending',

    -- Reason for return (required)
    reason TEXT NOT NULL,

    -- Additional description from customer
    description TEXT,

    -- Images uploaded by customer (stored as JSON array)
    images JSONB DEFAULT '[]'::jsonb,

    -- Amount to be refunded (calculated based on items)
    refund_amount NUMERIC(10, 2),

    -- Refund method preference
    method refund_method DEFAULT 'original_payment',

    -- Admin notes (filled when approved/rejected)
    admin_notes TEXT,

    -- Who approved/rejected (admin user ID)
    processed_by UUID REFERENCES auth.users(id),

    -- When the request was processed
    processed_at TIMESTAMP WITH TIME ZONE,

    -- Reference to the refund record (if processed)
    refund_id BIGINT REFERENCES refunds(id),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON return_requests(status);
CREATE INDEX IF NOT EXISTS idx_return_requests_type ON return_requests(type);
CREATE INDEX IF NOT EXISTS idx_return_requests_created_at ON return_requests(created_at DESC);


-- --------------------------------------------------------
-- Part 3: Create refund_config table
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS refund_config (
    id SERIAL PRIMARY KEY,

    -- Configuration key (unique)
    key TEXT UNIQUE NOT NULL,

    -- Configuration value (stored as JSON for flexibility)
    value JSONB NOT NULL,

    -- Human-readable description
    description TEXT,

    -- Whether this config is active
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for key lookup
CREATE INDEX IF NOT EXISTS idx_refund_config_key ON refund_config(key);


-- --------------------------------------------------------
-- Part 4: Insert default configuration values
-- --------------------------------------------------------

INSERT INTO refund_config (key, value, description, is_active) VALUES
    -- Timing configuration
    ('timing.return_days', '{"value": 7, "unit": "days"}', 'Number of days customer can return after delivery', true),
    ('timing.cancellation_days', '{"value": 1, "unit": "days"}', 'Number of days before shipment when cancellation is allowed', true),
    ('timing.refund_processing_days', '{"value": 7, "unit": "days"}', 'Expected days to process refund', true),

    -- Order status configuration
    ('conditions.cancellation_allowed_status', '{"statuses": ["pending", "processing"]}', 'Order statuses where cancellation is allowed', true),
    ('conditions.return_allowed_status', '{"statuses": ["delivered", "completed"]}', 'Order statuses where return is allowed', true),

    -- Refund rules
    ('rules.deduct_shipping_cost', '{"value": false}', 'Whether to deduct shipping cost from refund', true),
    ('rules.deduct_gateway_commission', '{"value": false}', 'Whether to deduct gateway commission from refund', true),
    ('rules.allow_partial_refund', '{"value": true}', 'Allow partial refunds for specific items', true),
    ('rules.allow_store_credit', '{"value": false}', 'Allow refund as store credit', true),

    -- Payment gateway configuration
    ('gateways.sslcommerz.enabled', '{"value": true}', 'Enable SSLCommerz refund processing', true),
    ('gateways.sslcommerz.refund_window_days', '{"value": 90}', 'Maximum days after payment to process refund', true),
    ('gateways.bkash.enabled', '{"value": false}', 'Enable bKash refund processing', true)

ON CONFLICT (key) DO NOTHING;


-- --------------------------------------------------------
-- Part 5: Create update trigger for updated_at
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to return_requests table
DROP TRIGGER IF EXISTS update_return_requests_updated_at ON return_requests;
CREATE TRIGGER update_return_requests_updated_at
    BEFORE UPDATE ON return_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger to refund_config table
DROP TRIGGER IF EXISTS update_refund_config_updated_at ON refund_config;
CREATE TRIGGER update_refund_config_updated_at
    BEFORE UPDATE ON refund_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ========================================================
-- End of migration: refund_system_setup.sql
-- ========================================================