CREATE OR REPLACE FUNCTION get_merchant_order_details(p_order_id text, p_merchant_id integer)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT json_build_object(
      'order', json_build_object(
        'id', o.id,
        'order_id', o.order_id,
        'user_id', o.user_id,
        'status', o.status,
        'total_amount', o.total_amount,
        'shipping_address', o.shipping_address->>'address', -- adjust as needed
        'billing_address', o.billing_address,
        'payment_method', o.payment_method,
        'payment_info', o.payment_info,
        'notes', o.notes,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'user', json_build_object(
          'id', eu.id,
          'name', eu.raw_user_meta_data->>'name',
          'email', eu.email,
          'phone', eu.phone
        ),
        'items', (
          SELECT json_agg(
            json_build_object(
              'id', oi.id,
              'order_id', oi.order_id,
              'product_id', oi.product_id,
              'variants', oi.variants,
              'quantity', oi.quantity,
              'price', oi.price,
              'created_at', oi.created_at,
              'updated_at', oi.updated_at,
              'merchant_order_id', oi.merchant_order_id,
              'product', json_build_object(
                'title', p.title,
                'thumbnail', p.thumbnail
              )
            )
          )
          FROM order_items oi
          JOIN products p ON p.id = oi.product_id
          JOIN merchant_orders mo ON mo.id = oi.merchant_order_id
          WHERE oi.order_id = o.id
            AND mo.merchant_id = p_merchant_id
        )
      )
    )
    FROM orders o
    LEFT JOIN extended_users eu ON o.user_id = eu.id
    WHERE o.order_id = p_order_id
  );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_merchant_order_details(text, integer) TO authenticated;
