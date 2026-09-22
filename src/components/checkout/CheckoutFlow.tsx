'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Truck, Warehouse, CreditCard, CheckCircle, ChevronRight,
  Loader2, Lock, ShoppingCart, ArrowLeft,
} from 'lucide-react'
import { cn, formatNaira, generateOrderNumber } from '@/lib/utils'

const CHECKOUT_STEPS = [
  { id: 0, label: 'Delivery', icon: MapPin },
  { id: 1, label: 'Map', icon: MapPin },
  { id: 2, label: 'Shipping', icon: Truck },
  { id: 3, label: 'Warehouse', icon: Warehouse },
  { id: 4, label: 'Payment', icon: CreditCard },
  { id: 5, label: 'Review', icon: CheckCircle },
  { id: 6, label: 'Confirm', icon: CheckCircle },
]

/**
 * CUSTOMER-FRIENDLY payment method names.
 * NEVER show gateway names (Paystack, Flutterwave, etc.) to customers.
 */
const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Verve — secure online payment', icon: '💳', enabled: true },
  { id: 'bank_transfer', label: 'Bank Transfer', desc: 'Transfer directly from your bank account', icon: '🏦', enabled: true },
  { id: 'ussd', label: 'USSD Payment', desc: 'Dial a USSD code on any phone — no internet needed', icon: '📱', enabled: true },
  { id: 'mobile_money', label: 'Mobile Money', desc: 'Pay with mobile money wallet', icon: '📲', enabled: true },
  { id: 'crypto', label: 'Cryptocurrency', desc: 'Bitcoin, USDT, ETH and more', icon: '₿', enabled: false },
  { id: 'wallet', label: 'Roshanal Wallet', desc: 'Pay from your platform wallet balance', icon: '👛', enabled: true },
  { id: 'cod', label: 'Pay on Delivery', desc: 'Cash/POS on delivery at your address', icon: '🚚', enabled: true },
  { id: 'voice', label: 'Voice Payment', desc: 'Complete payment by voice — optional, customer-initiated only', icon: '🎙️', enabled: false, optional: true },
]

const SHIPPING_METHODS = [
  { id: 'standard', name: 'Standard Delivery', desc: '3–5 business days', priceKobo: 150000, eta: 'Apr 11–15' },
  { id: 'express', name: 'Express Delivery', desc: '1–2 business days', priceKobo: 350000, eta: 'Apr 9–10' },
  { id: 'same_day', name: 'Same-day Delivery', desc: 'PHC only — order before 2PM', priceKobo: 500000, eta: 'Today' },
  { id: 'pickup', name: 'Store Pickup (Free)', desc: 'Collect from any Roshanal branch', priceKobo: 0, eta: 'Ready in 2hrs' },
]

interface CheckoutData {
  name: string; email: string; phone: string
  address: string; state: string; city: string; lga: string; lat: number | null; lng: number | null
  shippingMethodId: string; branchId: string
  paymentMethodId: string
}

interface CheckoutFlowProps {
  initialStep?: number
}

export default function CheckoutFlow({ initialStep = 0 }: CheckoutFlowProps) {
  const router = useRouter()
  const [step, setStep] = useState(initialStep)
  const [data, setData] = useState<CheckoutData>({
    name: '', email: '', phone: '', address: '', state: 'Rivers State',
    city: 'Port Harcourt', lga: '', lat: null, lng: null,
    shippingMethodId: 'standard', branchId: '',
    paymentMethodId: 'card',
  })
  const [orderNumber, setOrderNumber] = useState('')
  const [placing, setPlacing] = useState(false)
  const [cartTotal] = useState(5250000) // In production: read from cart state

  const selectedShipping = SHIPPING_METHODS.find((m) => m.id === data.shippingMethodId)
  const shippingKobo = selectedShipping?.priceKobo ?? 0
  const totalKobo = cartTotal + shippingKobo

  const handlePlaceOrder = async () => {
    setPlacing(true)
    try {
      const orderNum = generateOrderNumber()
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: orderNum,
          shippingAddress: { name: data.name, email: data.email, phone: data.phone, address: data.address, city: data.city, state: data.state, lga: data.lga },
          paymentMethod: data.paymentMethodId,
          shippingMethod: data.shippingMethodId,
          branchId: data.branchId || null,
          totalKobo,
          shippingKobo,
        }),
      })
      const result = (await res.json()) as { orderNumber?: string; paymentUrl?: string }
      const num = result.orderNumber ?? orderNum
      setOrderNumber(num)

      if (result.paymentUrl) {
        window.location.href = result.paymentUrl
        return
      }

      setStep(6) // Go to confirmation
      localStorage.removeItem('rg_cart')
      window.dispatchEvent(new CustomEvent('rg:cart-updated'))
    } catch {
      alert('Order placement failed. Please try again or call +234 800 ROSHANAL.')
    } finally {
      setPlacing(false)
    }
  }

  const updateField = (field: keyof CheckoutData, value: string | number | null) => {
    setData((d) => ({ ...d, [field]: value }))
  }

  const inputCls = 'w-full border border-brand-border rounded-xl px-4 py-3 text-sm text-text-1 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-colors bg-white'
  const labelCls = 'block font-manrope font-600 text-text-2 text-sm mb-1.5'

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Top bar */}
      <div className="bg-white border-b border-brand-border py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center">
              <span className="font-syne font-800 text-white text-sm">RS</span>
            </div>
            <span className="font-syne font-700 text-brand-navy">Secure Checkout</span>
          </Link>
          <Lock className="w-4 h-4 text-success" />
        </div>
      </div>

      {/* Progress bar */}
      {step < 6 && (
        <div className="bg-white border-b border-brand-border px-4 py-3">
          <div className="container mx-auto">
            <div className="flex items-center gap-1 overflow-x-auto">
              {CHECKOUT_STEPS.slice(0, 6).map((s, i) => (
                <React.Fragment key={s.id}>
                  <div className={cn('flex items-center gap-1.5 shrink-0',
                    step === s.id ? 'text-brand-blue' : step > s.id ? 'text-success' : 'text-text-4')}>
                    <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs font-700 font-syne',
                      step === s.id ? 'bg-brand-blue text-white' : step > s.id ? 'bg-success text-white' : 'bg-brand-offwhite text-text-4')}>
                      {step > s.id ? '✓' : s.id + 1}
                    </div>
                    <span className="text-xs font-manrope hidden sm:inline">{s.label}</span>
                  </div>
                  {i < 5 && <ChevronRight className="w-3 h-3 text-text-4 shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* Step 0: Delivery details */}
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-brand-border p-6">
                  <h2 className="font-syne font-800 text-xl text-text-1 mb-5">Delivery Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Full Name</label>
                      <input value={data.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Your full name" className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>Email Address</label>
                      <input type="email" value={data.email} onChange={(e) => updateField('email', e.target.value)} placeholder="you@example.com" className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>Phone Number</label>
                      <input type="tel" value={data.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="+234 xxx xxxx xxx" className={inputCls} required />
                    </div>
                    <div className="sm:col-span-2">
                      <label className={labelCls}>Delivery Address</label>
                      <input value={data.address} onChange={(e) => updateField('address', e.target.value)} placeholder="Street address, house number, landmark" className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>State</label>
                      <select value={data.state} onChange={(e) => updateField('state', e.target.value)} className={inputCls}>
                        {['Rivers State', 'Lagos', 'Abuja (FCT)', 'Bayelsa', 'Delta', 'Akwa Ibom', 'Cross River', 'Edo', 'Imo', 'Anambra'].map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>City / Area</label>
                      <input value={data.city} onChange={(e) => updateField('city', e.target.value)} placeholder="City or area" className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>LGA</label>
                      <input value={data.lga} onChange={(e) => updateField('lga', e.target.value)} placeholder="Local Government Area" className={inputCls} />
                    </div>
                  </div>
                  <button onClick={() => setStep(1)} disabled={!data.name || !data.email || !data.phone || !data.address}
                    className="mt-6 w-full bg-brand-blue hover:bg-blue-700 disabled:opacity-50 text-white font-syne font-700 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    Continue to Map Confirmation <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {/* Step 1: Map confirmation */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-brand-border p-6">
                  <h2 className="font-syne font-800 text-xl text-text-1 mb-2">Confirm Your Location</h2>
                  <p className="text-text-3 font-manrope text-sm mb-5">{data.address}, {data.city}, {data.state}</p>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl h-64 flex items-center justify-center mb-5">
                    <div className="text-center">
                      <MapPin className="w-10 h-10 text-brand-blue mx-auto mb-2" />
                      <p className="font-manrope text-text-3 text-sm">Mapbox map loads here with your pin.</p>
                      <p className="font-manrope text-text-4 text-xs mt-1">Mapbox token configured in API Vault.</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(0)} className="flex items-center gap-1.5 px-5 py-2.5 border border-brand-border rounded-xl text-sm font-manrope text-text-3 hover:bg-brand-offwhite">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={() => setStep(2)} className="flex-1 bg-brand-blue hover:bg-blue-700 text-white font-syne font-700 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      Confirm Address <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Shipping */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-brand-border p-6">
                  <h2 className="font-syne font-800 text-xl text-text-1 mb-5">Select Shipping Method</h2>
                  <div className="space-y-3">
                    {SHIPPING_METHODS.map((method) => (
                      <label key={method.id} className={cn('flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors',
                        data.shippingMethodId === method.id ? 'border-brand-blue bg-blue-50' : 'border-brand-border hover:border-brand-blue/50')}>
                        <input type="radio" name="shipping" checked={data.shippingMethodId === method.id}
                          onChange={() => updateField('shippingMethodId', method.id)} className="mt-0.5 accent-brand-blue" />
                        <div className="flex-1">
                          <div className="font-syne font-700 text-text-1 text-sm">{method.name}</div>
                          <div className="font-manrope text-text-3 text-xs mt-0.5">{method.desc} · ETA: {method.eta}</div>
                        </div>
                        <div className="font-syne font-700 text-brand-red text-sm shrink-0">
                          {method.priceKobo === 0 ? 'FREE' : formatNaira(method.priceKobo)}
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setStep(1)} className="flex items-center gap-1.5 px-5 py-2.5 border border-brand-border rounded-xl text-sm font-manrope text-text-3 hover:bg-brand-offwhite">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={() => setStep(3)} className="flex-1 bg-brand-blue hover:bg-blue-700 text-white font-syne font-700 py-2.5 rounded-xl flex items-center justify-center gap-2">
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Warehouse selection */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-brand-border p-6">
                  <h2 className="font-syne font-800 text-xl text-text-1 mb-2">Fulfillment Branch</h2>
                  <p className="text-text-3 font-manrope text-sm mb-5">Your items will be dispatched from the nearest branch with stock.</p>
                  <div className="space-y-3">
                    {[
                      { id: 'phc_main', name: 'Port Harcourt — Main Store', address: '14 Aba Road, PHC', stock: 'All items in stock', distance: '3.2km' },
                      { id: 'phc_gra', name: 'Port Harcourt — GRA Branch', address: 'GRA Phase 2, PHC', stock: 'All items in stock', distance: '7.1km' },
                    ].map((branch) => (
                      <label key={branch.id} className={cn('flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors',
                        data.branchId === branch.id ? 'border-brand-blue bg-blue-50' : 'border-brand-border hover:border-brand-blue/50')}>
                        <input type="radio" name="branch" checked={data.branchId === branch.id}
                          onChange={() => updateField('branchId', branch.id)} className="mt-0.5 accent-brand-blue" />
                        <div className="flex-1">
                          <div className="font-syne font-700 text-text-1 text-sm">{branch.name}</div>
                          <div className="font-manrope text-text-3 text-xs mt-0.5">{branch.address}</div>
                          <div className="font-manrope text-success text-xs mt-1 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> {branch.stock}
                          </div>
                        </div>
                        <span className="text-text-4 text-xs font-manrope shrink-0">{branch.distance}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setStep(2)} className="flex items-center gap-1.5 px-5 py-2.5 border border-brand-border rounded-xl text-sm font-manrope text-text-3 hover:bg-brand-offwhite">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={() => { if (!data.branchId) updateField('branchId', 'phc_main'); setStep(4) }}
                      className="flex-1 bg-brand-blue hover:bg-blue-700 text-white font-syne font-700 py-2.5 rounded-xl flex items-center justify-center gap-2">
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Payment — FRIENDLY NAMES ONLY */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-brand-border p-6">
                  <h2 className="font-syne font-800 text-xl text-text-1 mb-2">Payment Method</h2>
                  <p className="text-text-3 font-manrope text-sm mb-5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-success" /> All payments secured with 256-bit SSL encryption
                  </p>
                  <div className="space-y-2">
                    {PAYMENT_METHODS.filter((m) => m.enabled).map((method) => (
                      <label key={method.id} className={cn('flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors',
                        data.paymentMethodId === method.id ? 'border-brand-blue bg-blue-50' : 'border-brand-border hover:border-brand-blue/50',
                        method.optional && 'border-dashed opacity-80'
                      )}>
                        <input type="radio" name="payment" checked={data.paymentMethodId === method.id}
                          onChange={() => updateField('paymentMethodId', method.id)} className="accent-brand-blue" />
                        <span className="text-xl">{method.icon}</span>
                        <div className="flex-1">
                          <div className="font-syne font-700 text-text-1 text-sm">{method.label}
                            {method.optional && <span className="ml-2 text-[10px] font-manrope text-text-4">(optional)</span>}
                          </div>
                          <div className="font-manrope text-text-4 text-xs">{method.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={() => setStep(3)} className="flex items-center gap-1.5 px-5 py-2.5 border border-brand-border rounded-xl text-sm font-manrope text-text-3 hover:bg-brand-offwhite">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={() => setStep(5)} className="flex-1 bg-brand-blue hover:bg-blue-700 text-white font-syne font-700 py-2.5 rounded-xl flex items-center justify-center gap-2">
                      Review Order <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Review */}
              {step === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-brand-border p-6">
                  <h2 className="font-syne font-800 text-xl text-text-1 mb-5">Review Your Order</h2>
                  <div className="space-y-4 mb-5">
                    {[
                      { title: 'Delivery To', value: `${data.name} · ${data.address}, ${data.city}, ${data.state}`, step: 0 },
                      { title: 'Shipping', value: SHIPPING_METHODS.find((m) => m.id === data.shippingMethodId)?.name ?? data.shippingMethodId, step: 2 },
                      { title: 'Payment Method', value: PAYMENT_METHODS.find((m) => m.id === data.paymentMethodId)?.label ?? data.paymentMethodId, step: 4 },
                    ].map((item) => (
                      <div key={item.title} className="flex items-start justify-between py-3 border-b border-brand-border">
                        <div>
                          <div className="text-xs font-manrope text-text-4 uppercase tracking-wider mb-0.5">{item.title}</div>
                          <div className="text-sm font-manrope text-text-1">{item.value}</div>
                        </div>
                        <button onClick={() => setStep(item.step)} className="text-xs text-brand-blue hover:underline">Edit</button>
                      </div>
                    ))}
                  </div>
                  <div className="bg-brand-offwhite rounded-xl p-4 mb-5">
                    <div className="flex justify-between text-sm font-manrope mb-2">
                      <span className="text-text-3">Subtotal</span><span>{formatNaira(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-manrope mb-2">
                      <span className="text-text-3">Shipping</span><span>{shippingKobo === 0 ? 'FREE' : formatNaira(shippingKobo)}</span>
                    </div>
                    <div className="flex justify-between font-syne font-800 text-lg border-t border-brand-border pt-2 mt-2">
                      <span className="text-text-1">Total</span><span className="text-brand-red">{formatNaira(totalKobo)}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep(4)} className="flex items-center gap-1.5 px-5 py-2.5 border border-brand-border rounded-xl text-sm font-manrope text-text-3 hover:bg-brand-offwhite">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={() => void handlePlaceOrder()} disabled={placing}
                      className="flex-1 bg-brand-red hover:bg-red-700 disabled:opacity-60 text-white font-syne font-700 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      {placing ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</> : `Place Order · ${formatNaira(totalKobo)}`}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Confirmation */}
              {step === 6 && (
                <motion.div key="step6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-brand-border p-8 text-center">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-10 h-10 text-success" />
                  </div>
                  <h2 className="font-syne font-800 text-2xl text-text-1 mb-2">Order Confirmed!</h2>
                  <p className="text-text-3 font-manrope mb-4">Thank you, {data.name.split(' ')[0]}! Your order has been received.</p>
                  <div className="bg-brand-offwhite rounded-xl px-6 py-4 mb-6">
                    <div className="text-xs font-manrope text-text-4 uppercase tracking-wider mb-1">Order Reference</div>
                    <div className="font-mono font-700 text-brand-blue text-lg">{orderNumber}</div>
                  </div>
                  <p className="text-text-3 font-manrope text-sm mb-6">
                    A confirmation email has been sent to <strong>{data.email}</strong>
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/account/orders" className="px-5 py-2.5 bg-brand-blue text-white font-syne font-700 text-sm rounded-xl hover:bg-blue-700 transition-colors">
                      Track Order
                    </Link>
                    <Link href="/shop" className="px-5 py-2.5 border border-brand-border text-text-3 font-manrope text-sm rounded-xl hover:bg-brand-offwhite transition-colors">
                      Continue Shopping
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          {step < 6 && (
            <div className="bg-white rounded-2xl border border-brand-border p-5 h-fit sticky top-24">
              <h3 className="font-syne font-700 text-text-1 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Order Summary
              </h3>
              <div className="space-y-3 mb-4 text-sm font-manrope">
                <div className="flex justify-between">
                  <span className="text-text-3">Subtotal</span>
                  <span className="text-text-1 font-600">{formatNaira(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Shipping</span>
                  <span className={shippingKobo === 0 ? 'text-success font-600' : 'text-text-1 font-600'}>
                    {shippingKobo === 0 ? 'FREE' : formatNaira(shippingKobo)}
                  </span>
                </div>
              </div>
              <div className="border-t border-brand-border pt-3 flex justify-between">
                <span className="font-syne font-700 text-text-1">Total</span>
                <span className="font-syne font-800 text-brand-red text-lg">{formatNaira(totalKobo)}</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs font-manrope text-text-4">
                <Lock className="w-3.5 h-3.5 text-success shrink-0" />
                Secured by 256-bit SSL encryption
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
