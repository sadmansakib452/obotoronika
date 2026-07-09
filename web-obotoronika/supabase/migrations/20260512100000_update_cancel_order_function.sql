-- Update cancel_order_and_restore_stock function to allow 'processing' status
-- Previous: Only allowed 'pending' and 'awaiting_payment'
-- Now: Allows 'processing', 'pending', and 'awaiting_payment'
-- Also fix: ensure PostgREST can find the function with named parameter

CREATE OR REPLACE FUNCTION cancel_order_and_restore_stock(p_order_id BIGINT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  item RECORD;
  order_status order_status;
BEGIN
  -- Get current order status
  SELECT status INTO order_status
  FROM orders
  WHERE id = p_order_id;

  IF order_status IS NULL THEN
    RETURN 'Order not found.';
  END IF;

  -- Allow canceling: pending, awaiting_payment, AND processing orders
  IF order_status NOT IN ('pending', 'awaiting_payment', 'processing') THEN
    RETURN 'Order is not eligible for cancellation. Current status: ' || order_status::TEXT;
  END IF;

  -- Restore stock for each item
  FOR item IN
    SELECT product_id, quantity
    FROM order_items
    WHERE order_id = p_order_id
  LOOP
    UPDATE products
    SET current_stock = current_stock + item.quantity
    WHERE id = item.product_id;
  END LOOP;

  -- Update order status to canceled
  UPDATE orders
  SET status = 'canceled',
      updated_at = NOW()
  WHERE id = p_order_id;

  RETURN 'Order canceled and stock restored.';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cancel_order_and_restore_stock TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_order_and_restore_stock TO anon;