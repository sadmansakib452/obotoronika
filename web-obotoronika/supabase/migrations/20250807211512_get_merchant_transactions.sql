grant select on public.user_profiles to anon;
grant select on public.user_profiles to authenticated;

CREATE OR REPLACE FUNCTION get_merchant_transactions(
  p_merchant_id INTEGER,
  p_search TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  sub_order_id TEXT,
  transaction_id TEXT,
  merchant_earning NUMERIC,
  customer JSONB,
  payment_method TEXT,
  transaction_status TEXT,
  order_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    mo.sub_order_id,
    t.transaction_id,
    SUM(oi.price * oi.quantity) AS merchant_earning,
    jsonb_build_object(
      'name', u.raw_user_meta_data ->> 'name',
      'email', u.email,
      'phone', u.phone
    ) AS customer,
    t.payment_method,
    t.status AS transaction_status,
    o.created_at AS order_date
  FROM merchant_orders mo
  JOIN orders o ON mo.order_id = o.id
  JOIN transactions t ON t.order_id = o.id
  JOIN order_items oi ON oi.merchant_order_id = mo.id
  JOIN user_profiles u ON o.user_id = u.id
  WHERE mo.merchant_id = p_merchant_id
    AND (
      p_search IS NULL OR
      t.transaction_id ILIKE '%' || p_search || '%' OR
      mo.sub_order_id ILIKE '%' || p_search || '%' OR
      (u.raw_user_meta_data ->> 'name') ILIKE '%' || p_search || '%'
    )
  GROUP BY 
    mo.sub_order_id, 
    t.transaction_id, 
    u.raw_user_meta_data ->> 'name',  -- ✅ group by extracted name
    u.email, 
    u.phone,
    t.payment_method, 
    t.status, 
    o.created_at
  ORDER BY o.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;




CREATE OR REPLACE FUNCTION get_merchant_transactions_count(
  p_merchant_id INTEGER,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (count BIGINT)
AS $$
BEGIN
  RETURN QUERY
  SELECT COUNT(*)
  FROM merchant_orders mo
  JOIN orders o ON mo.order_id = o.id
  JOIN transactions t ON t.order_id = o.id
  JOIN user_profiles u ON o.user_id = u.id
  WHERE mo.merchant_id = p_merchant_id
    AND (
      p_search IS NULL OR
      t.transaction_id ILIKE '%' || p_search || '%' OR
      mo.sub_order_id ILIKE '%' || p_search || '%' OR
      u.raw_user_meta_data ->> 'full_name' ILIKE '%' || p_search || '%'
    );
END;
$$ LANGUAGE plpgsql STABLE;
