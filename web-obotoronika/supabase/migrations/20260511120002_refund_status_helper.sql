-- RPC function to safely update refund status with validation

CREATE OR REPLACE FUNCTION update_refund_status(
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
  v_original_amount NUMERIC;
  v_result JSONB;
BEGIN
  -- Get current refund details
  SELECT status, amount INTO v_current_status, v_refund_amount
  FROM refunds
  WHERE id = p_refund_id;

  -- Check if refund exists
  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Refund not found'
    );
  END IF;

  -- Validate status transition
  -- Only allow: pending -> approved OR pending -> rejected
  IF v_current_status NOT IN ('pending') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Refund can only be updated when status is pending. Current status: ' || v_current_status
    );
  END IF;

  -- Validate new status
  IF p_new_status NOT IN ('approved', 'rejected') THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invalid status. Must be approved or rejected'
    );
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
    SET
      status = 'refunded',
      updated_at = NOW()
    WHERE id = (SELECT invoice_id FROM refunds WHERE id = p_refund_id);
  END IF;

  -- Return success response
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Refund status updated to ' || p_new_status,
    'data', jsonb_build_object(
      'refund_id', p_refund_id,
      'new_status', p_new_status,
      'admin_note', p_admin_note
    )
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Grant permissions
GRANT EXECUTE ON FUNCTION update_refund_status TO authenticated;