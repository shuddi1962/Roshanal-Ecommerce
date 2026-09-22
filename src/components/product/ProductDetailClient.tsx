'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShoppingCart, Heart, BarChart2, Share2, ChevronLeft, ChevronRight,
  ZoomIn, MapPin, Truck, Shield, Star, MessageSquare, Package, CheckCircle,
  Phone, Copy,
} from 'lucide-react'

const Facebook = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
const Twitter = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
import { cn, isOnSale, getSalePercentage, formatNaira } from '@/lib/utils'

interface ProductDetailProps {
  product: {
    id: string; name: string; slug: string; short_description?: string | null
    description_html: string; sku: string; type: string
    regular_price_kobo: number; sale_price_kobo: number | null
    images: Array<{ url?: string; small?: string; medium?: string; large?: string }>
    video_url?: string | null; specifications?: Record<string, string> | null
    tags: string[]; badges: string[]
    sale_badge_label?: string | null; sale_badge_color?: string | null
    sale_badge_placements: string[]
    countdown_enabled: boolean; countdown_end?: string | null
    countdown_label?: string | null; countdown_style?: string | null
    countdown_placements: string[]
    brands?: { name: string; slug: string; logo_url: string | null; is_authorized_dealer: boolean } | null
    categories?: { name: string; slug: string } | null
  }
}

const TABS = ['Description', 'Specifications', 'Reviews', 'Q&A', 'Shipping', 'Warranty'] as const
type Tab = (typeof TABS)[number]

function CountdownTimer({ endDate }: { endDate: Date }) {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 })
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, endDate.getTime() - Date.now())
      setLeft({ d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) })
    }
    calc(); const t = setInterval(calc, 1000); return () => clearInterval(t)
  }, [endDate])
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm">
      <span className="font-manrope text-brand-red font-600">⚡ Ends in:</span>
      {left.d > 0 && <><span className="font-mono font-700 text-brand-red">{pad(left.d)}d</span><span className="text-red-300">:</span></>}
      <span className="font-mono font-700 text-brand-red">{pad(left.h)}</span><span className="text-red-300">:</span>
      <span className="font-mono font-700 text-brand-red">{pad(left.m)}</span><span className="text-red-300">:</span>
      <span className="font-mono font-700 text-brand-red">{pad(left.s)}</span>
    </div>
  )
}

export default function ProductDetailClient({ product }: ProductDetailProps) {
  const [activeImage, setActiveImage] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('Description')
  const [quantity, setQty] = useState(1)
  const [addedToCart, setAddedToCart] = useState(false)
  const [inWishlist, setInWishlist] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const images = product.images ?? []
  const onSale = isOnSale(product.regular_price_kobo, product.sale_price_kobo)
  const salePercent = onSale ? getSalePercentage(product.regular_price_kobo, product.sale_price_kobo!) : 0
  const displayPrice = onSale ? product.sale_price_kobo! : product.regular_price_kobo

  useEffect(() => {
    const wish = JSON.parse(localStorage.getItem('rg_wishlist') ?? '[]') as string[]
    setInWishlist(wish.includes(product.id))
  }, [product.id])

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem('rg_cart') ?? '[]') as { id: string; qty: number }[]
    const ex = cart.find((i) => i.id === product.id)
    if (ex) ex.qty += quantity; else cart.push({ id: product.id, qty: quantity })
    localStorage.setItem('rg_cart', JSON.stringify(cart))
    window.dispatchEvent(new CustomEvent('rg:cart-updated'))
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2500)
  }

  const toggleWishlist = () => {
    const wish = JSON.parse(localStorage.getItem('rg_wishlist') ?? '[]') as string[]
    const updated = inWishlist ? wish.filter((w) => w !== product.id) : [...wish, product.id]
    localStorage.setItem('rg_wishlist', JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('rg:wishlist-updated'))
    setInWishlist(!inWishlist)
  }

  const copyLink = () => {
    void navigator.clipboard.writeText(window.location.href)
    setShareOpen(false)
  }

  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-brand-border py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-xs font-manrope text-text-4">
            <Link href="/" className="hover:text-brand-blue">Home</Link><span>/</span>
            {product.categories && <><Link href={`/categories/${product.categories.slug}`} className="hover:text-brand-blue">{product.categories.name}</Link><span>/</span></>}
            <span className="text-text-2 truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Image gallery */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative bg-white rounded-2xl border border-brand-border overflow-hidden aspect-square">
              {images.length > 0 ? (
                <img src={images[activeImage]?.large ?? images[activeImage]?.url ?? ''}
                  alt={product.name} className="w-full h-full object-contain p-6" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-4 text-6xl">📦</div>
              )}

              {/* Sale badge on PDP */}
              {onSale && product.sale_badge_placements.includes('PDP') && (
                <span className="sale-badge absolute top-3 left-3 text-white" style={{ backgroundColor: product.sale_badge_color ?? '#C8191C' }}>
                  {product.sale_badge_label ?? 'SALE'} {salePercent > 0 && `-${salePercent}%`}
                </span>
              )}

              {/* Navigation */}
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={cn('w-16 h-16 rounded-lg border-2 overflow-hidden shrink-0 transition-colors',
                      activeImage === i ? 'border-brand-blue' : 'border-brand-border hover:border-brand-blue/50')}>
                    <img src={img.small ?? img.url ?? ''} alt="" className="w-full h-full object-contain p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-4">
            {/* Brand */}
            {product.brands && (
              <Link href={`/brands?brand=${product.brands.slug}`}
                className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors">
                <span className="font-syne font-700 text-brand-blue text-xs uppercase tracking-wider">{product.brands.name}</span>
                {product.brands.is_authorized_dealer && (
                  <span className="text-[9px] font-manrope bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Authorized Dealer</span>
                )}
              </Link>
            )}

            <h1 className="font-syne font-800 text-2xl md:text-3xl text-text-1 leading-tight">{product.name}</h1>

            <div className="flex items-center gap-3 text-xs font-manrope text-text-4">
              <span className="font-mono">SKU: {product.sku}</span>
              <span>·</span>
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                <span className="text-text-4 ml-1">(12 reviews)</span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="font-syne font-800 text-3xl text-brand-red price">{formatNaira(displayPrice)}</span>
              {onSale && (
                <span className="font-manrope text-text-4 text-lg line-through">{formatNaira(product.regular_price_kobo)}</span>
              )}
              {onSale && (
                <span className="sale-badge text-white" style={{ backgroundColor: product.sale_badge_color ?? '#C8191C' }}>
                  SAVE {salePercent}%
                </span>
              )}
            </div>

            {/* Countdown timer on PDP */}
            {product.countdown_enabled && product.countdown_end && product.countdown_placements.includes('PDP') && (
              <CountdownTimer endDate={new Date(product.countdown_end)} />
            )}

            {/* Short description */}
            {product.short_description && (
              <p className="font-manrope text-text-3 text-sm leading-relaxed">{product.short_description}</p>
            )}

            {/* Stock / branch */}
            <div className="flex items-center gap-2 text-sm font-manrope">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-success font-600">In Stock</span>
              <span className="text-text-4">·</span>
              <MapPin className="w-4 h-4 text-text-4" />
              <span className="text-text-3">PHC: 12 | Lagos: 3 | Bayelsa: 0</span>
            </div>

            {/* Qty + Cart */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-brand-border rounded-xl overflow-hidden bg-white">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3.5 py-3 hover:bg-brand-offwhite transition-colors font-syne font-700 text-text-2">−</button>
                <span className="w-12 text-center font-syne font-700 text-text-1 text-sm">{quantity}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-3.5 py-3 hover:bg-brand-offwhite transition-colors font-syne font-700 text-text-2">+</button>
              </div>
              <button onClick={addToCart}
                className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-syne font-700 text-sm transition-all',
                  addedToCart ? 'bg-success text-white' : 'bg-brand-blue hover:bg-blue-700 text-white')}>
                {addedToCart ? <><CheckCircle className="w-4 h-4" /> Added to Cart!</> : <><ShoppingCart className="w-4 h-4" /> Add to Cart</>}
              </button>
            </div>

            <div className="flex gap-3">
              <button onClick={toggleWishlist}
                className={cn('flex items-center gap-2 flex-1 justify-center py-2.5 border-2 rounded-xl text-sm font-syne font-700 transition-colors',
                  inWishlist ? 'border-brand-red bg-red-50 text-brand-red' : 'border-brand-border text-text-3 hover:border-brand-red hover:text-brand-red')}>
                <Heart className={cn('w-4 h-4', inWishlist && 'fill-current')} />
                {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
              </button>
              <div className="relative">
                <button onClick={() => setShareOpen(!shareOpen)}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-brand-border rounded-xl text-sm font-syne font-700 text-text-3 hover:border-brand-blue hover:text-brand-blue transition-colors">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <AnimatePresence>
                  {shareOpen && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                      className="absolute right-0 top-full mt-1 bg-white border border-brand-border rounded-xl shadow-float p-3 z-10 min-w-[160px] space-y-1">
                      {[
                        { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${product.name} - ${window?.location?.href ?? ''}`)}`, icon: <Phone className="w-3.5 h-3.5" /> },
                        { label: 'Facebook', href: `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window?.location?.href ?? '')}`, icon: <Facebook /> },
                        { label: 'Twitter/X', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(product.name)}&url=${encodeURIComponent(window?.location?.href ?? '')}`, icon: <Twitter /> },
                      ].map((s) => (
                        <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 text-sm font-manrope text-text-2 hover:bg-brand-offwhite rounded-lg transition-colors">
                          {s.icon}{s.label}
                        </a>
                      ))}
                      <button onClick={copyLink} className="flex items-center gap-2 w-full px-3 py-2 text-sm font-manrope text-text-2 hover:bg-brand-offwhite rounded-lg transition-colors">
                        <Copy className="w-3.5 h-3.5" /> Copy Link
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[
                { icon: <Shield className="w-4 h-4 text-success" />, text: 'Genuine Product' },
                { icon: <Truck className="w-4 h-4 text-brand-blue" />, text: 'Fast Delivery' },
                { icon: <Package className="w-4 h-4 text-amber-500" />, text: 'Easy Returns' },
              ].map((t) => (
                <div key={t.text} className="flex flex-col items-center gap-1 bg-brand-offwhite rounded-lg p-2.5 text-center">
                  {t.icon}
                  <span className="text-[11px] font-manrope text-text-3">{t.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product tabs */}
        <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
          <div className="flex overflow-x-auto border-b border-brand-border">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={cn('shrink-0 px-5 py-3.5 text-sm font-manrope font-600 transition-colors border-b-2 -mb-0.5',
                  activeTab === tab ? 'border-brand-blue text-brand-blue' : 'border-transparent text-text-3 hover:text-text-1')}>
                {tab}
              </button>
            ))}
          </div>
          <div className="p-6">
            {activeTab === 'Description' && (
              <div dangerouslySetInnerHTML={{ __html: product.description_html }}
                className="prose prose-sm max-w-none font-manrope text-text-2 prose-headings:font-syne prose-headings:font-700 prose-strong:font-600 prose-a:text-brand-blue" />
            )}
            {activeTab === 'Specifications' && (
              <div>
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="w-full text-sm font-manrope">
                    <tbody className="divide-y divide-brand-border">
                      {Object.entries(product.specifications as Record<string, string>).map(([key, value]) => (
                        <tr key={key}>
                          <td className="py-3 pr-6 font-600 text-text-2 w-1/3">{key}</td>
                          <td className="py-3 text-text-3">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-text-3 font-manrope">No specifications listed for this product.</p>
                )}
              </div>
            )}
            {activeTab === 'Reviews' && (
              <div className="text-center py-8">
                <Star className="w-8 h-8 text-amber-300 fill-current mx-auto mb-3" />
                <p className="font-manrope text-text-3 text-sm">Reviews are loaded from the database. Be the first to review!</p>
                <button className="mt-3 px-5 py-2 bg-brand-blue text-white font-syne font-700 text-sm rounded-lg">Write a Review</button>
              </div>
            )}
            {activeTab === 'Q&A' && (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-brand-blue mx-auto mb-3" />
                <p className="font-manrope text-text-3 text-sm">Have a question? Ask our team or browse answered questions.</p>
                <button className="mt-3 px-5 py-2 bg-brand-blue text-white font-syne font-700 text-sm rounded-lg">Ask a Question</button>
              </div>
            )}
            {activeTab === 'Shipping' && (
              <div className="space-y-3 text-sm font-manrope text-text-2">
                <p><strong>Same-day delivery:</strong> Port Harcourt orders placed before 2PM WAT</p>
                <p><strong>Next-day delivery:</strong> Lagos, Abuja, and major cities nationwide</p>
                <p><strong>Express international:</strong> Available to West Africa — contact us for rates</p>
                <p><strong>Free shipping:</strong> On orders over ₦50,000 within Port Harcourt</p>
              </div>
            )}
            {activeTab === 'Warranty' && (
              <div className="space-y-3 text-sm font-manrope text-text-2">
                <p><strong>Manufacturer Warranty:</strong> Covered by manufacturer&apos;s standard warranty</p>
                <p><strong>Roshanal Guarantee:</strong> 30-day return policy for defective items</p>
                <p><strong>Extended Warranty:</strong> Available at checkout for most products</p>
                <p><strong>Claims:</strong> Contact <a href="mailto:warranty@roshanalglobal.com" className="text-brand-blue hover:underline">warranty@roshanalglobal.com</a></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
