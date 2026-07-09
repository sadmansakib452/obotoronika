create or replace view public.user_profiles as
select
  id,
  email,
  phone,
  raw_user_meta_data
from auth.users;
