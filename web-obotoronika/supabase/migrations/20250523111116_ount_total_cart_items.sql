CREATE OR REPLACE FUNCTION count_total_cart_items(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(quantity), 0)
    FROM cart_items
    WHERE user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql STABLE;
