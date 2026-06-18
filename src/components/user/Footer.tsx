import Link from 'next/link'
import { ShoppingBag, Share2, MessageCircle } from 'lucide-react'

export default function Footer() {
  const categories = [
    { name: '🍔 Makanan & Minuman', slug: 'makanan-minuman' },
    { name: '💍 Aksesoris', slug: 'aksesoris' },
    { name: '👗 Pakaian & Fashion', slug: 'pakaian-fashion' },
    { name: '💄 Kecantikan', slug: 'kecantikan-perawatan' },
    { name: '📱 Elektronik', slug: 'elektronik' },
    { name: '🏠 Perlengkapan Rumah', slug: 'perlengkapan-rumah' },
    { name: '🎮 Mainan & Hobi', slug: 'mainan-hobi' },
  ]

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Rizmahira</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Toko online terpercaya dengan produk pilihan berkualitas. Belanja
              mudah, cepat, dan aman langsung via WhatsApp.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-fuchsia-600 transition-colors"
                aria-label="Instagram"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Kategori Produk</h3>
            <ul className="space-y-2">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/products?category=${cat.slug}`}
                    className="text-sm text-gray-400 hover:text-fuchsia-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Informasi</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm text-gray-400 hover:text-fuchsia-400 transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-sm text-gray-400 hover:text-fuchsia-400 transition-colors"
                >
                  Semua Produk
                </Link>
              </li>
              <li>
                <p className="text-sm text-gray-400">
                  Jam Operasional: 08.00 – 21.00 WIB
                </p>
              </li>
              <li>
                <p className="text-sm text-gray-400">Senin – Minggu</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Rizmahira Shop. All rights reserved.
          </p>
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span>Made by</span>
            <a
              href="https://github.com/achsan490"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-semibold text-gray-300 hover:text-white transition-colors"
            >
              <img
                src="/san-project.png"
                alt="San Project Logo"
                className="w-5 h-5 rounded-full object-cover border border-gray-800"
              />
              <span>San Project</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
