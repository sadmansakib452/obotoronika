CREATE OR REPLACE FUNCTION bulk_delete_categories(p_ids INT[])
RETURNS TABLE (id INT, name TEXT, thumbnail TEXT, deleted_at TIMESTAMP) AS $$
BEGIN
    RETURN QUERY
    WITH deleted_rows AS (
        DELETE FROM categories
        WHERE categories.id IN (SELECT unnest(p_ids))
        RETURNING categories.id AS cat_id, categories.name AS cat_name, categories.thumbnail AS cat_thumbnail
    )
    SELECT dr.cat_id AS id,
           dr.cat_name AS name,
           dr.cat_thumbnail AS thumbnail,
           NOW()::timestamp AS deleted_at
    FROM deleted_rows dr;
END;
$$ LANGUAGE plpgsql;
