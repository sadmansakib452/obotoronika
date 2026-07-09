-- Create the cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY, -- Unique identifier for each cart item
    user_id UUID NOT NULL, -- Reference to the user who owns the cart
    product_id UUID NOT NULL, -- Reference to the product added to the cart
    variants JSONB NOT NULL DEFAULT '[]'::jsonb, -- JSON array of variant IDs
    quantity INTEGER NOT NULL DEFAULT 1, -- Quantity of the product in the cart
    created_at TIMESTAMP DEFAULT NOW(), -- Timestamp when the item was added
    updated_at TIMESTAMP DEFAULT NOW(), -- Timestamp when the item was last updated
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE, -- Foreign key to profiles table
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE -- Foreign key to products table
);

-- Add indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart_items (product_id);