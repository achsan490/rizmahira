import { createClient } from '@/lib/supabase/server'
import ProductForm from '../ProductForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Tambah Produk Baru' }

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Produk Baru</h1>
        <p className="text-gray-500 text-sm mt-1">
          Isi detail produk dan upload foto untuk menampilkan di toko.
        </p>
      </div>
      <ProductForm categories={categories ?? []} />
    </div>
  )
}
