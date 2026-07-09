-- Global Options Table (e.g. Color, Size)
CREATE TABLE IF NOT EXISTS options (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  field_type TEXT NOT NULL,
  description TEXT,
  author_id UUID NOT NULL,
  author_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS option_values (
  id SERIAL PRIMARY KEY,
  variant_id INTEGER NOT NULL,
  value TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT option_values_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES options(id) ON DELETE CASCADE
);
