import AdminSidebar from '@/components/admin/AdminSidebar'
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
  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto lg:pt-0 pt-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
