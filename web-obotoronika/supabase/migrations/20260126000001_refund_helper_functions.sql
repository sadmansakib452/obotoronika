-- ========================================================
-- Refund Helper Functions - Chapter 1 Step 1.3
-- Purpose: Database functions for return/refund operations
-- Created: 2026-01-26
-- ========================================================

-- --------------------------------------------------------
-- Function 1: Check if order is eligible for cancellation
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_can_cancel_order(p_order_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    v_order orders%ROWTYPE;
    v_allowed_statuses TEXT[];
    v_config JSONB;
    v_days INTEGER;
BEGIN
    -- Fetch order details
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;

    IF v_order IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Get cancellation allowed statuses from config
    SELECT value->>'statuses' INTO v_allowed_statuses
    FROM refund_config
    WHERE key = 'conditions.cancellation_allowed_status'
    AND is_active = true;

    -- Check if order status is in allowed list
    IF v_order.status::TEXT = ANY(v_allowed_statuses) THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- --------------------------------------------------------
-- Function 2: Check if order is eligible for return
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_can_return_order(p_order_id BIGINT)
RETURNS BOOLEAN AS $$
DECLARE
    v_order orders%ROWTYPE;
    v_allowed_statuses TEXT[];
    v_config JSONB;
    v_days INTEGER;
    v_delivery_date TIMESTAMP;
BEGIN
    -- Fetch order details
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;

    IF v_order IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Get return allowed statuses from config
    SELECT value->>'statuses' INTO v_allowed_statuses
    FROM refund_config
    WHERE key = 'conditions.return_allowed_status'
    AND is_active = true;

    -- Check if order status is in allowed list
    IF v_order.status::TEXT = ANY(v_allowed_statuses) THEN
        -- Also check if within return window
        -- For now, return TRUE (can add delivery date check later)
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- --------------------------------------------------------
-- Function 3: Get eligible orders for return/cancellation
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_get_refundable_orders(
    p_user_id UUID,
    p_type TEXT,  -- 'cancellation' or 'return'
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    order_id TEXT,
    status TEXT,
    total_amount NUMERIC,
    created_at TIMESTAMP,
    can_cancel BOOLEAN,
    can_return BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        o.id,
        o.order_id,
        o.status::TEXT,
        o.total_amount,
        o.created_at,
        fn_can_cancel_order(o.id) AS can_cancel,
        fn_can_return_order(o.id) AS can_return
    FROM orders o
    WHERE o.user_id = p_user_id
    AND o.status NOT IN ('canceled', 'refunded', 'returned', 'failed')
    ORDER BY o.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;


-- --------------------------------------------------------
-- Function 4: Calculate refund amount for an order
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_calculate_refund_amount(
    p_order_id BIGINT,
    p_deduct_shipping BOOLEAN DEFAULT false,
    p_deduct_commission BOOLEAN DEFAULT false
)
RETURNS NUMERIC(10, 2) AS $$
DECLARE
    v_order orders%ROWTYPE;
    v_total NUMERIC(10, 2);
    v_shipping_cost NUMERIC(10, 2) := 0;
    v_commission NUMERIC(10, 2) := 0;
    v_deduct_shipping BOOLEAN;
    v_deduct_commission BOOLEAN;
BEGIN
    -- Fetch order
    SELECT * INTO v_order FROM orders WHERE id = p_order_id;

    IF v_order IS NULL THEN
        RETURN 0;
    END IF;

    v_total := v_order.total_amount;

    -- Get config settings
    SELECT (value->>'value')::BOOLEAN INTO v_deduct_shipping
    FROM refund_config
    WHERE key = 'rules.deduct_shipping_cost'
    AND is_active = true;

    SELECT (value->>'value')::BOOLEAN INTO v_deduct_commission
    FROM refund_config
    WHERE key = 'rules.deduct_gateway_commission'
    AND is_active = true;

    -- Override with function parameters if provided
    IF p_deduct_shipping IS NOT NULL THEN
        v_deduct_shipping := p_deduct_shipping;
    END IF;

    IF p_deduct_commission IS NOT NULL THEN
        v_deduct_commission := p_deduct_commission;
    END IF;

    -- Calculate deduction (simplified - can be enhanced with merchant_orders)
    IF v_deduct_shipping THEN
        -- Get shipping cost from merchant_orders if available
        SELECT COALESCE(SUM(shipping_cost), 0) INTO v_shipping_cost
        FROM merchant_orders
        WHERE order_id = p_order_id;

        v_total := v_total - v_shipping_cost;
    END IF;

    -- Commission deduction (if refund to original payment, we don't lose commission)
    -- Only deduct commission if refund is from merchant's pocket
    IF v_deduct_commission AND NOT v_deduct_shipping THEN
        v_commission := v_total * 0.04; -- 4% SSLCommerz commission
        v_total := v_total - v_commission;
    END IF;

    -- Ensure non-negative
    RETURN GREATEST(v_total, 0);
END;
$$ LANGUAGE plpgsql;


-- --------------------------------------------------------
-- Function 5: Get transaction bank_tran_id for refund
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_get_original_transaction(
    p_order_id BIGINT
)
RETURNS TABLE (
    id BIGINT,
    tran_id TEXT,
    bank_tran_id TEXT,
    amount NUMERIC,
    card_no TEXT,
    card_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        t.id,
        t.tran_id,
        t.bank_tran_id,
        t.amount,
        t.card_no,
        t.card_type
    FROM transactions t
    INNER JOIN orders o ON o.order_id = t.tran_id
    WHERE o.id = p_order_id
    AND t.status = 'success'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;


-- --------------------------------------------------------
-- Function 6: Get return request statistics (for admin)
-- --------------------------------------------------------

CREATE OR REPLACE FUNCTION fn_get_return_stats()
RETURNS TABLE (
    total_requests INTEGER,
    pending_count INTEGER,
    approved_count INTEGER,
    rejected_count INTEGER,
    completed_count INTEGER,
    total_refund_amount NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_requests,
        COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS pending_count,
        COUNT(*) FILTER (WHERE status = 'approved')::INTEGER AS approved_count,
        COUNT(*) FILTER (WHERE status = 'rejected')::INTEGER AS rejected_count,
        COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed_count,
        COALESCE(SUM(refund_amount) FILTER (WHERE status = 'completed'), 0)::NUMERIC AS total_refund_amount
    FROM return_requests;
END;
$$ LANGUAGE plpgsql;


-- ========================================================
-- End of helper functions migration
-- ========================================================