import { createClient } from '@/lib/supabase/server'
import CategoryManager from './CategoryManager'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Kelola Kategori' }

export default async function AdminCategoriesPage() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Kategori</h1>
        <p className="text-gray-500 text-sm mt-1">
          {categories?.length ?? 0} kategori tersimpan
        </p>
      </div>
      <CategoryManager initialCategories={categories ?? []} />
    </div>
  )
}
