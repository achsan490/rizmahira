export type Category = {
  id: string
  name: string
  slug: string
  icon: string
  created_at: string
}

export type ProductVariant = {
  id: string
  product_id: string
  name: string
  price: number | null
  image_url: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export type Product = {
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
  created_at: string
  updated_at: string
  categories?: Category | null
  product_variants?: ProductVariant[]
}

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const createWhatsAppLink = (
  phone: string,
  productName: string,
  price: number,
  isPreorder?: boolean,
  preorderDays?: number,
  variantName?: string | null
): string => {
  const preorderMsg = isPreorder
    ? ` (Pre-Order ${preorderDays ? `${preorderDays} hari` : ''})`
    : ''
  const variantMsg = variantName ? ` [Varian: ${variantName}]` : ''
  const message = encodeURIComponent(
    `Halo, saya tertarik dengan produk *${productName}${variantMsg}${preorderMsg}* seharga *${formatRupiah(price)}*. Apakah masih tersedia?`
  )
  const cleanPhone = phone.replace(/\D/g, '').replace(/^0/, '62')
  return `https://wa.me/${cleanPhone}?text=${message}`
}

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}
