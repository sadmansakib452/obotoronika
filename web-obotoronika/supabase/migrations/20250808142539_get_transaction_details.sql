CREATE OR REPLACE FUNCTION get_transaction_details(
  p_transaction_id TEXT
)
RETURNS TABLE (
  sub_order_id TEXT,
  transaction_id TEXT,
  merchant_earning NUMERIC,
  customer JSONB,
  line_items JSONB,
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

    -- Customer info
    jsonb_build_object(
      'name', u.raw_user_meta_data ->> 'name',
      'email', u.email,
      'phone', u.phone
    ) AS customer,

    -- Line items
    jsonb_agg(
      jsonb_build_object(
        'product_name', p.title,
        'quantity', oi.quantity,
        'price', oi.price,
        'subtotal', (oi.price * oi.quantity),
        'product_id', oi.product_id
      )
    ) AS line_items,

    t.payment_method,
    t.status AS transaction_status,
    o.created_at AS order_date

  FROM merchant_orders mo
  JOIN orders o ON mo.order_id = o.id
  JOIN transactions t ON t.order_id = o.id
  JOIN order_items oi ON oi.merchant_order_id = mo.id
  JOIN products p ON p.id = oi.product_id
  JOIN user_profiles u ON o.user_id = u.id

  WHERE t.transaction_id = p_transaction_id

  GROUP BY 
    mo.sub_order_id,
    t.transaction_id,
    u.raw_user_meta_data ->> 'name',
    u.email,
    u.phone,
    t.payment_method,
    t.status,
    o.created_at

  ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;
