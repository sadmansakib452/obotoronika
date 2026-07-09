CREATE SEQUENCE IF NOT EXISTS invoice_id_seq;

CREATE OR REPLACE FUNCTION create_transaction_and_invoices(
  p_order_id bigint,
  p_total_amount numeric,
  p_payment_method text, -- still accepted, but not used in insert
  p_items jsonb
) RETURNS json AS $$
DECLARE
  v_transaction_id text := 'TXN' || to_char(now(), 'YYYYMMDDHH24MISS') || lpad(floor(random() * 1000)::text, 3, '0');
  v_transaction_record_id bigint;
  v_invoices jsonb[] := '{}';
  v_item RECORD;
  v_subitem jsonb;
  v_merchant_id integer;
  v_merchant_order_id bigint;
  v_subtotal numeric;
  v_shipping_cost numeric;
  v_invoice_id text;
  v_date_part text;
  v_sequence int;
BEGIN
  -- Create transaction
  INSERT INTO transactions (
    order_id,
    transaction_id,
    amount,
    status,
    payment_details,
    created_at,
    updated_at
  )
  VALUES (
    p_order_id,
    v_transaction_id,
    p_total_amount,
    'pending',
    NULL,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_transaction_record_id;

  -- Create invoices for each merchant
  FOR v_item IN (
    SELECT
      (item->>'merchant_id')::integer AS merchant_id,
      jsonb_agg(item) AS items
    FROM jsonb_array_elements(p_items) AS item
    GROUP BY item->>'merchant_id'
  )
  LOOP
    v_merchant_id := v_item.merchant_id;
    v_subtotal := 0;
    v_shipping_cost := 0;

    -- Calculate subtotal and shipping cost
    FOR v_subitem IN SELECT * FROM jsonb_array_elements(v_item.items)
    LOOP
      v_subtotal := v_subtotal + ((v_subitem->>'price')::numeric * (v_subitem->>'quantity')::integer);
      v_shipping_cost := v_shipping_cost + (v_subitem->>'shipping_cost')::numeric;
    END LOOP;

    -- Find merchant_order_id
    SELECT id INTO v_merchant_order_id
    FROM merchant_orders
    WHERE order_id = p_order_id AND merchant_id = v_merchant_id
    LIMIT 1;

    IF v_merchant_order_id IS NULL THEN
      RAISE EXCEPTION 'Merchant order not found for merchant_id % and order_id %', v_merchant_id, p_order_id;
    END IF;

    -- Generate unique invoice_id
    v_date_part := to_char(now(), 'YYYYMMDD');
    v_sequence := nextval('invoice_id_seq');
    v_invoice_id := 'INV-' || v_date_part || '-' || lpad(v_sequence::text, 4, '0');

    -- Insert invoice
    INSERT INTO invoices (
      order_id,
      merchant_order_id,
      invoice_id,
      merchant_id,
      subtotal,
      shipping_cost,
      total,
      status,
      issued_at,
      due_date,
      created_at,
      updated_at
    )
    VALUES (
      p_order_id,
      v_merchant_order_id,
      v_invoice_id,
      v_merchant_id,
      v_subtotal,
      v_shipping_cost,
      v_subtotal + v_shipping_cost,
      'unpaid',
      NOW(),
      NOW() + INTERVAL '7 days',
      NOW(),
      NOW()
    );

    -- Append invoice info to return object
    v_invoices := v_invoices || jsonb_build_object(
      'merchant_id', v_merchant_id,
      'invoice_id', v_invoice_id
    );
  END LOOP;

  -- Return result
  RETURN jsonb_build_object(
    'transaction_id', v_transaction_id,
    'invoices', v_invoices
  );
END;
$$ LANGUAGE plpgsql;

-- Grant permission to authenticated users
GRANT EXECUTE ON FUNCTION create_transaction_and_invoices(bigint, numeric, text, jsonb) TO authenticated;

