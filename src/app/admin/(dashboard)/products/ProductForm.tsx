'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import Image from 'next/image'
import { Upload, X, ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  icon: string
}

interface ProductFormProps {
  categories: Category[]
  product?: {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    category_id: string | null
    image_url: string | null
    is_active: boolean
    whatsapp_num: string | null
    is_preorder?: boolean
    preorder_days?: number
    product_variants?: {
      id: string
      name: string
      price: number | null
      image_url: string | null
      is_active: boolean
    }[]
  }
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isEdit = !!product

  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [categoryId, setCategoryId] = useState(product?.category_id ?? '')
  const [whatsappNum, setWhatsappNum] = useState(product?.whatsapp_num ?? '+62 856-0496-9571')
  const [isActive, setIsActive] = useState(product?.is_active ?? true)
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(product?.image_url ?? '')
  const [isPreorder, setIsPreorder] = useState(product?.is_preorder ?? false)
  const [preorderDays, setPreorderDays] = useState(product?.preorder_days?.toString() ?? '7')
  const [useVariants, setUseVariants] = useState(
    (product?.product_variants && product.product_variants.length > 0) ?? false
  )
  const [variants, setVariants] = useState<{ id?: string; name: string; price: string; image_url: string }[]>(
    product?.product_variants?.map((v) => ({
      id: v.id,
      name: v.name,
      price: v.price?.toString() ?? '',
      image_url: v.image_url ?? '',
    })) ?? []
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAddVariant = () => {
    setVariants([...variants, { name: '', price: '', image_url: '' }])
  }

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const handleVariantChange = (index: number, field: string, value: string) => {
    setVariants(
      variants.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    )
  }

  const handleNameChange = (val: string) => {
    setName(val)
    if (!isEdit) setSlug(slugify(val))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran gambar maksimal 5MB.')
      return
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setImageUrl('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const supabase = createClient()
    let finalImageUrl = imageUrl

    // Upload gambar jika ada file baru
    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, imageFile, { upsert: true })

      if (uploadError) {
        setError('Gagal upload gambar: ' + uploadError.message)
        setIsLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(uploadData.path)
      finalImageUrl = urlData.publicUrl
    }

    const payload = {
      name,
      slug,
      description: description || null,
      price: parseFloat(price),
      category_id: categoryId || null,
      image_url: finalImageUrl || null,
      is_active: isActive,
      whatsapp_num: whatsappNum || null,
      is_preorder: isPreorder,
      preorder_days: isPreorder ? parseInt(preorderDays) || 0 : 0,
      updated_at: new Date().toISOString(),
    }

    let dbError
    let productId = product?.id

    if (isEdit) {
      const { error } = await supabase.from('products').update(payload).eq('id', product!.id)
      dbError = error
    } else {
      const { data: insertedData, error } = await supabase
        .from('products')
        .insert({ ...payload, created_at: new Date().toISOString() })
        .select('id')
        .single()
      dbError = error
      if (insertedData) {
        productId = insertedData.id
      }
    }

    if (!dbError && productId) {
      // Hapus varian lama
      await supabase.from('product_variants').delete().eq('product_id', productId)

      // Simpan varian baru jika aktif
      if (useVariants && variants.length > 0) {
        const variantsPayload = variants
          .filter((v) => v.name.trim() !== '')
          .map((v) => ({
            product_id: productId,
            name: v.name.trim(),
            price: v.price ? parseFloat(v.price) : null,
            image_url: v.image_url.trim() || null,
            is_active: true,
          }))

        if (variantsPayload.length > 0) {
          const { error: variantError } = await supabase
            .from('product_variants')
            .insert(variantsPayload)
          
          if (variantError) {
            setError('Produk tersimpan, tetapi gagal menyimpan varian: ' + variantError.message)
            setIsLoading(false)
            return
          }
        }
      }
    }

    if (dbError) {
      setError('Gagal menyimpan produk: ' + dbError.message)
      setIsLoading(false)
      return
    }

    router.push('/admin/products')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Fields */}
        <div className="lg:col-span-2 space-y-5">
          {/* Nama Produk */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Informasi Produk</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="product-name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  placeholder="Contoh: Keripik Singkong Pedas"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all bg-gray-50"
                />
              </div>

              <div>
                <label htmlFor="product-slug" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Slug URL
                </label>
                <input
                  id="product-slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="keripik-singkong-pedas"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all bg-gray-50 font-mono text-xs"
                />
                <p className="text-xs text-gray-400 mt-1">
                  URL produk: /products/<span className="text-fuchsia-600">{slug || 'slug-produk'}</span>
                </p>
              </div>

              <div>
                <label htmlFor="product-description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  id="product-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Deskripsikan produk Anda secara lengkap..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all bg-gray-50 resize-none"
                />
              </div>

              <div>
                <label htmlFor="product-whatsapp" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nomor WhatsApp
                </label>
                <input
                  id="product-whatsapp"
                  type="text"
                  value={whatsappNum}
                  onChange={(e) => setWhatsappNum(e.target.value)}
                  placeholder="628123456789"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all bg-gray-50"
                />
                <p className="text-xs text-gray-400 mt-1">Format: 628xxx (tanpa + atau spasi)</p>
              </div>
            </div>
          </div>

          {/* Varian Produk */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-800">Varian Produk</h2>
                <p className="text-xs text-gray-400 mt-0.5">Aktifkan jika produk memiliki pilihan warna, ukuran, dll.</p>
              </div>
              <button
                type="button"
                id="product-use-variants-toggle"
                onClick={() => {
                  setUseVariants(!useVariants)
                  if (!useVariants && variants.length === 0) {
                    setVariants([{ name: '', price: '', image_url: '' }])
                  }
                }}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                  useVariants ? 'bg-fuchsia-500' : 'bg-gray-200'
                }`}
                aria-label="Toggle varian"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    useVariants ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {useVariants && (
              <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="space-y-3">
                  {variants.map((variant, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 p-4 rounded-xl relative group border border-gray-100">
                      <div className="flex-1 w-full">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Nama Varian <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                          required
                          placeholder="Contoh: Merah, XL, atau 2 Lapis"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all bg-white"
                        />
                      </div>

                      <div className="w-full sm:w-44">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          Harga Khusus (Rp)
                        </label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                          placeholder="Sama dengan produk"
                          min="0"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all bg-white"
                        />
                      </div>

                      <div className="flex-1 w-full">
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                          URL Gambar Varian
                        </label>
                        <input
                          type="url"
                          value={variant.image_url}
                          onChange={(e) => handleVariantChange(index, 'image_url', e.target.value)}
                          placeholder="https://example.com/gambar.jpg"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all bg-white font-mono"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="absolute sm:static top-2 right-2 text-gray-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 sm:mt-5 transition-colors cursor-pointer"
                        title="Hapus varian"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddVariant}
                  className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-xs font-semibold hover:border-fuchsia-300 hover:text-fuchsia-600 hover:bg-fuchsia-50/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Varian
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Fields */}
        <div className="space-y-5">
          {/* Upload Foto */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="font-semibold text-gray-800 mb-4">Foto Produk</h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-colors ${
                imagePreview
                  ? 'border-fuchsia-200'
                  : 'border-gray-200 hover:border-fuchsia-300 hover:bg-fuchsia-50'
              }`}
            >
              {imagePreview ? (
                <div className="relative aspect-square">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleRemoveImage() }}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                    aria-label="Hapus gambar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="aspect-square flex flex-col items-center justify-center gap-2 text-gray-400 p-6">
                  <Upload className="w-8 h-8" />
                  <p className="text-xs text-center font-medium">Klik untuk upload foto</p>
                  <p className="text-xs text-center">JPG, PNG, WebP (Maks 5MB)</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="product-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="mt-4">
              <label htmlFor="product-image-url" className="block text-xs font-semibold text-gray-500 mb-1.5">
                Atau masukkan URL Gambar
              </label>
              <input
                id="product-image-url"
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value)
                  setImagePreview(e.target.value)
                  if (e.target.value) {
                    setImageFile(null)
                  }
                }}
                placeholder="https://example.com/foto-produk.jpg"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all bg-gray-50 font-mono"
              />
            </div>
          </div>

          {/* Harga & Kategori */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-gray-800">Harga & Kategori</h2>

            <div>
              <label htmlFor="product-price" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Harga (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                id="product-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                placeholder="25000"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="product-category" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Kategori
              </label>
              <select
                id="product-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all bg-gray-50"
              >
                <option value="">— Pilih Kategori —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Pre-Order Toggle */}
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  id="product-preorder-toggle"
                  onClick={() => setIsPreorder(!isPreorder)}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                    isPreorder ? 'bg-fuchsia-500' : 'bg-gray-200'
                  }`}
                  aria-label="Toggle status pre-order"
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      isPreorder ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Sistem Pre-Order
                </span>
              </div>
            </div>

            {isPreorder && (
              <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                <label htmlFor="product-preorder-days" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Estimasi Waktu Proses (Hari)
                </label>
                <input
                  id="product-preorder-days"
                  type="number"
                  value={preorderDays}
                  onChange={(e) => setPreorderDays(e.target.value)}
                  required
                  min="1"
                  placeholder="7"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-400 focus:border-transparent transition-all bg-gray-50"
                />
              </div>
            )}

            <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                id="product-active-toggle"
                onClick={() => setIsActive(!isActive)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                  isActive ? 'bg-fuchsia-500' : 'bg-gray-200'
                }`}
                aria-label="Toggle status aktif"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-gray-700">
                {isActive ? 'Produk Tersedia (Ready)' : 'Produk Tidak Tersedia (Kosong)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/admin/products"
          className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Batal
        </Link>
        <button
          type="submit"
          id="save-product-btn"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-purple-300/40 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
