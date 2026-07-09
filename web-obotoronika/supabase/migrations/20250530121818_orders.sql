-- 1. Create the ENUM type for order status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM (
            'pending',           -- Order created, but no payment yet
            'awaiting_payment',  -- Waiting for payment confirmation
            'processing',        -- Payment confirmed, preparing for shipment
            'shipped',           -- Product has been shipped
            'delivered',         -- Order delivered to customer
            'completed',         -- Order completed successfully
            'canceled',          -- Order was canceled before shipment
            'returned',          -- Customer returned the order
            'refunded',          -- Refund issued
            'failed'             -- Payment or processing failure
        );
    END IF;
END$$;


-- 2. Create the orders table
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status order_status NOT NULL DEFAULT 'pending',
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_address JSONB NOT NULL,         -- Store shipping details (e.g., name, address, phone)
    billing_address JSONB,                   -- Store billing details (optional, for payment)
    order_id TEXT UNIQUE NOT NULL,           -- External order reference (e.g., ORD123456)
    payment_method TEXT,                     -- e.g., cod, card, bkash
    payment_info JSONB,                      -- Store gateway response or method-specific info
    notes TEXT,                              -- Optional user notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create the merchant_orders table to handle merchant-specific sub-orders
CREATE TABLE IF NOT EXISTS merchant_orders (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    merchant_id INTEGER NOT NULL REFERENCES merchants(id) ON DELETE RESTRICT, -- Changed to INTEGER
    sub_order_id TEXT UNIQUE NOT NULL,       -- Merchant-specific order reference (e.g., SUBORD789)
    status order_status NOT NULL DEFAULT 'pending',
    shipping_method TEXT,           -- e.g., standard, express
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    estimated_delivery_date TIMESTAMP WITH TIME ZONE, -- Optional delivery estimate
    tracking_info JSONB,                     -- Store tracking details (e.g., carrier, tracking number)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create the order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    merchant_order_id BIGINT NOT NULL REFERENCES merchant_orders(id) ON DELETE CASCADE, -- Link to merchant sub-order
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,                 -- Product name
    -- name TEXT NOT NULL,                 -- Product name
    variants JSONB NOT NULL DEFAULT '[]'::jsonb, -- Store variant details (e.g., color, size)
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0), -- Price at the time of ordering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Add indexes for faster querying
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_merchant_orders_order_id ON merchant_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_merchant_orders_merchant_id ON merchant_orders(merchant_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_merchant_order_id ON order_items(merchant_order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);