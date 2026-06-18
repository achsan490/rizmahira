'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, ShoppingCart } from 'lucide-react'
import { type Product, formatRupiah, createWhatsAppLink } from '@/lib/utils'
import { useCart } from '@/context/CartContext'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()
  const waLink =
    product.whatsapp_num
      ? createWhatsAppLink(product.whatsapp_num, product.name, product.price)
      : createWhatsAppLink('+62 856-0496-9571', product.name, product.price)

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 hover:border-fuchsia-200 transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square bg-gradient-to-br from-purple-50 to-fuchsia-50 overflow-hidden">
        {product.image_url ? (
          product.image_url.includes('supabase.co') ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-40">🛍️</span>
          </div>
        )}

        {/* Category Badge */}
        {product.categories && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-purple-700 rounded-full shadow-sm">
              {product.categories.icon} {product.categories.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-800 text-sm leading-snug mb-1 line-clamp-2 hover:text-fuchsia-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-xs text-gray-500 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="text-fuchsia-600 font-bold text-sm">
            {formatRupiah(product.price)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mt-4">
          {waLink ? (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              id={`buy-wa-${product.id}`}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-[11px] font-bold rounded-xl hover:shadow-md transition-all duration-200"
            >
              <span>📱</span>
              Beli Langsung
            </a>
          ) : (
            <Link
              href={`/products/${product.slug}`}
              id={`view-product-${product.id}`}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-[11px] font-bold rounded-xl hover:shadow-md transition-all duration-200"
            >
              Lihat Detail
            </Link>
          )}

          <button
            onClick={() => addToCart(product)}
            id={`add-cart-card-${product.id}`}
            className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 hover:text-purple-800 rounded-xl transition-colors border border-purple-100 flex items-center justify-center cursor-pointer"
            title="Tambah ke Keranjang"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
