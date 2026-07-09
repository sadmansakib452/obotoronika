DROP FUNCTION IF EXISTS get_invoices_by_merchant(integer, integer, integer, text, numeric, numeric);

CREATE OR REPLACE FUNCTION get_invoices_by_merchant(
  p_merchant_id INTEGER,
  p_limit INTEGER,
  p_offset INTEGER,
  p_search TEXT,
  p_min_subtotal NUMERIC,
  p_max_subtotal NUMERIC
)
RETURNS TABLE (
  invoice_id BIGINT,
  invoice_reference TEXT,
  invoice_status invoice_status,
  subtotal NUMERIC,
  shipping_cost NUMERIC,
  total NUMERIC,
  issued_at TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  external_order_id TEXT,
  order_status order_status,
  sub_order_id TEXT,
  merchant_order_status order_status,
  shipping_method TEXT,
  estimated_delivery_date TIMESTAMPTZ,
  customer JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    inv.id,
    inv.invoice_id,
    inv.status,
    inv.subtotal,
    inv.shipping_cost,
    inv.total,
    inv.issued_at,
    inv.due_date,
    o.order_id,
    o.status,
    mo.sub_order_id,
    mo.status,
    mo.shipping_method,
    mo.estimated_delivery_date,
    jsonb_build_object(
      'name', u.raw_user_meta_data ->> 'name',
      'email', u.email,
      'phone', u.phone,
      'avatar_url', u.raw_user_meta_data ->> 'avatar_url'
    ) AS customer
  FROM invoices inv
  JOIN orders o ON inv.order_id = o.id
  JOIN merchant_orders mo ON inv.merchant_order_id = mo.id
  JOIN user_profiles u ON o.user_id = u.id
  WHERE inv.merchant_id = p_merchant_id
    AND (
      p_search IS NULL OR
      inv.invoice_id ILIKE '%' || p_search || '%' OR
      o.order_id ILIKE '%' || p_search || '%' OR
      mo.sub_order_id ILIKE '%' || p_search || '%' OR
      u.email ILIKE '%' || p_search || '%' OR
      u.phone ILIKE '%' || p_search || '%' OR
      u.raw_user_meta_data ->> 'name' ILIKE '%' || p_search || '%'
    )
    AND (p_min_subtotal IS NULL OR inv.subtotal >= p_min_subtotal)
    AND (p_max_subtotal IS NULL OR inv.subtotal <= p_max_subtotal)
  ORDER BY inv.issued_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;
