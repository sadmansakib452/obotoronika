-- =====================================================
-- Updated: cancel_order_and_restore_stock function
-- Fix: Allow 'processing' status, fix parameter name
-- =====================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS cancel_order_and_restore_stock(BIGINT);

-- Create updated function with fixed parameter name and 'processing' status support
CREATE FUNCTION cancel_order_and_restore_stock(p_order_id BIGINT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_order_status TEXT;
BEGIN
  -- Get current order status
  SELECT o.status INTO v_order_status
  FROM orders o
  WHERE o.id = p_order_id;

  IF v_order_status IS NULL THEN
    RETURN 'Order not found.';
  END IF;

  -- Allow canceling: pending, awaiting_payment, AND processing orders
  IF v_order_status NOT IN ('pending', 'awaiting_payment', 'processing') THEN
    RETURN 'Order is not eligible for cancellation. Current status: ' || v_order_status;
  END IF;

  -- Restore stock for each item
  FOR v_item IN
    SELECT product_id, quantity
    FROM order_items
    WHERE order_id = p_order_id
  LOOP
    UPDATE products
    SET current_stock = current_stock + v_item.quantity
    WHERE id = v_item.product_id;
  END LOOP;

  -- Update order status to canceled
  UPDATE orders
  SET status = 'canceled',
      updated_at = NOW()
  WHERE id = p_order_id;

  RETURN 'Order canceled and stock restored.';
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION cancel_order_and_restore_stock TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_order_and_restore_stock TO anon;
GRANT EXECUTE ON FUNCTION cancel_order_and_restore_stock TO service_role;