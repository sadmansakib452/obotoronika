-- Add a deleted_at column to store soft deletes
ALTER TABLE categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Function to soft delete a category
CREATE OR REPLACE FUNCTION soft_delete_category(p_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE categories 
    SET deleted_at = NOW() 
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;


-- Function to undo a soft delete
CREATE OR REPLACE FUNCTION undo_delete_category(p_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE categories 
    SET deleted_at = NULL 
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_all_soft_deleted_categories()
RETURNS VOID AS $$
BEGIN
    DELETE FROM categories
    WHERE deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
