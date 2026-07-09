DROP FUNCTION IF EXISTS get_options_with_value_count();

CREATE FUNCTION get_options_with_value_count()
RETURNS TABLE (
    id INT,
    name TEXT,
    key TEXT,
    field_type TEXT,
    description TEXT,
    author_name TEXT,
    updated_at TIMESTAMPTZ,
    value_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.name,
    o.key,
    o.field_type,
    o.description,
    o.author_name,
    o.updated_at,
    COUNT(ov.id)::INT AS value_count
  FROM options o
  LEFT JOIN option_values ov ON o.id = ov.variant_id
  GROUP BY o.id
  ORDER BY o.name;
END;
$$ LANGUAGE plpgsql;
