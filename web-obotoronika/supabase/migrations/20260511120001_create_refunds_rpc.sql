-- RPC functions for refunds management

-- Function to get paginated refunds list with order and customer details
-- For admin/manager use - shows all refunds across all merchants

CREATE OR REPLACE FUNCTION get_refunds_list(
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
    r.refund_id,
    r.amount,
    r.reason,
    r.status::TEXT,
    r.admin_note,
    r.refund_ref_id,
    o.order_id,
    u.raw_user_meta_data ->> 'name' AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    t.transaction_id AS original_transaction_id,
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
$$ LANGUAGE plpgsql STABLE;


-- Function to get total count of refunds (for pagination)
CREATE OR REPLACE FUNCTION get_refunds_count(
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
$$ LANGUAGE plpgsql STABLE;


-- Function to get single refund details
CREATE OR REPLACE FUNCTION get_refund_details(
  p_refund_id BIGINT
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
    r.refund_id,
    r.amount,
    r.reason,
    r.status::TEXT,
    r.admin_note,
    r.refund_ref_id,
    o.order_id,
    u.raw_user_meta_data ->> 'name' AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    o.shipping_address AS customer_address,
    t.transaction_id AS original_transaction_id,
    t.amount AS original_amount,
    t.payment_method,
    inv.invoice_id,
    inv.total AS invoice_total,
    r.created_at,
    r.updated_at,
    au.raw_user_meta_data ->> 'name' AS processed_by_name
  FROM refunds r
  JOIN invoices inv ON r.invoice_id = inv.id
  JOIN orders o ON inv.order_id = o.id
  JOIN transactions t ON r.transaction_id = t.id
  JOIN user_profiles u ON o.user_id = u.id
  LEFT JOIN auth.users au ON r.updated_by = au.id
  WHERE r.id = p_refund_id;
END;
$$ LANGUAGE plpgsql STABLE;


-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_refunds_list TO authenticated;
GRANT EXECUTE ON FUNCTION get_refunds_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_refund_details TO authenticated;