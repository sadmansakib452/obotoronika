CREATE OR REPLACE FUNCTION get_reviewable_products_paginated(
  _user_id UUID,
  _limit INT DEFAULT 10,
  _offset INT DEFAULT 0
)
RETURNS TABLE (
  id BIGINT,             -- order_items.id
  product_id UUID,
  order_id BIGINT,
  status order_status,
  title TEXT,
  thumbnail TEXT,
  price NUMERIC,
  variants JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    oi.id,
    oi.product_id,
    oi.order_id,
    o.status,
    p.title,
    p.thumbnail,
    oi.price,
    oi.variants
  FROM order_items oi
  JOIN orders o ON oi.order_id = o.id
  JOIN products p ON oi.product_id = p.id
  WHERE o.user_id = _user_id
    AND o.status IN ('delivered', 'completed')
    AND NOT EXISTS (
      SELECT 1
      FROM reviews r
      WHERE r.user_id = _user_id
        AND r.order_item_id = oi.id -- ✅ Correctly filters out already-reviewed items
    )
  ORDER BY o.created_at DESC
  LIMIT _limit OFFSET _offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
