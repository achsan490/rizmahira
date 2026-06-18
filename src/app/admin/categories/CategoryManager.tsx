'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import { Plus, Pencil, Trash2, Save, X, Tag } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  icon: string
}

const POPULAR_ICONS = ['🍔', '💍', '👗', '💄', '📱', '🏠', '🎮', '👟', '📚', '🌸', '🎁', '🧴', '🛒', '🍰', '☕']

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Form state
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formIcon, setFormIcon] = useState('📦')

  const resetForm = () => {
    setFormName('')
    setFormSlug('')
    setFormIcon('📦')
    setError('')
    setIsAdding(false)
    setEditingId(null)
  }

  const startEdit = (cat: Category) => {
    setEditingId(cat.id)
    setFormName(cat.name)
    setFormSlug(cat.slug)
    setFormIcon(cat.icon || '📦')
    setIsAdding(false)
    setError('')
  }

  const handleSave = async (isEdit: boolean, id?: string) => {
    if (!formName.trim()) {
      setError('Nama kategori wajib diisi.')
      return
    }
    setIsLoading(true)
    setError('')

    const supabase = createClient()
    const payload = { name: formName.trim(), slug: formSlug || slugify(formName), icon: formIcon }

    let newCat: Category | null = null
    if (isEdit && id) {
      const { data, error: err } = await supabase
        .from('categories')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (err) { setError(err.message); setIsLoading(false); return }
      newCat = data
      setCategories((prev) => prev.map((c) => (c.id === id ? newCat! : c)))
    } else {
      const { data, error: err } = await supabase
        .from('categories')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select()
        .single()
      if (err) { setError(err.message); setIsLoading(false); return }
      newCat = data
      setCategories((prev) => [...prev, newCat!].sort((a, b) => a.name.localeCompare(b.name)))
    }

    setIsLoading(false)
    resetForm()
    router.refresh()
  }

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.name}"? Produk dalam kategori ini tidak akan terhapus, hanya kategorinya.`)) return

    const supabase = createClient()
    const { error: err } = await supabase.from('categories').delete().eq('id', cat.id)
    if (err) { alert('Gagal menghapus kategori.'); return }
    setCategories((prev) => prev.filter((c) => c.id !== cat.id))
    router.refresh()
  }

  const FormBlock = ({ isEdit, id }: { isEdit: boolean; id?: string }) => (
    <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-2xl p-5 space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Icon picker */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">Pilih Icon</p>
        <div className="flex flex-wrap gap-2">
          {POPULAR_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setFormIcon(ic)}
              className={`w-9 h-9 text-xl rounded-xl flex items-center justify-center transition-all ${
                formIcon === ic
                  ? 'bg-fuchsia-600 shadow-md scale-110'
                  : 'bg-white border border-gray-200 hover:border-fuchsia-300'
              }`}
            >
              {ic}
            </button>
          ))}
          <input
            type="text"
            value={formIcon}
            onChange={(e) => setFormIcon(e.target.value)}
            maxLength={2}
            placeholder="✏️"
            className="w-9 h-9 text-center text-xl rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Nama Kategori *</label>
          <input
            type="text"
            value={formName}
            onChange={(e) => { setFormName(e.target.value); if (!isEdit) setFormSlug(slugify(e.target.value)) }}
            placeholder="Makanan & Minuman"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            placeholder="makanan-minuman"
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400 font-mono"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={resetForm}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" /> Batal
        </button>
        <button
          type="button"
          onClick={() => handleSave(isEdit, id)}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-fuchsia-600 rounded-xl hover:bg-fuchsia-700 disabled:opacity-60 transition-colors"
        >
          {isLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Simpan
        </button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Add Button */}
      {!isAdding && !editingId && (
        <button
          id="add-category-btn"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-300/40 hover:scale-[1.02] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </button>
      )}

      {/* Add Form */}
      {isAdding && <FormBlock isEdit={false} />}

      {/* Category List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {categories.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {categories.map((cat) => (
              <div key={cat.id}>
                {editingId === cat.id ? (
                  <div className="p-4">
                    <FormBlock isEdit={true} id={cat.id} />
                  </div>
                ) : (
                  <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/50 transition-colors">
                    <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-50 to-purple-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {cat.icon || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{cat.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(cat)}
                        id={`edit-category-${cat.id}`}
                        className="p-2 text-gray-400 hover:text-fuchsia-600 hover:bg-fuchsia-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat)}
                        id={`delete-category-${cat.id}`}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mb-4">
              <Tag className="w-8 h-8 text-purple-300" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-2">Belum ada kategori</h3>
            <p className="text-gray-400 text-sm">Tambahkan kategori pertama untuk mulai mengorganisir produk.</p>
          </div>
        )}
      </div>
    </div>
  )
}
