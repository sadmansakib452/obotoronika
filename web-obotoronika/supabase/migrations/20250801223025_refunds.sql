-- =====================================================
-- Refunds Module - Complete Setup
-- Includes: Table schema, RPC functions, permissions
-- =====================================================

-- Step 1: Create refund_status enum type (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refund_status') THEN
        CREATE TYPE refund_status AS ENUM ('pending', 'paid', 'approved', 'rejected');
    END IF;
END$$;

-- Step 2: Add rejected status to existing enum (if needed)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'refund_status') THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumlabel = 'rejected'
            AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'refund_status')
        ) THEN
            ALTER TYPE refund_status ADD VALUE 'rejected';
        END IF;
    END IF;
END$$;

-- Step 3: Create refunds table (if not exists)
CREATE TABLE IF NOT EXISTS refunds (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    transaction_id BIGINT REFERENCES transactions(id) ON DELETE SET NULL,
    refund_id TEXT UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    reason TEXT,
    status refund_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    admin_note TEXT,
    refund_ref_id TEXT,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_refunds_invoice_id ON refunds(invoice_id);
CREATE INDEX IF NOT EXISTS idx_refunds_transaction_id ON refunds(transaction_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status_created ON refunds(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refunds_ref_id ON refunds(refund_ref_id);

-- =====================================================
-- RPC Functions for Refunds
-- =====================================================

-- Step 5: get_refunds_list function
DROP FUNCTION IF EXISTS get_refunds_list(TEXT, TEXT, INTEGER, INTEGER);

CREATE FUNCTION get_refunds_list(
  p_search TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,
  refund_id TEXT,
  amount NUMERIC,
  reason TEXT,
  status TEXT,
  admin_note TEXT,
  refund_ref_id TEXT,
  order_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  original_transaction_id TEXT,
  original_amount NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.refund_id::TEXT,
    r.amount,
    r.reason::TEXT,
    r.status::TEXT,
    r.admin_note::TEXT,
    r.refund_ref_id::TEXT,
    o.order_id::TEXT,
    COALESCE((u.raw_user_meta_data ->> 'name')::TEXT, '') AS customer_name,
    u.email::TEXT AS customer_email,
    u.phone::TEXT AS customer_phone,
    t.transaction_id::TEXT AS original_transaction_id,
    t.amount AS original_amount,
    r.created_at,
    r.updated_at
  FROM refunds r
  JOIN invoices inv ON r.invoice_id = inv.id
  JOIN orders o ON inv.order_id = o.id
  JOIN transactions t ON r.transaction_id = t.id
  JOIN user_profiles u ON o.user_id = u.id
  WHERE (
      p_search IS NULL OR
      r.refund_id ILIKE '%' || p_search || '%' OR
      o.order_id ILIKE '%' || p_search || '%' OR
      (u.raw_user_meta_data ->> 'name') ILIKE '%' || p_search || '%' OR
      u.email ILIKE '%' || p_search || '%' OR
      t.transaction_id ILIKE '%' || p_search || '%'
    )
    AND (
      p_status IS NULL OR r.status::TEXT = p_status
    )
  ORDER BY r.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Step 6: get_refunds_count function
DROP FUNCTION IF EXISTS get_refunds_count(TEXT, TEXT);

CREATE FUNCTION get_refunds_count(
  p_search TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL
)
RETURNS TABLE (count BIGINT)
AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)
  FROM refunds r
  JOIN invoices inv ON r.invoice_id = inv.id
  JOIN orders o ON inv.order_id = o.id
  JOIN transactions t ON r.transaction_id = t.id
  JOIN user_profiles u ON o.user_id = u.id
  WHERE (
      p_search IS NULL OR
      r.refund_id ILIKE '%' || p_search || '%' OR
      o.order_id ILIKE '%' || p_search || '%' OR
      (u.raw_user_meta_data ->> 'name') ILIKE '%' || p_search || '%' OR
      u.email ILIKE '%' || p_search || '%' OR
      t.transaction_id ILIKE '%' || p_search || '%'
    )
    AND (
      p_status IS NULL OR r.status::TEXT = p_status
    );
END;
$$ LANGUAGE plpgsql;

-- Step 7: get_refund_details function
DROP FUNCTION IF EXISTS get_refund_details(BIGINT);

CREATE FUNCTION get_refund_details(p_refund_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  refund_id TEXT,
  amount NUMERIC,
  reason TEXT,
  status TEXT,
  admin_note TEXT,
  refund_ref_id TEXT,
  order_id TEXT,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address JSONB,
  original_transaction_id TEXT,
  original_amount NUMERIC,
  payment_method TEXT,
  invoice_id TEXT,
  invoice_total NUMERIC,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  processed_by_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id,
    r.refund_id::TEXT,
    r.amount,
    r.reason::TEXT,
    r.status::TEXT,
    r.admin_note::TEXT,
    r.refund_ref_id::TEXT,
    o.order_id::TEXT,
    COALESCE((u.raw_user_meta_data ->> 'name')::TEXT, '') AS customer_name,
    u.email::TEXT AS customer_email,
    u.phone::TEXT AS customer_phone,
    o.shipping_address AS customer_address,
    t.transaction_id::TEXT AS original_transaction_id,
    t.amount AS original_amount,
    t.payment_method::TEXT,
    inv.invoice_id::TEXT,
    inv.total AS invoice_total,
    r.created_at,
    r.updated_at,
    COALESCE(au.raw_user_meta_data ->> 'name', '')::TEXT AS processed_by_name
  FROM refunds r
  JOIN invoices inv ON r.invoice_id = inv.id
  JOIN orders o ON inv.order_id = o.id
  JOIN transactions t ON r.transaction_id = t.id
  JOIN user_profiles u ON o.user_id = u.id
  LEFT JOIN auth.users au ON r.updated_by = au.id
  WHERE r.id = p_refund_id;
END;
$$ LANGUAGE plpgsql;

-- Step 8: update_refund_status function
DROP FUNCTION IF EXISTS update_refund_status(BIGINT, TEXT, TEXT, UUID);

CREATE FUNCTION update_refund_status(
  p_refund_id BIGINT,
  p_new_status TEXT,
  p_admin_note TEXT DEFAULT NULL,
  p_updated_by UUID DEFAULT NULL
)
RETURNS JSONB
AS $$
DECLARE
  v_current_status TEXT;
  v_refund_amount NUMERIC;
  v_result JSONB;
BEGIN
  -- Get current refund details
  SELECT status, amount INTO v_current_status, v_refund_amount
  FROM refunds
  WHERE id = p_refund_id;

  -- Check if refund exists
  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Refund not found');
  END IF;

  -- Validate status transition
  IF v_current_status NOT IN ('pending') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Refund can only be updated when status is pending. Current status: ' || v_current_status
    );
  END IF;

  -- Validate new status
  IF p_new_status NOT IN ('approved', 'rejected') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Invalid status. Must be approved or rejected');
  END IF;

  -- Update the refund record
  UPDATE refunds
  SET
    status = p_new_status::refund_status,
    admin_note = COALESCE(p_admin_note, admin_note),
    updated_by = COALESCE(p_updated_by, updated_by),
    updated_at = NOW()
  WHERE id = p_refund_id;

  -- If approved, also update the invoice status
  IF p_new_status = 'approved' THEN
    UPDATE invoices
    SET status = 'refunded', updated_at = NOW()
    WHERE id = (SELECT invoice_id FROM refunds WHERE id = p_refund_id);
  END IF;

  -- Return success response
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Refund status updated to ' || p_new_status,
    'data', jsonb_build_object(
      'refund_id', p_refund_id,
      'new_status', p_new_status,
      'admin_note', p_admin_note
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Grant permissions
GRANT EXECUTE ON FUNCTION get_refunds_list TO authenticated;
GRANT EXECUTE ON FUNCTION get_refunds_list TO anon;
GRANT EXECUTE ON FUNCTION get_refunds_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_refunds_count TO anon;
GRANT EXECUTE ON FUNCTION get_refund_details TO authenticated;
GRANT EXECUTE ON FUNCTION get_refund_details TO anon;
GRANT EXECUTE ON FUNCTION update_refund_status TO authenticated;
GRANT EXECUTE ON FUNCTION update_refund_status TO anon;