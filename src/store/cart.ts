/**
 * Cart Store — Zustand + localStorage persistence
 * Manages cart state with localStorage backup for guest checkout.
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { eventBus } from '@/lib/event-bus'

export interface CartStoreItem {
  id: string
  qty: number
  addedAt: string
}

export interface EnrichedCartItem extends CartStoreItem {
  name: string
  slug: string
  image: string
  regularPriceKobo: number
  salePriceKobo: number | null
  sku: string
  brand: string
  inStock: boolean
  maxQty: number
}

interface CartState {
  items: CartStoreItem[]
  enriched: EnrichedCartItem[]
  isEnriching: boolean

  // Actions
  addItem: (productId: string, qty?: number) => void
  removeItem: (productId: string) => void
  updateQty: (productId: string, qty: number) => void
  clearCart: () => void
  setEnriched: (items: EnrichedCartItem[]) => void

  // Computed
  totalItems: () => number
  subtotalKobo: () => number
  hasItem: (productId: string) => boolean
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      enriched: [],
      isEnriching: false,

      addItem: (productId: string, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === productId)
          const updated: CartStoreItem[] = existing
            ? state.items.map((i) => i.id === productId ? { ...i, qty: i.qty + qty } : i)
            : [...state.items, { id: productId, qty, addedAt: new Date().toISOString() }]
          return { items: updated }
        })
        eventBus.emit('cart:item-added', { productId, quantity: qty })
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('rg:cart-updated'))
        }
      },

      removeItem: (productId: string) => {
        set((state) => ({ items: state.items.filter((i) => i.id !== productId) }))
        eventBus.emit('cart:item-removed', { productId })
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('rg:cart-updated'))
        }
      },

      updateQty: (productId: string, qty: number) => {
        if (qty < 1) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) => i.id === productId ? { ...i, qty } : i),
        }))
        eventBus.emit('cart:quantity-updated', { productId, quantity: qty })
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('rg:cart-updated'))
        }
      },

      clearCart: () => {
        set({ items: [], enriched: [] })
        eventBus.emit('cart:cleared', {})
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('rg:cart-updated'))
        }
      },

      setEnriched: (enriched: EnrichedCartItem[]) => {
        set({ enriched })
      },

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      subtotalKobo: () =>
        get().enriched.reduce((sum, item) => {
          const price = item.salePriceKobo ?? item.regularPriceKobo ?? 0
          return sum + price * item.qty
        }, 0),
      hasItem: (productId: string) => get().items.some((i) => i.id === productId),
    }),
    {
      name: 'rg_cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)

/**
 * Hook to enrich cart items from API on mount.
 */
export async function enrichCartItems(items: CartStoreItem[]): Promise<EnrichedCartItem[]> {
  if (items.length === 0) return []
  try {
    const ids = items.map((i) => i.id).join(',')
    const res = await fetch(`/api/cart/items?ids=${ids}`)
    if (!res.ok) throw new Error('Failed to fetch cart items')
    const data = (await res.json()) as { products: EnrichedCartItem[] }
    return items.map((item) => {
      const product = data.products?.find((p) => p.id === item.id)
      return product ? { ...product, qty: item.qty } : { ...item, name: '', slug: '', image: '', regularPriceKobo: 0, salePriceKobo: null, sku: '', brand: '', inStock: true, maxQty: 99 } as EnrichedCartItem
    })
  } catch {
    return items.map((i) => ({ ...i, name: '', slug: '', image: '', regularPriceKobo: 0, salePriceKobo: null, sku: '', brand: '', inStock: true, maxQty: 99 } as EnrichedCartItem))
  }
}
