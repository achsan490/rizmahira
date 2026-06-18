'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { type Product, createWhatsAppLink } from '@/lib/utils'
import { Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ProductActionsProps {
  product: Product
  waLink: string | null
}

export default function ProductActions({ product, waLink }: ProductActionsProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  const handleAddToCart = () => {
    addToCart(product, quantity)
  }

  // Meng-update waLink agar memperhitungkan jumlah (kuantitas) barang yang dipilih
  const customWaLink = waLink
    ? createWhatsAppLink(
        product.whatsapp_num || '+62 856-0496-9571',
        quantity > 1 ? `${product.name} (x${quantity})` : product.name,
        product.price * quantity
      )
    : null

  return (
    <div className="space-y-4">
      {/* Kuantitas Selector */}
      <div className="flex items-center gap-4 bg-gray-50 border border-gray-100 p-3 rounded-2xl w-fit">
        <span className="text-xs font-semibold text-gray-500 px-1">Jumlah</span>
        <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-sm">
          <button
            type="button"
            className="p-1.5 text-gray-500 hover:text-fuchsia-600 transition-colors disabled:opacity-40"
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
            className="p-1.5 text-gray-500 hover:text-fuchsia-600 transition-colors"
            onClick={() => setQuantity(quantity + 1)}
            aria-label="Tambah jumlah"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-2.5">
        {/* Beli Langsung */}
        {customWaLink ? (
          <a
            href={customWaLink}
            target="_blank"
            rel="noopener noreferrer"
            id={`buy-wa-detail-${product.id}`}
            className="flex items-center justify-center gap-2.5 w-full px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm rounded-2xl hover:shadow-lg hover:shadow-green-200 hover:scale-[1.01] transition-all duration-200"
          >
            <span>📱</span>
            Beli Langsung via WhatsApp
          </a>
        ) : (
          <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-700">
            Hubungi admin untuk memesan produk ini.
          </div>
        )}

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
  )
}
