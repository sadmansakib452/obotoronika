CREATE OR REPLACE VIEW public.extended_users AS
SELECT
  u.id,
  u.email,
  u.phone,
  u.created_at,
  u.last_sign_in_at,
  u.raw_user_meta_data
FROM auth.users u;
