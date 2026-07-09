-- 1. Create enum type for invoice status safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
        CREATE TYPE invoice_status AS ENUM ('unpaid', 'paid', 'refunded', 'partially_refunded');
    END IF;
END$$;

-- 2. Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    merchant_order_id BIGINT NOT NULL REFERENCES merchant_orders(id) ON DELETE CASCADE,
    invoice_id TEXT UNIQUE NOT NULL,         -- Unique invoice reference (e.g., INV123456)
    merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE RESTRICT,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),   -- Sum of item prices
    shipping_cost NUMERIC(10, 2) NOT NULL CHECK (shipping_cost >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),        -- Subtotal + shipping_cost
    status invoice_status NOT NULL DEFAULT 'unpaid',          -- Fixed
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_merchant_order_id ON invoices(merchant_order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_merchant_id ON invoices(merchant_id);
