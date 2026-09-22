'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Tag, X } from 'lucide-react'
import { cn, formatNaira } from '@/lib/utils'
import type { EnrichedCartItem } from '@/store/cart'
import CartDrawer from './CartDrawer'

export default function CartComponents() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    const handler = () => setDrawerOpen(true)
    window.addEventListener('rg:open-cart-drawer', handler)
    return () => window.removeEventListener('rg:open-cart-drawer', handler)
  }, [])

  return <CartDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
}
