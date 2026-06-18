'use client'

import { useCart } from '@/context/CartContext'
import { formatRupiah } from '@/lib/utils'
import { X, ShoppingBag, Plus, Minus, Trash2, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
    totalItems,
  } = useCart()

  if (!isCartOpen) return null

  const handleCheckout = () => {
    if (cart.length === 0) return

    const lineItemsText = cart
      .map((item, index) => {
        const catIcon = item.product.categories?.icon || '📦'
        return `${index + 1}. ${catIcon} *${item.product.name}* (Qty: ${item.quantity}) - ${formatRupiah(
          item.product.price * item.quantity
        )}`
      })
      .join('\n')

    const message = `Halo Admin Rizmahira Shop, saya ingin memesan produk-produk berikut:\n\n${lineItemsText}\n\n*Total Belanja:* *${formatRupiah(
      totalPrice
    )}*\n\nApakah produk-produk tersebut tersedia? Terima kasih!`

    const cleanPhone = '6285604969571' // Nomor WhatsApp pusat admin (+62 856-0496-9571)
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`

    // Reset keranjang setelah checkout dikirim
    clearCart()
    setIsCartOpen(false)

    // Arahkan ke WhatsApp
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  const isSupabaseUrl = (url: string) => url.includes('supabase.co')

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop overlay */}
        <div
          className="absolute inset-0 bg-gray-500/75 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsCartOpen(false)}
        />

        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
          {/* Sliding panel */}
          <div className="pointer-events-auto w-screen max-w-md transform bg-white shadow-2xl transition-transform duration-300 animate-in slide-in-from-right">
            <div className="flex h-full flex-col overflow-y-scroll bg-white">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-6 sm:px-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-gray-900" id="slide-over-title">
                    Keranjang Belanja
                  </h2>
                  <span className="ml-1.5 px-2 py-0.5 bg-fuchsia-100 text-fuchsia-700 text-xs font-semibold rounded-full">
                    {totalItems} Item
                  </span>
                </div>
                <button
                  type="button"
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
                  onClick={() => setIsCartOpen(false)}
                >
                  <span className="sr-only">Tutup panel</span>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                    <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 text-3xl">
                      🛍️
                    </div>
                    <p className="font-semibold text-gray-700">Keranjang Anda Kosong</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                      Jelajahi produk kami dan tambahkan barang belanjaan Anda ke sini.
                    </p>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-xs font-bold rounded-xl hover:shadow-md transition-all"
                    >
                      Mulai Belanja
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex py-4 border-b border-gray-50 last:border-0">
                        {/* Product Image */}
                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                          {item.product.image_url ? (
                            isSupabaseUrl(item.product.image_url) ? (
                              <Image
                                src={item.product.image_url}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                                sizes="80px"
                              />
                            ) : (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">
                              📦
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="ml-4 flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex justify-between text-sm font-semibold text-gray-900">
                              <h3 className="line-clamp-1 hover:text-fuchsia-600">
                                <Link
                                  href={`/products/${item.product.slug}`}
                                  onClick={() => setIsCartOpen(false)}
                                >
                                  {item.product.name}
                                </Link>
                              </h3>
                              <p className="ml-4 text-fuchsia-600">{formatRupiah(item.product.price * item.quantity)}</p>
                            </div>
                            <p className="mt-0.5 text-xs text-gray-400">
                              {item.product.categories?.icon} {item.product.categories?.name}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            {/* Quantity Selector */}
                            <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                              <button
                                type="button"
                                className="p-1.5 text-gray-500 hover:text-fuchsia-600 transition-colors"
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                aria-label="Kurangi kuantitas"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 font-bold text-gray-800 text-xs">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="p-1.5 text-gray-500 hover:text-fuchsia-600 transition-colors"
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                aria-label="Tambah kuantitas"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Remove Button */}
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.product.id)}
                              className="font-medium text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer / Summary */}
              {cart.length > 0 && (
                <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-6 sm:px-6 space-y-4">
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <p>Total Belanja</p>
                    <p className="text-lg text-fuchsia-600">{formatRupiah(totalPrice)}</p>
                  </div>
                  <p className="text-xs text-gray-500 leading-normal">
                    Pemesanan akan langsung dikirim ke WhatsApp admin pusat untuk dikonfirmasi ketersediaan stoknya.
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={handleCheckout}
                      className="flex w-full items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-sm rounded-xl hover:shadow-lg hover:shadow-green-200 hover:scale-[1.02] transition-all duration-200"
                    >
                      <span>📱</span>
                      Kirim Pesanan via WhatsApp
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="flex w-full items-center justify-center px-6 py-2.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-100 hover:text-gray-700 transition-all"
                    >
                      Lanjutkan Belanja
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
