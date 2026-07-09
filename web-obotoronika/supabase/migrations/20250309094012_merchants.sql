CREATE TYPE merchant_status AS ENUM ('active', 'inactive', 'pending', 'suspended', 'banned');

CREATE TABLE merchants (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  logo TEXT,
  address TEXT,
  website TEXT,
  status merchant_status NOT NULL DEFAULT 'pending',
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
