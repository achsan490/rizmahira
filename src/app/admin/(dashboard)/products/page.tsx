import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Package } from 'lucide-react'
import { formatRupiah } from '@/lib/utils'
import DeleteProductButton from './DeleteProductButton'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kelola Produk' }

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name, icon)')
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Produk</h1>
          <p className="text-gray-500 text-sm mt-1">{products?.length ?? 0} produk tersimpan</p>
        </div>
        <Link
          href="/admin/products/new"
          id="add-product-btn"
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-300/40 hover:scale-[1.02] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {products && products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Produk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Kategori
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Harga
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
                          {(product.categories as any)?.icon || '📦'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate max-w-[180px]">
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-600">
                        {(product.categories as any)?.name ?? (
                          <span className="text-gray-300 italic">—</span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-fuchsia-600">
                        {formatRupiah(product.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          product.is_active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {product.is_active ? '● Aktif' : '● Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          id={`edit-product-${product.id}`}
                          className="p-2 text-gray-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-purple-300" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">Belum ada produk</h3>
            <p className="text-gray-400 text-sm mb-6">
              Mulai tambahkan produk pertama Anda sekarang.
            </p>
            <Link
              href="/admin/products/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-fuchsia-600 text-white text-sm font-semibold rounded-xl hover:bg-fuchsia-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Produk Pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
