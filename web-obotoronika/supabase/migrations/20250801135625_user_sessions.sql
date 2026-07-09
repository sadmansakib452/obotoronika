-- Supabase typically installs extensions into the `extensions` schema. Using `gen_random_uuid()`
-- (pgcrypto) avoids relying on `uuid_generate_v4()` being present in the search_path.
create extension if not exists "pgcrypto";

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  session_token text not null,
  device text,
  os text,
  browser text,
  browser_version text,
  ip text,
  user_agent text,
  created_at timestamp default now(),
  last_active timestamp default now()
);
