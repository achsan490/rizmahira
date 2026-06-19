'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Tag, Clock, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { type Product, type ProductVariant, formatRupiah, createWhatsAppLink } from '@/lib/utils'

interface ProductDetailViewProps {
  product: Product
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  const activeVariants = product.product_variants?.filter((v) => v.is_active) ?? []
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    activeVariants[0] ?? null
  )

  const currentPrice = selectedVariant?.price ?? product.price
  const currentImageUrl = selectedVariant?.image_url ?? product.image_url

  const waLink = product.whatsapp_num
    ? createWhatsAppLink(
        product.whatsapp_num,
        quantity > 1 ? `${product.name} (x${quantity})` : product.name,
        currentPrice * quantity,
        product.is_preorder,
        product.preorder_days,
        selectedVariant?.name
      )
    : createWhatsAppLink(
        '+62 856-0496-9571',
        quantity > 1 ? `${product.name} (x${quantity})` : product.name,
        currentPrice * quantity,
        product.is_preorder,
        product.preorder_days,
        selectedVariant?.name
      )

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedVariant)
  }

  const isSupabaseUrl = (url: string) => url.includes('supabase.co')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
      {/* Left: Image */}
      <div className="relative aspect-square bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-3xl overflow-hidden shadow-md">
        {currentImageUrl ? (
          isSupabaseUrl(currentImageUrl) ? (
            <Image
              src={currentImageUrl}
              alt={product.name}
              fill
              className="object-cover transition-all duration-300"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <img
              src={currentImageUrl}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-300"
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl opacity-30">🛍️</span>
          </div>
        )}
      </div>

      {/* Right: Info & Actions */}
      <div className="flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          {product.categories && (
            <Link
              href={`/products?category=${(product.categories as any).slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full w-fit hover:bg-purple-200 transition-colors"
            >
              <Tag className="w-3 h-3" />
              {(product.categories as any).icon} {(product.categories as any).name}
            </Link>
          )}
          {product.is_preorder && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full w-fit animate-pulse">
              ⏱️ Pre-Order {product.preorder_days && product.preorder_days > 0 ? `(${product.preorder_days} Hari)` : ''}
            </span>
          )}
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-4xl font-bold bg-gradient-to-r from-fuchsia-600 to-purple-700 bg-clip-text text-transparent">
            {formatRupiah(currentPrice)}
          </span>
          {selectedVariant && selectedVariant.price && selectedVariant.price !== product.price && (
            <span className="text-xs text-gray-400 border border-gray-200 rounded px-1.5 py-0.5 font-medium">
              Harga varian khusus
            </span>
          )}
        </div>

        {/* Variants Selector */}
        {activeVariants.length > 0 && (
          <div className="mb-6 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Pilih Varian:</h2>
            <div className="flex flex-wrap gap-2">
              {activeVariants.map((variant) => (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-200 border cursor-pointer ${
                    selectedVariant?.id === variant.id
                      ? 'bg-fuchsia-600 border-fuchsia-600 text-white shadow-md shadow-fuchsia-200'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-fuchsia-300 hover:text-fuchsia-600'
                  }`}
                >
                  {variant.name}
                  {variant.price && variant.price !== product.price && (
                    <span className={`ml-1 text-[10px] ${selectedVariant?.id === variant.id ? 'text-fuchsia-200' : 'text-fuchsia-600'}`}>
                      ({formatRupiah(variant.price)})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {product.description && (
          <div className="mb-6">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Deskripsi Produk</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Order Selector and Buttons */}
        <div className="space-y-4 mt-auto">
          {/* Quantity Selector */}
          <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-3 rounded-2xl w-fit">
            <span className="text-xs font-semibold text-gray-500 px-1">Jumlah</span>
            <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-sm">
              <button
                type="button"
                className="p-1.5 text-gray-500 hover:text-fuchsia-600 transition-colors disabled:opacity-40 cursor-pointer"
                disabled={quantity <= 1}
                onClick={() => setQuantity(quantity - 1)}
                aria-label="Kurangi jumlah"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-3 font-bold text-gray-800 text-xs min-w-[16px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                className="p-1.5 text-gray-500 hover:text-fuchsia-600 transition-colors cursor-pointer"
                onClick={() => setQuantity(quantity + 1)}
                aria-label="Tambah jumlah"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Beli Langsung */}
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm rounded-2xl hover:shadow-lg hover:shadow-green-200 hover:scale-[1.01] transition-all duration-200"
            >
              <span>📱</span>
              Beli Langsung via WhatsApp
            </a>

            {/* Tambah ke Keranjang */}
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white font-bold text-sm rounded-2xl hover:shadow-lg hover:shadow-purple-200 hover:scale-[1.01] transition-all duration-200 cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              Tambah ke Keranjang
            </button>

            <Link
              href="/products"
              className="flex items-center justify-center gap-2 w-full px-6 py-2.5 border-2 border-gray-100 text-gray-500 text-xs font-semibold rounded-2xl hover:border-fuchsia-200 hover:text-fuchsia-600 transition-all duration-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali Belanja
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          Ditambahkan {new Date(product.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
        </div>
      </div>
    </div>
  )
}
