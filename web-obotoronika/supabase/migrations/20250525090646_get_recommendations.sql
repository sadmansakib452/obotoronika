CREATE OR REPLACE FUNCTION get_recommendations(
  p_slug TEXT,
  p_limit INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  slug TEXT,
  thumbnail TEXT,
  price DECIMAL(10, 2)
) AS $$
BEGIN
  -- Fetch products with similar tags
  RETURN QUERY
  SELECT p.id, p.title, p.slug, p.thumbnail, p.price
  FROM products p
  WHERE p.tags && (SELECT tags FROM products WHERE products.slug = p_slug)
    AND p.slug != p_slug
    AND p.status = 'published'
  LIMIT p_limit;

  -- If the number of recommendations is less than the limit, fill with random products
  RETURN QUERY
  SELECT p.id, p.title, p.slug, p.thumbnail, p.price
  FROM products p
  WHERE p.slug != p_slug
    AND p.status = 'published'
    AND p.id NOT IN (
      SELECT products.id
      FROM products
      WHERE tags && (SELECT tags FROM products WHERE products.slug = p_slug)
        AND products.slug != p_slug
        AND products.status = 'published'
      LIMIT p_limit
    )
  ORDER BY RANDOM()
  LIMIT p_limit - (SELECT COUNT(*)
                   FROM products
                   WHERE tags && (SELECT tags FROM products WHERE products.slug = p_slug)
                     AND products.slug != p_slug
                     AND products.status = 'published');
END;
$$ LANGUAGE plpgsql;