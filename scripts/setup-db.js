const https = require('https')

const SUPABASE_URL = 'https://ccpgkbqfodbmevsowkfi.supabase.co'
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjcGdrYnFmb2RibWV2c293a2ZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc0NDk0MywiZXhwIjoyMDk3MzIwOTQzfQ.xKXlBfFpFmCcQhwsX34UHfiHWhQDl581C0qnA_h1fH0'

async function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql })
    const url = new URL(`${SUPABASE_URL}/pg-meta/v1/query`)
    
    const options = {
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data })
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  const statements = [
    // Create tables
    `CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT DEFAULT '📦',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      price NUMERIC(12, 2) NOT NULL DEFAULT 0,
      category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
      image_url TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      whatsapp_num TEXT,
      is_preorder BOOLEAN DEFAULT FALSE,
      preorder_days INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`,
    // Indexes
    `CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id)`,
    `CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active)`,
    `CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC)`,
    // Migration: Add preorder columns if not exists
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS is_preorder BOOLEAN DEFAULT FALSE`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS preorder_days INTEGER DEFAULT 0`,
    // RLS
    `ALTER TABLE categories ENABLE ROW LEVEL SECURITY`,
    `ALTER TABLE products ENABLE ROW LEVEL SECURITY`,
    // Policies
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'categories_public_read') THEN
        CREATE POLICY "categories_public_read" ON categories FOR SELECT USING (true);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_public_read') THEN
        CREATE POLICY "products_public_read" ON products FOR SELECT USING (is_active = true);
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'categories_auth_all') THEN
        CREATE POLICY "categories_auth_all" ON categories FOR ALL USING (auth.role() = 'authenticated');
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_auth_all') THEN
        CREATE POLICY "products_auth_all" ON products FOR ALL USING (auth.role() = 'authenticated');
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'products_auth_read_all') THEN
        CREATE POLICY "products_auth_read_all" ON products FOR SELECT USING (auth.role() = 'authenticated');
      END IF;
    END $$`,
    // Seed categories
    `INSERT INTO categories (name, slug, icon) VALUES
      ('Makanan & Minuman', 'makanan-minuman', '🍔'),
      ('Aksesoris', 'aksesoris', '💍'),
      ('Pakaian & Fashion', 'pakaian-fashion', '👗'),
      ('Kecantikan & Perawatan', 'kecantikan-perawatan', '💄'),
      ('Elektronik', 'elektronik', '📱'),
      ('Perlengkapan Rumah', 'perlengkapan-rumah', '🏠'),
      ('Mainan & Hobi', 'mainan-hobi', '🎮')
    ON CONFLICT (slug) DO NOTHING`,
    // Create storage bucket
    `INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true) ON CONFLICT (id) DO NOTHING`,
    // Storage Policies
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Public Read Access') THEN
        CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Insert Access') THEN
        CREATE POLICY "Authenticated Insert Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Update Access') THEN
        CREATE POLICY "Authenticated Update Access" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
      END IF;
    END $$`,
    `DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname = 'Authenticated Delete Access') THEN
        CREATE POLICY "Authenticated Delete Access" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
      END IF;
    END $$`,
  ]

  console.log('🔄 Setting up Supabase database...\n')

  for (let i = 0; i < statements.length; i++) {
    const sql = statements[i]
    const preview = sql.trim().substring(0, 60).replace(/\n/g, ' ')
    process.stdout.write(`[${i + 1}/${statements.length}] ${preview}... `)
    
    const result = await runSQL(sql)
    
    if (result.status === 200 || result.status === 201) {
      console.log('✅')
    } else {
      const parsed = JSON.parse(result.body || '{}')
      // Ignore "already exists" errors
      if (parsed.message && (parsed.message.includes('already exists') || parsed.message.includes('duplicate'))) {
        console.log('✅ (already exists)')
      } else {
        console.log(`❌ Status: ${result.status}`)
        console.log('   Error:', result.body)
      }
    }
  }

  console.log('\n✅ Database setup complete!')
}

main().catch(console.error)
