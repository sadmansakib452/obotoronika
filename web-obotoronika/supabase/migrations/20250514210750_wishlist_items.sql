-- Create the wishlist_items table
CREATE TABLE IF NOT EXISTS wishlist_items (
    id SERIAL PRIMARY KEY, -- Unique identifier for each wishlist item
    user_id UUID NOT NULL, -- Reference to the user who owns the wishlist
    product_id UUID NOT NULL, -- Reference to the product added to the wishlist
    created_at TIMESTAMP DEFAULT NOW(), -- Timestamp when the item was added
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE, -- Foreign key to profiles table
    FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE -- Foreign key to products table
);

-- Add an index to improve query performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist_items (user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_product_id ON wishlist_items (product_id);