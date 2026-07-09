CREATE OR REPLACE FUNCTION get_invoice_details_by_id(p_invoice_id TEXT)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
BEGIN
    WITH invoice_details AS (
        SELECT 
            i.id AS invoice_id,
            i.invoice_id AS invoice_reference,
            i.order_id,
            o.order_id AS order_reference,
            i.merchant_order_id,
            mo.sub_order_id AS merchant_order_reference,
            i.merchant_id,
            m.name AS merchant_name,
            m.address AS merchant_address,
            m.user_id AS merchant_user_id,
            mup.email AS merchant_email,
            mup.phone AS merchant_phone,
            mup.raw_user_meta_data AS merchant_user_metadata,
            i.subtotal,
            i.shipping_cost,
            i.total,
            i.status AS invoice_status,
            i.issued_at,
            i.due_date,
            o.user_id,
            up.email AS user_email,
            up.phone AS user_phone,
            up.raw_user_meta_data AS user_metadata,
            o.status AS order_status,
            o.shipping_address,
            o.billing_address,
            o.payment_method,
            o.payment_info,
            o.notes AS order_notes,
            mo.shipping_method,
            mo.estimated_delivery_date,
            mo.tracking_info,
            (
                SELECT JSONB_AGG(
                    JSONB_BUILD_OBJECT(
                        'item_id', oi.id,
                        'product_id', oi.product_id,
                        'product_name', p.title,
                        'variants', oi.variants,
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'total', (oi.quantity * oi.price)
                    )
                )
                FROM order_items oi
                LEFT JOIN products p ON oi.product_id = p.id
                WHERE oi.merchant_order_id = i.merchant_order_id
            ) AS items
        FROM invoices i
        LEFT JOIN orders o ON i.order_id = o.id
        LEFT JOIN merchant_orders mo ON i.merchant_order_id = mo.id
        LEFT JOIN merchants m ON i.merchant_id = m.id
        LEFT JOIN user_profiles mup ON m.user_id = mup.id  -- Join to get merchant user details
        LEFT JOIN user_profiles up ON o.user_id = up.id
        WHERE i.invoice_id = p_invoice_id
    )
    SELECT JSONB_BUILD_OBJECT(
        'invoice_id', id.invoice_id,
        'invoice_reference', id.invoice_reference,
        'order_id', id.order_id,
        'order_reference', id.order_reference,
        'merchant_order_id', id.merchant_order_id,
        'merchant_order_reference', id.merchant_order_reference,
        'merchant_id', id.merchant_id,
        'merchant', JSONB_BUILD_OBJECT(
            'name', id.merchant_name,
            'address', id.merchant_address,
            'user', JSONB_BUILD_OBJECT(
                'user_id', id.merchant_user_id,
                'email', id.merchant_email,
                'phone', id.merchant_phone,
                'metadata', id.merchant_user_metadata
            )
        ),
        'subtotal', id.subtotal,
        'shipping_cost', id.shipping_cost,
        'total', id.total,
        'status', id.invoice_status,
        'issued_at', id.issued_at,
        'due_date', id.due_date,
        'user', JSONB_BUILD_OBJECT(
            'user_id', id.user_id,
            'email', id.user_email,
            'phone', id.user_phone,
            'metadata', id.user_metadata
        ),
        'order_details', JSONB_BUILD_OBJECT(
            'status', id.order_status,
            'shipping_address', id.shipping_address,
            'billing_address', id.billing_address,
            'payment_method', id.payment_method,
            'payment_info', id.payment_info,
            'notes', id.order_notes
        ),
        'merchant_order_details', JSONB_BUILD_OBJECT(
            'shipping_method', id.shipping_method,
            'estimated_delivery_date', id.estimated_delivery_date,
            'tracking_info', id.tracking_info
        ),
        'items', id.items
    ) INTO v_result
    FROM invoice_details id;

    IF v_result IS NULL THEN
        RAISE EXCEPTION 'Invoice with ID % not found', p_invoice_id;
    END IF;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql;