CREATE OR REPLACE FUNCTION get_sections_with_products(product_limit INT)
RETURNS TABLE (
  section_id INT,
  section_title TEXT,
  section_slug TEXT,
  section_description TEXT,
  product_id INT,
  product_title TEXT,
  product_description TEXT,
  product_price NUMERIC,
  product_thumbnail TEXT,
  product_slug TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS section_id,
    s.title AS section_title,
    s.slug AS section_slug,
    s.description AS section_description,
    p.id AS product_id,
    p.title AS product_title,
    p.description AS product_description,
    p.price AS product_price,
    p.thumbnail AS product_thumbnail,
    p.slug AS product_slug
  FROM sections s
  LEFT JOIN LATERAL (
    SELECT
      id,
      title,
      description,
      price,
      thumbnail,
      slug
    FROM products
    WHERE product_visibility->>s.slug = 'true'
    ORDER BY id ASC
    LIMIT product_limit
  ) p ON true
  WHERE s.status = 'active'
  ORDER BY s.active_position ASC;
END;
$$ LANGUAGE plpgsql;