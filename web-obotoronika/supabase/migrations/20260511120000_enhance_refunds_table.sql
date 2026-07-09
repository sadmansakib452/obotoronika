-- Enhance refunds table for admin management
-- Added: rejected status, admin_note, refund_ref_id, updated_by

-- Step 1: Add rejected status to enum
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'rejected'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'refund_status')
    ) THEN
        ALTER TYPE refund_status ADD VALUE 'rejected';
    END IF;
END$$;

-- Step 2: Add missing columns
ALTER TABLE refunds
ADD COLUMN IF NOT EXISTS admin_note TEXT,
ADD COLUMN IF NOT EXISTS refund_ref_id TEXT,
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Step 3: Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_refunds_status_created
ON refunds(status, created_at DESC);

-- Step 4: Create index for refund_ref_id lookups
CREATE INDEX IF NOT EXISTS idx_refunds_ref_id
ON refunds(refund_ref_id);