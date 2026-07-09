-- =====================================================
-- Migration: Add cancellation support to refunds table
-- Purpose: Allows refunds table to handle both refund
--          and cancellation requests
-- =====================================================

-- Step 1: Add refund_type column (if not exists)
-- 'refund' for product returns after delivery
-- 'cancellation' for canceling before delivery
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'refunds' AND column_name = 'refund_type'
    ) THEN
        ALTER TABLE refunds
        ADD COLUMN refund_type TEXT NOT NULL DEFAULT 'refund'
        CHECK (refund_type IN ('refund', 'cancellation'));
    END IF;
END$$;

-- Step 2: Add order_id column (nullable, for cancellations without invoices)
-- For COD cancellations, invoice may not exist, so direct order reference is needed
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'refunds' AND column_name = 'order_id'
    ) THEN
        ALTER TABLE refunds
        ADD COLUMN order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL;
    END IF;
END$$;

-- Step 3: Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_refunds_refund_type ON refunds(refund_type);
CREATE INDEX IF NOT EXISTS idx_refunds_order_id ON refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_type_status ON refunds(refund_type, status);
