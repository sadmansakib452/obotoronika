CREATE OR REPLACE FUNCTION get_bandwidth_last_n_days(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
  day DATE,
  total_bytes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    date_trunc('day', created_at)::date AS day,
    SUM(request_size_bytes + response_size_bytes) AS total_bytes
  FROM bandwidth_logs
  WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
  GROUP BY day
  ORDER BY day;
END;
$$ LANGUAGE plpgsql STABLE;
