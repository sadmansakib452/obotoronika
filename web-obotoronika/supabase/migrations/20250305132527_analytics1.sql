CREATE OR REPLACE FUNCTION role_counts_last_7_days()
RETURNS TABLE(day text, role text, count bigint) AS $$
SELECT
  TO_CHAR(created_at, 'Day') AS day,
  COALESCE(raw_user_meta_data->>'role', role::text) AS role,
  COUNT(*)::bigint AS count
FROM auth.users
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY 1, 2
ORDER BY MIN(created_at);
$$ LANGUAGE sql STABLE;
