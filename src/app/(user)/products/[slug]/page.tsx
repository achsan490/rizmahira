import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductDetailView from '@/components/user/ProductDetailView'
import { formatRupiah } from '@/lib/utils'

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select('name, description')
    .eq('slug', slug)
    .single()

  if (!product) return { title: 'Produk tidak ditemukan' }

  return {
    title: product.name,
    description: product.description ?? `Beli ${product.name} di Rizmahira Shop`,
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!product) notFound()

  // Related products
  const { data: related } = await supabase
    .from('products')
    .select('id, name, slug, price, image_url, categories(*)')
    .eq('is_active', true)
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(4)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-fuchsia-600 transition-colors">Beranda</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-fuchsia-600 transition-colors">Produk</Link>
        {product.categories && (
          <>
            <span>/</span>
            <Link
              href={`/products?category=${(product.categories as any).slug}`}
              className="hover:text-fuchsia-600 transition-colors"
            >
              {(product.categories as any).name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Details View */}
      <ProductDetailView product={product as any} />

      {/* Related Products */}
      {related && related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-6">Produk Serupa</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-fuchsia-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="relative aspect-square bg-purple-50">
                  {p.image_url ? (
                    p.image_url.includes('supabase.co') ? (
                      <Image
                        src={p.image_url}
                        alt={p.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="25vw"
                      />
                    ) : (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl opacity-30">
                      🛍️
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 mb-1 group-hover:text-fuchsia-600 transition-colors">
                    {p.name}
                  </p>
                  <p className="text-fuchsia-600 font-bold text-sm">{formatRupiah(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
