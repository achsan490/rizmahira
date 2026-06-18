import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Rizmahira',
    default: 'Admin Panel | Rizmahira',
  },
  robots: { index: false, follow: false },
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
