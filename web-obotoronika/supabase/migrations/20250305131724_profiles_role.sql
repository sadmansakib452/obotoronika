CREATE OR REPLACE FUNCTION count_by_role()
RETURNS TABLE(role text, count bigint) AS $$
-- Local setup does not have a `profiles` table; roles live on `auth.users`.
SELECT
  COALESCE(raw_user_meta_data->>'role', role::text) AS role,
  COUNT(*)::bigint AS count
FROM auth.users
GROUP BY 1;
$$ LANGUAGE sql STABLE;
