CREATE TABLE IF NOT EXISTS banners(
    id SERIAL PRIMARY KEY,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    button_text TEXT DEFAULT 'Shop Now',
    button_link TEXT,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active',
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_banners_status ON banners(status);
CREATE INDEX IF NOT EXISTS idx_banners_display_order ON banners(display_order);
CREATE INDEX IF NOT EXISTS idx_banners_product_id ON banners(product_id);
