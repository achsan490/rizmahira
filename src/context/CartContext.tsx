'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { type Product, type ProductVariant } from '@/lib/utils'

export type CartItem = {
  product: Product
  quantity: number
  selectedVariant?: ProductVariant | null
}

interface CartContextType {
  cart: CartItem[]
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  addToCart: (product: Product, quantity?: number, selectedVariant?: ProductVariant | null) => void
  removeFromCart: (productId: string, variantId?: string | null) => void
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('rizmahira_cart')
      if (storedCart) {
        setCart(JSON.parse(storedCart))
      }
    } catch (err) {
      console.error('Failed to load cart from localStorage:', err)
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage when cart changes
  useEffect(() => {
    if (!isInitialized) return
    try {
      localStorage.setItem('rizmahira_cart', JSON.stringify(cart))
    } catch (err) {
      console.error('Failed to save cart to localStorage:', err)
    }
  }, [cart, isInitialized])

  const addToCart = (product: Product, quantity = 1, selectedVariant: ProductVariant | null = null) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedVariant?.id === selectedVariant?.id
      )
      if (existingItem) {
        return prevCart.map((item) =>
          item.product.id === product.id &&
          item.selectedVariant?.id === selectedVariant?.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prevCart, { product, quantity, selectedVariant }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (productId: string, variantId: string | null = null) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(item.product.id === productId && item.selectedVariant?.id === variantId)
      )
    )
  }

  const updateQuantity = (productId: string, quantity: number, variantId: string | null = null) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId)
      return
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.selectedVariant?.id === variantId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)
  const totalPrice = cart.reduce((total, item) => {
    const price = item.selectedVariant?.price ?? item.product.price
    return total + price * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
