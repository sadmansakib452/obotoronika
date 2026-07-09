-- Drop the old product_id column and index
ALTER TABLE banners DROP CONSTRAINT IF EXISTS banners_product_id_fkey;
DROP INDEX IF EXISTS idx_banners_product_id;

-- Add section_id column
ALTER TABLE banners ADD COLUMN section_id INTEGER REFERENCES sections(id) ON DELETE SET NULL;

-- Create index for section_id
CREATE INDEX IF NOT EXISTS idx_banners_section_id ON banners(section_id);

-- Drop the old product_id column
ALTER TABLE banners DROP COLUMN IF EXISTS product_id;

