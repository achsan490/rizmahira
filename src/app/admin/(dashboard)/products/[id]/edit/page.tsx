import { createClient } from '@/lib/supabase/server'
import ProductForm from '../../ProductForm'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = { title: 'Edit Produk' }

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('categories').select('*').order('name'),
  ])

  if (!product) notFound()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Produk</h1>
        <p className="text-gray-500 text-sm mt-1 truncate max-w-md">
          {product.name}
        </p>
      </div>
      <ProductForm categories={categories ?? []} product={product} />
    </div>
  )
}
