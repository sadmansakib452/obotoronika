DROP FUNCTION IF EXISTS get_categories_with_product_count();

CREATE FUNCTION get_categories_with_product_count()
RETURNS TABLE (
    id INT,
    name TEXT,
    thumbnail TEXT,
    description TEXT,
    parent_name TEXT,
    product_count INT
) AS $$
BEGIN
  RETURN QUERY 
  SELECT 
      c.id,
      c.name,
      c.thumbnail,
      c.description,
      parent.name AS parent_name,  -- Get parent category name
      COUNT(p.id)::INT AS product_count  -- Cast COUNT to INT
  FROM categories c
  LEFT JOIN categories parent ON c.parent_id = parent.id -- Self-join for parent category
  LEFT JOIN products p ON c.id = p.category_id
  WHERE c.deleted_at IS NULL  -- Exclude soft deleted categories
  GROUP BY c.id, parent.name  -- Include parent.name in GROUP BY
  ORDER BY c.name;  -- Order results by category name
END;
$$ LANGUAGE plpgsql;
