'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, ShoppingCart, User, CreditCard, Wallet, Banknote, 
  Building2, Receipt, Trash2, Plus, Minus, X, Check, 
  History, Printer, Loader2, ScanBarcode, Package,
  ChevronRight, AlertCircle
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { cn, formatNaira, generateOrderNumber } from '@/lib/utils'

interface Product {
  id: string
  name: string
  sku: string
  barcode: string | null
  regular_price_kobo: number
  sale_price_kobo: number | null
  images: { url: string }[]
  inventory: { branch_id: string; quantity: number }[]
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  wallet_balance_kobo: number
}

interface CartItem {
  productId: string
  variantId?: string
  name: string
  sku: string
  priceKobo: number
  quantity: number
  image: string
}

interface RecentTransaction {
  id: string
  order_number: string
  total_kobo: number
  payment_method: string
  created_at: string
  customer_name: string | null
}

interface Branch {
  id: string
  name: string
}

type PaymentMethod = 'cash' | 'card' | 'paystack' | 'wallet'

const paymentSchema = z.object({
  amountPaid: z.string().optional(),
  notes: z.string().optional(),
})

type PaymentFormData = z.infer<typeof paymentSchema>

const VAT_RATE = 0.075

export default function POSContent() {
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCompletingSale, setIsCompletingSale] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastOrder, setLastOrder] = useState<{ orderNumber: string; changeKobo: number } | null>(null)
  const [activeTab, setActiveTab] = useState<'products' | 'transactions'>('products')
  const barcodeInputRef = useRef<HTMLInputElement>(null)

  const { register, watch, setValue } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { amountPaid: '', notes: '' },
  })

  const amountPaid = watch('amountPaid')

  useEffect(() => {
    loadBranches()
    loadRecentTransactions()
    const savedCart = localStorage.getItem('pos_cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('pos_cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchProducts(searchQuery)
      } else {
        setProducts([])
      }
    }, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (customerSearch.length >= 2) {
        searchCustomers(customerSearch)
      } else {
        setCustomers([])
      }
    }, 300)
    return () => clearTimeout(debounce)
  }, [customerSearch])

  useEffect(() => {
    barcodeInputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault()
        if (cart.length > 0) completeSale()
      }
      if (e.key === 'F2') {
        e.preventDefault()
        clearCart()
      }
      if (e.key === 'F3') {
        e.preventDefault()
        barcodeInputRef.current?.focus()
      }
      if (e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setCustomerSearch('')
        setSelectedCustomer(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cart])

  const loadBranches = async () => {
    try {
      const res = await fetch('/api/branches?active=true')
      const data = await res.json()
      setBranches(data.branches ?? [])
      if (data.branches?.[0]) {
        setSelectedBranch(data.branches[0].id)
      }
    } catch {}
  }

  const loadRecentTransactions = async () => {
    try {
      const res = await fetch('/api/pos/transactions?limit=10')
      const data = await res.json()
      setRecentTransactions(data.transactions ?? [])
    } catch {}
  }

  const searchProducts = async (query: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/pos/products?q=${encodeURIComponent(query)}&limit=20`)
      const data = await res.json()
      setProducts(data.products ?? [])
    } catch {
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  const searchCustomers = async (query: string) => {
    try {
      const res = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}&limit=10`)
      const data = await res.json()
      setCustomers(data.customers ?? [])
    } catch {
      setCustomers([])
    }
  }

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const barcode = (e.target as HTMLInputElement).value.trim()
      if (barcode) {
        searchProducts(barcode)
        ;(e.target as HTMLInputElement).value = ''
      }
    }
  }

  const addToCart = (product: Product) => {
    const branchInventory = product.inventory?.find(inv => inv.branch_id === selectedBranch)
    const availableQty = branchInventory?.quantity ?? 0

    if (availableQty <= 0) {
      toast.error('Product out of stock at this branch')
      return
    }

    const effectivePrice = product.sale_price_kobo ?? product.regular_price_kobo

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        if (existing.quantity >= availableQty) {
          toast.error('Maximum stock reached')
          return prev
        }
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        priceKobo: effectivePrice,
        quantity: 1,
        image: product.images?.[0]?.url ?? '',
      }]
    })
    toast.success(`${product.name} added to cart`)
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta
        return newQty > 0 ? { ...item, quantity: newQty } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId))
  }

  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setValue('amountPaid', '')
    toast.success('Cart cleared')
  }

  const subtotalKobo = cart.reduce((sum, item) => sum + (item.priceKobo * item.quantity), 0)
  const vatKobo = Math.round(subtotalKobo * VAT_RATE)
  const totalKobo = subtotalKobo + vatKobo
  const amountPaidKobo = parseInt(amountPaid || '0') * 100
  const changeKobo = paymentMethod === 'cash' && amountPaidKobo > totalKobo ? amountPaidKobo - totalKobo : 0

  const completeSale = async () => {
    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }
    if (!selectedBranch) {
      toast.error('Please select a branch')
      return
    }
    if (paymentMethod === 'cash' && amountPaidKobo < totalKobo) {
      toast.error('Amount paid is less than total')
      return
    }
    if (paymentMethod === 'wallet' && selectedCustomer) {
      if (selectedCustomer.wallet_balance_kobo < totalKobo) {
        toast.error('Customer has insufficient wallet balance')
        return
      }
    }

    setIsCompletingSale(true)
    try {
      const res = await fetch('/api/pos/complete-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPriceKobo: item.priceKobo,
          })),
          customerId: selectedCustomer?.id,
          branchId: selectedBranch,
          paymentMethod,
          amountPaidKobo: paymentMethod === 'cash' ? amountPaidKobo : undefined,
          notes: watch('notes'),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to complete sale')

      setLastOrder({ orderNumber: data.orderNumber, changeKobo: data.changeKobo ?? 0 })
      setShowReceipt(true)
      setCart([])
      setSelectedCustomer(null)
      setValue('amountPaid', '')
      setValue('notes', '')
      loadRecentTransactions()
      toast.success('Sale completed successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to complete sale')
    } finally {
      setIsCompletingSale(false)
    }
  }

  const printReceipt = () => {
    window.print()
  }

  return (
    <div className="h-[calc(100vh-64px)] flex">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="bg-brand-navy text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <ScanBarcode className="w-5 h-5 text-brand-blue" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Scan barcode or type SKU (F3 to focus)"
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm w-64 placeholder:text-white/50 focus:outline-none focus:border-brand-blue"
                onKeyDown={handleBarcodeScan}
              />
            </div>
            <div className="h-6 w-px bg-white/20" />
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-text-4" />
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue"
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id} className="text-text-1">{b.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-manrope">
            <span className="text-text-4"><kbd className="bg-white/10 px-1.5 py-0.5 rounded">F1</kbd> Pay</span>
            <span className="text-text-4"><kbd className="bg-white/10 px-1.5 py-0.5 rounded">F2</kbd> Clear</span>
            <span className="text-text-4"><kbd className="bg-white/10 px-1.5 py-0.5 rounded">F3</kbd> Search</span>
            <span className="text-text-4"><kbd className="bg-white/10 px-1.5 py-0.5 rounded">Shift+N</kbd> New Customer</span>
          </div>
        </div>

        <div className="flex gap-4 p-4 border-b border-brand-border bg-white">
          <button
            onClick={() => setActiveTab('products')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-manrope font-600 transition-colors',
              activeTab === 'products' ? 'bg-brand-blue text-white' : 'text-text-3 hover:bg-brand-offwhite'
            )}
          >
            <Package className="w-4 h-4" /> Products
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-manrope font-600 transition-colors',
              activeTab === 'transactions' ? 'bg-brand-blue text-white' : 'text-text-3 hover:bg-brand-offwhite'
            )}
          >
            <History className="w-4 h-4" /> Recent Transactions
          </button>
          <div className="flex-1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm w-64 focus:outline-none focus:border-brand-blue"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-brand-offwhite">
          {activeTab === 'products' ? (
            <>
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-brand-border h-48 animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 && searchQuery.length >= 2 ? (
                <div className="text-center py-12 text-text-4 font-manrope">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No products found</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 text-text-4 font-manrope">
                  <ScanBarcode className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Scan a barcode or search for products</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {products.map(product => {
                    const branchInv = product.inventory?.find(inv => inv.branch_id === selectedBranch)
                    const inStock = (branchInv?.quantity ?? 0) > 0
                    const price = product.sale_price_kobo ?? product.regular_price_kobo
                    return (
                      <motion.button
                        key={product.id}
                        whileHover={{ y: -2 }}
                        onClick={() => addToCart(product)}
                        disabled={!inStock}
                        className={cn(
                          'bg-white rounded-xl border border-brand-border p-3 text-left transition-shadow hover:shadow-card-hover',
                          !inStock && 'opacity-50 cursor-not-allowed'
                        )}
                      >
                        <div className="aspect-square bg-brand-offwhite rounded-lg mb-3 overflow-hidden">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-4">
                              <Package className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-syne font-700 text-sm text-text-1 line-clamp-2">{product.name}</h3>
                        <p className="font-mono text-xs text-text-4 mt-1">{product.sku}</p>
                        <p className="font-syne font-800 text-brand-blue mt-2">{formatNaira(price)}</p>
                        {!inStock && (
                          <span className="text-xs text-brand-red font-manrope">Out of stock</span>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
              {recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-text-4 font-manrope">No recent transactions</div>
              ) : (
                <div className="divide-y divide-brand-border">
                  {recentTransactions.map(tx => (
                    <div key={tx.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <p className="font-mono text-xs text-brand-blue">{tx.order_number}</p>
                        <p className="text-xs text-text-4 mt-0.5">{tx.customer_name ?? 'Guest'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-syne font-700 text-sm">{formatNaira(tx.total_kobo)}</p>
                        <p className="text-xs text-text-4 capitalize">{tx.payment_method}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-96 bg-white border-l border-brand-border flex flex-col">
        <div className="p-4 border-b border-brand-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-syne font-800 text-lg text-text-1 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-brand-blue" /> Cart
              <span className="bg-brand-blue text-white text-xs px-2 py-0.5 rounded-full">
                {cart.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            </h2>
            <button
              onClick={clearCart}
              className="p-2 text-text-4 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <input
              type="text"
              placeholder="Search customer (Shift+N for new)"
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value)
                if (!e.target.value) setSelectedCustomer(null)
              }}
              className="w-full pl-9 pr-4 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue"
            />
            {customers.length > 0 && customerSearch && !selectedCustomer && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-brand-border rounded-lg shadow-card z-10">
                {customers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c)
                      setCustomerSearch(c.name)
                      setCustomers([])
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-brand-offwhite first:rounded-t-lg last:rounded-b-lg"
                  >
                    <p className="font-manrope text-sm text-text-1">{c.name}</p>
                    <p className="text-xs text-text-4">{c.email}</p>
                  </button>
                ))}
              </div>
            )}
            {selectedCustomer && (
              <div className="mt-2 p-2 bg-brand-offwhite rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  <span className="text-sm font-manrope text-text-1">{selectedCustomer.name}</span>
                </div>
                {selectedCustomer.wallet_balance_kobo > 0 && (
                  <span className="text-xs font-manrope text-success">
                    Wallet: {formatNaira(selectedCustomer.wallet_balance_kobo)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {cart.length === 0 ? (
            <div className="text-center py-8 text-text-4 font-manrope">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Cart is empty</p>
              <p className="text-xs mt-1">Scan products to add</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <motion.div
                  key={item.productId}
                  layout
                  className="bg-brand-offwhite rounded-lg p-3"
                >
                  <div className="flex gap-3">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-white" />
                    ) : (
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-text-4">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-syne font-700 text-sm text-text-1 truncate">{item.name}</h4>
                      <p className="font-mono text-xs text-text-4">{item.sku}</p>
                      <p className="font-syne font-700 text-brand-blue text-sm">{formatNaira(item.priceKobo)}</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-text-4 hover:text-brand-red p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-lg border border-brand-border hover:border-brand-blue"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-sm w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="w-7 h-7 flex items-center justify-center bg-white rounded-lg border border-brand-border hover:border-brand-blue"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="font-syne font-700 text-text-1">{formatNaira(item.priceKobo * item.quantity)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-brand-border bg-brand-offwhite">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm font-manrope">
              <span className="text-text-3">Subtotal</span>
              <span className="text-text-1">{formatNaira(subtotalKobo)}</span>
            </div>
            <div className="flex justify-between text-sm font-manrope">
              <span className="text-text-3">VAT (7.5%)</span>
              <span className="text-text-1">{formatNaira(vatKobo)}</span>
            </div>
            <div className="flex justify-between font-syne font-800 text-lg pt-2 border-t border-brand-border">
              <span className="text-text-1">Total</span>
              <span className="text-brand-blue">{formatNaira(totalKobo)}</span>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-manrope text-text-3 mb-2">Payment Method</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'paystack', label: 'Paystack', icon: Wallet },
                { id: 'wallet', label: 'Wallet', icon: Wallet },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id as PaymentMethod)}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-lg border text-sm font-manrope transition-colors',
                    paymentMethod === id
                      ? 'border-brand-blue bg-brand-blue/10 text-brand-blue'
                      : 'border-brand-border text-text-3 hover:border-brand-blue'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div className="mb-4">
              <label className="text-xs font-manrope text-text-3">Amount Paid (₦)</label>
              <input
                type="number"
                {...register('amountPaid')}
                placeholder="Enter amount"
                className="w-full mt-1 px-3 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue"
              />
              {changeKobo > 0 && (
                <p className="text-sm font-syne font-700 text-success mt-2">
                  Change: {formatNaira(changeKobo)}
                </p>
              )}
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-manrope text-blue-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Present card to terminal
              </p>
            </div>
          )}

          {paymentMethod === 'paystack' && (
            <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm font-manrope text-purple-700 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Payment link will be generated
              </p>
            </div>
          )}

          {paymentMethod === 'wallet' && selectedCustomer && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-manrope text-green-700">
                Balance: {formatNaira(selectedCustomer.wallet_balance_kobo)}
              </p>
            </div>
          )}

          <textarea
            {...register('notes')}
            placeholder="Add notes (optional)"
            rows={2}
            className="w-full mb-3 px-3 py-2 border border-brand-border rounded-lg text-sm focus:outline-none focus:border-brand-blue resize-none"
          />

          <button
            onClick={completeSale}
            disabled={cart.length === 0 || isCompletingSale || (paymentMethod === 'cash' && amountPaidKobo < totalKobo)}
            className="w-full bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-syne font-700 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            {isCompletingSale ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Receipt className="w-5 h-5" />
                Complete Sale (F1)
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showReceipt && lastOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-auto"
            >
              <div className="p-6" id="receipt">
                <div className="text-center mb-6">
                  <h2 className="font-syne font-800 text-xl text-text-1">ROSHANAL GLOBAL</h2>
                  <p className="font-manrope text-text-4 text-sm">14 Aba Road, Port Harcourt</p>
                  <p className="font-manrope text-text-4 text-sm">+234 800 ROSHANAL</p>
                </div>

                <div className="border-t border-b border-brand-border py-4 mb-4">
                  <div className="flex justify-between text-sm font-manrope mb-1">
                    <span className="text-text-3">Order #</span>
                    <span className="font-mono text-text-1">{lastOrder.orderNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm font-manrope">
                    <span className="text-text-3">Date</span>
                    <span className="text-text-1">{new Date().toLocaleString('en-NG')}</span>
                  </div>
                  {selectedCustomer && (
                    <div className="flex justify-between text-sm font-manrope mt-1">
                      <span className="text-text-3">Customer</span>
                      <span className="text-text-1">{selectedCustomer.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {cart.length === 0 && (
                    <>
                      {recentTransactions[0] && (
                        <div className="text-sm font-manrope text-text-4 text-center py-2">
                          Sale completed successfully!
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="border-t border-brand-border pt-4 space-y-1">
                  <div className="flex justify-between text-sm font-manrope">
                    <span className="text-text-3">Subtotal</span>
                    <span className="text-text-1">{formatNaira(subtotalKobo)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-manrope">
                    <span className="text-text-3">VAT (7.5%)</span>
                    <span className="text-text-1">{formatNaira(vatKobo)}</span>
                  </div>
                  <div className="flex justify-between font-syne font-800 text-lg pt-2">
                    <span className="text-text-1">Total</span>
                    <span className="text-brand-blue">{formatNaira(totalKobo)}</span>
                  </div>
                  {lastOrder.changeKobo > 0 && (
                    <div className="flex justify-between text-sm font-manrope text-success">
                      <span>Change</span>
                      <span className="font-syne font-700">{formatNaira(lastOrder.changeKobo)}</span>
                    </div>
                  )}
                </div>

                <div className="text-center mt-6 pt-4 border-t border-brand-border">
                  <p className="font-manrope text-text-4 text-sm">Thank you for your business!</p>
                  <p className="font-mono text-xs text-text-4 mt-1">{lastOrder.orderNumber}</p>
                </div>
              </div>

              <div className="p-4 border-t border-brand-border flex gap-3">
                <button
                  onClick={printReceipt}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-brand-border rounded-lg font-manrope text-sm hover:bg-brand-offwhite"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 bg-brand-blue text-white font-syne font-700 py-2 rounded-lg hover:bg-brand-blue/90"
                >
                  New Sale
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
