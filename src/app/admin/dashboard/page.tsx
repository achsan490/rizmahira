import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, Tag, TrendingUp, Plus } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalProducts },
    { count: totalCategories },
    { data: recentProducts },
    { data: userData },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('id, name, price, image_url, created_at, categories(name,icon)')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.auth.getUser(),
  ])

  const stats = [
    {
      label: 'Total Produk',
      value: totalProducts ?? 0,
      icon: Package,
      color: 'from-fuchsia-500 to-purple-600',
      href: '/admin/products',
    },
    {
      label: 'Kategori',
      value: totalCategories ?? 0,
      icon: Tag,
      color: 'from-orange-400 to-pink-500',
      href: '/admin/categories',
    },
    {
      label: 'Produk Aktif',
      value: totalProducts ?? 0,
      icon: TrendingUp,
      color: 'from-emerald-400 to-teal-500',
      href: '/admin/products',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Selamat datang, {userData?.user?.email}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-sm`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/admin/products/new"
          id="dashboard-add-product"
          className="flex items-center gap-4 p-5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white rounded-2xl hover:shadow-lg hover:shadow-purple-300/40 hover:scale-[1.02] transition-all duration-200"
        >
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold">Tambah Produk Baru</p>
            <p className="text-purple-200 text-xs mt-0.5">Upload foto & isi detail produk</p>
          </div>
        </Link>
        <Link
          href="/admin/categories"
          id="dashboard-manage-categories"
          className="flex items-center gap-4 p-5 bg-white border border-gray-100 text-gray-800 rounded-2xl hover:shadow-md hover:border-fuchsia-200 hover:scale-[1.02] transition-all duration-200"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-pink-100 rounded-xl flex items-center justify-center">
            <Tag className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="font-bold">Kelola Kategori</p>
            <p className="text-gray-500 text-xs mt-0.5">Tambah atau edit kategori produk</p>
          </div>
        </Link>
      </div>

      {/* Recent Products */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Produk Terbaru</h2>
          <Link
            href="/admin/products"
            className="text-sm text-fuchsia-600 hover:text-fuchsia-700 font-medium"
          >
            Lihat semua →
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentProducts && recentProducts.length > 0 ? (
            recentProducts.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">
                  {(p.categories as any)?.icon || '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">
                    {(p.categories as any)?.name} •{' '}
                    {new Date(p.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <p className="text-sm font-bold text-fuchsia-600 flex-shrink-0">
                  Rp {p.price.toLocaleString('id-ID')}
                </p>
              </div>
            ))
          ) : (
            <div className="px-6 py-10 text-center text-gray-400 text-sm">
              Belum ada produk. Mulai tambah produk pertama Anda!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
