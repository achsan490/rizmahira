import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Rizmahira Shop',
    default: 'Rizmahira Shop — Belanja Online Terpercaya',
  },
  description:
    'Temukan produk pilihan terbaik: makanan, aksesoris, pakaian, kecantikan, elektronik, dan banyak lagi di Rizmahira Shop.',
  keywords: ['toko online', 'belanja online', 'makanan', 'aksesoris', 'fashion'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className={jakartaSans.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
