-- Function to soft delete a merchant
CREATE OR REPLACE FUNCTION soft_delete_merchant(p_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE merchants 
    SET deleted_at = NOW() 
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;


-- Function to undo a soft delete
CREATE OR REPLACE FUNCTION undo_delete_merchant(p_id INT)
RETURNS VOID AS $$
BEGIN
    UPDATE merchants 
    SET deleted_at = NULL 
    WHERE id = p_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION delete_all_soft_deleted_merchants()
RETURNS VOID AS $$
BEGIN
    DELETE FROM merchants
    WHERE deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;
