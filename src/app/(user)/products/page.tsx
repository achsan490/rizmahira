import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/user/ProductCard'
import Link from 'next/link'
import { SlidersHorizontal } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Semua Produk',
  description: 'Jelajahi semua koleksi produk kami — makanan, aksesoris, pakaian, dan masih banyak lagi.',
}

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; q?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const { category, q } = await searchParams

  const isConfigured = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').startsWith('http')

  let categories: any[] = []
  let products: any[] = []

  if (isConfigured) {
    const supabase = await createClient()

    const [categoriesResult, productsResult] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      (async () => {
        let query = supabase
          .from('products')
          .select('*, categories(*)')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (category) {
          const { data: cat } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', category)
            .single()
          if (cat) query = query.eq('category_id', cat.id)
        }

        if (q) {
          query = query.ilike('name', `%${q}%`)
        }

        return query
      })(),
    ])

    categories = categoriesResult.data ?? []
    products = productsResult.data ?? []
  }

  const activeCategory = categories.find((c: any) => c.slug === category)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {activeCategory
            ? `${activeCategory.icon || '📦'} ${activeCategory.name}`
            : q
            ? `Hasil pencarian: "${q}"`
            : 'Semua Produk'}
        </h1>
        <p className="text-gray-500">
          {products?.length ?? 0} produk ditemukan
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Kategori */}
        <aside className="lg:w-56 flex-shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-4 h-4 text-fuchsia-600" />
              <h2 className="font-semibold text-gray-800 text-sm">Kategori</h2>
            </div>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/products"
                  id="filter-all"
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !category
                      ? 'bg-fuchsia-50 text-fuchsia-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-fuchsia-600'
                  }`}
                >
                  🛍️ Semua Produk
                </Link>
              </li>
              {(categories ?? []).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    id={`filter-${cat.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      category === cat.slug
                        ? 'bg-fuchsia-50 text-fuchsia-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-fuchsia-600'
                    }`}
                  >
                    {cat.icon || '📦'} {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Produk tidak ditemukan
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Coba kategori lain atau lihat semua produk kami.
              </p>
              <Link
                href="/products"
                className="px-5 py-2.5 bg-fuchsia-600 text-white text-sm font-semibold rounded-full hover:bg-fuchsia-700 transition-colors"
              >
                Lihat Semua Produk
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
