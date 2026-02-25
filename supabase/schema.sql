-- Square 料金表アプリ用スキーマ（Supabase SQL Editor で実行）

CREATE TABLE IF NOT EXISTS imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  original_filename text,
  note text
);

CREATE TABLE IF NOT EXISTS catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id uuid NOT NULL REFERENCES imports(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  part_group text,
  part_name text NOT NULL,
  price_yen int NOT NULL,
  source_token text,
  source_category text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_catalog_items_import_id ON catalog_items(import_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_brand ON catalog_items(brand);
CREATE INDEX IF NOT EXISTS idx_catalog_items_model ON catalog_items(model);
CREATE INDEX IF NOT EXISTS idx_catalog_items_is_active ON catalog_items(is_active);

CREATE OR REPLACE VIEW catalog_latest AS
SELECT c.*
FROM catalog_items c
JOIN imports i ON c.import_id = i.id
WHERE c.is_active = true
  AND i.id = (SELECT id FROM imports ORDER BY uploaded_at DESC LIMIT 1);
