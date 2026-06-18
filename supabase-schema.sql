-- ================================================
-- RIZMAHIRA SHOP — Supabase SQL Schema
-- Jalankan ini di Supabase SQL Editor
-- ================================================

-- 1. Tabel Kategori
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  icon        TEXT DEFAULT '📦',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel Produk
CREATE TABLE IF NOT EXISTS products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  price         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  category_id   UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url     TEXT,
  is_active     BOOLEAN DEFAULT TRUE,
  whatsapp_num  TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index untuk performa query
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- 4. Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Siapapun bisa baca (halaman user publik)
CREATE POLICY "categories_public_read" ON categories
  FOR SELECT USING (true);

CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = true);

-- Hanya user terotentikasi (admin) yang bisa write
CREATE POLICY "categories_auth_all" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "products_auth_all" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Admin bisa lihat semua produk termasuk yang nonaktif
CREATE POLICY "products_auth_read_all" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

-- 5. Seed Data Kategori Default
INSERT INTO categories (name, slug, icon) VALUES
  ('Makanan & Minuman', 'makanan-minuman', '🍔'),
  ('Aksesoris', 'aksesoris', '💍'),
  ('Pakaian & Fashion', 'pakaian-fashion', '👗'),
  ('Kecantikan & Perawatan', 'kecantikan-perawatan', '💄'),
  ('Elektronik', 'elektronik', '📱'),
  ('Perlengkapan Rumah', 'perlengkapan-rumah', '🏠'),
  ('Mainan & Hobi', 'mainan-hobi', '🎮')
ON CONFLICT (slug) DO NOTHING;
