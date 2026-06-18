'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, Menu, X, Search, ShoppingCart } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { totalItems, setIsCartOpen } = useCart()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-fuchsia-600 to-purple-700 bg-clip-text text-transparent">
              Rizmahira
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-600 hover:text-fuchsia-600 transition-colors"
            >
              Beranda
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium text-gray-600 hover:text-fuchsia-600 transition-colors"
            >
              Semua Produk
            </Link>
            <Link
              href="/products?category=makanan-minuman"
              className="text-sm font-medium text-gray-600 hover:text-fuchsia-600 transition-colors"
            >
              Makanan
            </Link>
            <Link
              href="/products?category=aksesoris"
              className="text-sm font-medium text-gray-600 hover:text-fuchsia-600 transition-colors"
            >
              Aksesoris
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              id="navbar-cart-btn"
              className="relative p-2 text-gray-600 hover:text-fuchsia-600 hover:bg-purple-50 rounded-xl transition-all cursor-pointer"
              aria-label="Keranjang Belanja"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-fuchsia-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            <Link
              href="/products"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-sm font-semibold rounded-full hover:shadow-lg hover:shadow-purple-200 hover:scale-105 transition-all duration-200"
            >
              <Search className="w-4 h-4" />
              Cari Produk
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-purple-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-purple-100 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              {[
                { href: '/', label: 'Beranda' },
                { href: '/products', label: 'Semua Produk' },
                { href: '/products?category=makanan-minuman', label: 'Makanan & Minuman' },
                { href: '/products?category=aksesoris', label: 'Aksesoris' },
                { href: '/products?category=pakaian-fashion', label: 'Pakaian & Fashion' },
                { href: '/products?category=kecantikan-perawatan', label: 'Kecantikan' },
                { href: '/products?category=elektronik', label: 'Elektronik' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-fuchsia-600 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
