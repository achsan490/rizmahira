import Navbar from '@/components/user/Navbar'
import Footer from '@/components/user/Footer'
import { CartProvider } from '@/context/CartContext'
import CartDrawer from '@/components/user/CartDrawer'

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  )
}
