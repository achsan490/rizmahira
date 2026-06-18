'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

interface Props {
  productId: string
  productName: string
}

export default function DeleteProductButton({ productId, productName }: Props) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Hapus produk "${productName}"? Tindakan ini tidak dapat dibatalkan.`)) return

    setIsDeleting(true)
    const supabase = createClient()

    // Delete product (image cleanup optional — Supabase Storage)
    const { error } = await supabase.from('products').delete().eq('id', productId)

    if (error) {
      alert('Gagal menghapus produk. Silakan coba lagi.')
      setIsDeleting(false)
      return
    }

    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      id={`delete-product-${productId}`}
      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
      title="Hapus"
    >
      {isDeleting ? (
        <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin inline-block" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
    </button>
  )
}
