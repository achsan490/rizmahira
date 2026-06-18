import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/user/ProductCard'
import Link from 'next/link'
import { ArrowRight, Sparkles, ShieldCheck, Truck } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rizmahira Shop — Belanja Online Terpercaya',
  description:
    'Temukan produk pilihan terbaik: makanan, aksesoris, pakaian, kecantikan, dan banyak lagi. Pesan mudah via WhatsApp!',
}

const categoryEmojis: Record<string, string> = {
  'makanan-minuman': '🍔',
  aksesoris: '💍',
  'pakaian-fashion': '👗',
  'kecantikan-perawatan': '💄',
  elektronik: '📱',
  'perlengkapan-rumah': '🏠',
  'mainan-hobi': '🎮',
}

const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.startsWith('http')
}

export default async function HomePage() {
  let categories: any[] = []
  let featuredProducts: any[] = []

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const [categoriesResult, productsResult] = await Promise.all([
      supabase.from('categories').select('*').order('name'),
      supabase
        .from('products')
        .select('*, categories(*)')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8),
    ])
    categories = categoriesResult.data ?? []
    featuredProducts = productsResult.data ?? []
  }

  return (
    <div>
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-fuchsia-950 via-purple-900 to-indigo-900 text-white">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-fuchsia-300" />
              <span>Produk Pilihan Terbaik {new Date().getFullYear()}</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Temukan Produk{' '}
              <span className="bg-gradient-to-r from-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
                Impianmu
              </span>{' '}
              di Sini
            </h1>
            <p className="text-lg text-purple-200 mb-8 leading-relaxed">
              Dari makanan lezat, aksesoris trendi, hingga elektronik canggih.
              Semua ada di Rizmahira — pesan langsung via WhatsApp, mudah dan
              cepat!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                id="hero-browse-products"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-semibold rounded-full hover:shadow-xl hover:shadow-fuchsia-500/30 hover:scale-105 transition-all duration-200"
              >
                Lihat Semua Produk
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/products?category=makanan-minuman"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-200"
              >
                🍔 Makanan & Minuman
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Keunggulan ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-5 h-5 text-fuchsia-600" />,
                title: 'Terpercaya',
                desc: 'Produk asli & berkualitas',
              },
              {
                icon: <span className="text-xl">📱</span>,
                title: 'Order via WA',
                desc: 'Pesan langsung, cepat & mudah',
              },
              {
                icon: <Truck className="w-5 h-5 text-fuchsia-600" />,
                title: 'Pengiriman Cepat',
                desc: 'Siap kirim ke seluruh Indonesia',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-50 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kategori ── */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kategori Produk</h2>
              <p className="text-gray-500 text-sm mt-1">Temukan apa yang kamu cari</p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1"
            >
              Lihat semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                id={`category-${cat.slug}`}
                className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-fuchsia-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
              >
                <span className="text-2xl">{cat.icon || categoryEmojis[cat.slug] || '📦'}</span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-fuchsia-600 transition-colors leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Default Categories jika Supabase belum dikonfigurasi ── */}
      {categories.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Kategori Produk</h2>
              <p className="text-gray-500 text-sm mt-1">Temukan apa yang kamu cari</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {[
              { name: 'Makanan & Minuman', slug: 'makanan-minuman', icon: '🍔' },
              { name: 'Aksesoris', slug: 'aksesoris', icon: '💍' },
              { name: 'Pakaian & Fashion', slug: 'pakaian-fashion', icon: '👗' },
              { name: 'Kecantikan', slug: 'kecantikan-perawatan', icon: '💄' },
              { name: 'Elektronik', slug: 'elektronik', icon: '📱' },
              { name: 'Perlengkapan Rumah', slug: 'perlengkapan-rumah', icon: '🏠' },
              { name: 'Mainan & Hobi', slug: 'mainan-hobi', icon: '🎮' },
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                id={`category-${cat.slug}`}
                className="group flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 hover:border-fuchsia-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium text-gray-700 group-hover:text-fuchsia-600 transition-colors leading-tight">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Produk Terbaru ── */}
      <section className="bg-gradient-to-b from-purple-50/50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Produk Terbaru</h2>
              <p className="text-gray-500 text-sm mt-1">Koleksi fresh baru masuk</p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-fuchsia-600 hover:text-fuchsia-700 flex items-center gap-1"
            >
              Semua produk <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-5xl mb-4">🛍️</p>
              <p className="text-gray-500 font-medium">Belum ada produk.</p>
              <p className="text-gray-400 text-sm mt-1">Segera hadir — tambahkan produk melalui admin panel!</p>
              <Link href="/admin" className="inline-flex mt-4 px-4 py-2 text-sm text-fuchsia-600 border border-fuchsia-200 rounded-full hover:bg-fuchsia-50 transition-colors">
                Ke Admin Panel →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-fuchsia-600 to-purple-700 p-8 md:p-12 text-white text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <h2 className="text-2xl md:text-3xl font-bold mb-3 relative z-10">
            Belanja Lebih Mudah via WhatsApp! 📲
          </h2>
          <p className="text-purple-200 mb-6 max-w-lg mx-auto relative z-10">
            Pilih produk favorit kamu, klik tombol pesan, dan langsung terhubung
            dengan kami. Prosesnya cepat dan mudah!
          </p>
          <Link
            href="/products"
            id="cta-shop-now"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-fuchsia-700 font-bold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-200 relative z-10"
          >
            Mulai Belanja Sekarang
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
