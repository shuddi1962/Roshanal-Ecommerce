import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight, Filter } from 'lucide-react'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Boat Engines — Yamaha, Honda, Mercury, Suzuki & More',
  description: 'Shop genuine outboard, inboard, and stern drive boat engines in Nigeria. Yamaha, Honda, Mercury, Suzuki, Tohatsu and more. Expert installation available.',
  path: '/shop/boat-engines',
  keywords: ['boat engines Nigeria', 'Yamaha outboard Nigeria', 'Honda outboard engine', 'Mercury marine Nigeria', 'outboard engine Port Harcourt'],
})

const ENGINE_BRANDS = [
  { name: 'Yamaha', slug: 'yamaha', color: 'from-blue-900 to-brand-navy', icon: '⚓', models: ['F2.5', 'F5', 'F15', 'F25', 'F40', 'F60', 'F75', 'F100', 'F150', 'F200', 'F250', 'F300'] },
  { name: 'Honda', slug: 'honda', color: 'from-red-800 to-red-900', icon: '🔴', models: ['BF2.3', 'BF5', 'BF10', 'BF20', 'BF40', 'BF60', 'BF90', 'BF135', 'BF150', 'BF200'] },
  { name: 'Mercury', slug: 'mercury', color: 'from-gray-800 to-gray-900', icon: '⚡', models: ['2.5MH', '3.5MH', '6MH', '9.9MH', '15MH', '25EH', '40EH', '60EH', '90L', '115L'] },
  { name: 'Suzuki', slug: 'suzuki', color: 'from-indigo-900 to-purple-900', icon: '🔷', models: ['DF2.5', 'DF4', 'DF8', 'DF15', 'DF25', 'DF40', 'DF60', 'DF90', 'DF140', 'DF175'] },
  { name: 'Tohatsu', slug: 'tohatsu', color: 'from-teal-900 to-cyan-900', icon: '🌊', models: ['2.5HP', '5HP', '9.8HP', '15HP', '25HP', '40HP', '50HP', '90HP', '115HP'] },
  { name: 'Volvo Penta', slug: 'volvo', color: 'from-slate-800 to-slate-900', icon: '⚙️', models: ['D1-20', 'D1-30', 'D2-40', 'D2-55', 'D3-110', 'D4-180', 'D6-310', 'IPS'] },
]

const FILTER_SPECS = [
  { label: 'Engine Type', options: ['Outboard', 'Inboard', 'Stern Drive', 'Electric', 'Parts & Accessories'] },
  { label: 'Fuel Type', options: ['Petrol', 'Diesel', 'Electric'] },
  { label: 'Stroke', options: ['4-Stroke', '2-Stroke'] },
  { label: 'Shaft Length', options: ['Short', 'Long', 'Extra Long'] },
]

export default function BoatEnginesPage() {
  return (
    <div className="min-h-screen bg-brand-offwhite">
      {/* Hero banner */}
      <section className="bg-gradient-to-r from-brand-navy to-blue-900 text-white py-14">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <span className="sale-badge bg-brand-blue text-white mb-3 inline-block">MARINE PROPULSION</span>
            <h1 className="font-syne font-800 text-3xl md:text-4xl mb-3">Boat Engines</h1>
            <p className="font-manrope text-white/80 text-base mb-6">
              Genuine outboard and inboard marine engines from the world&apos;s leading brands. 
              All imports verified — Yamaha, Honda, Mercury, Suzuki and more.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {['Outboard Engines', 'Inboard Engines', 'Stern Drive', 'Electric Marine', 'Engine Parts'].map((cat) => (
                <Link key={cat} href={`/shop?category=boat-engines&type=${cat.toLowerCase().replace(' ', '-')}`}
                  className="text-sm font-manrope font-600 bg-white/15 hover:bg-white/25 px-4 py-2 rounded-full transition-colors border border-white/20">
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured brands strip */}
      <div className="bg-white border-b border-brand-border py-5">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 overflow-x-auto pb-1">
            <span className="font-manrope font-600 text-text-4 text-xs uppercase tracking-wider shrink-0">Official Brands:</span>
            {ENGINE_BRANDS.map((brand) => (
              <Link key={brand.slug} href={`/shop/boat-engines?brand=${brand.slug}`}
                className="shrink-0 px-5 py-2 bg-brand-offwhite border border-brand-border rounded-lg font-syne font-700 text-text-2 hover:border-brand-blue hover:text-brand-blue transition-colors text-sm">
                {brand.icon} {brand.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Filter sidebar */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="bg-white rounded-xl border border-brand-border p-4 sticky top-24 space-y-4">
              <h3 className="font-syne font-700 text-text-1 flex items-center gap-2">
                <Filter className="w-4 h-4" /> Filter Engines
              </h3>
              {FILTER_SPECS.map((spec) => (
                <div key={spec.label} className="border-t border-brand-border pt-3">
                  <h4 className="font-syne font-700 text-text-1 text-xs uppercase tracking-wider mb-2">{spec.label}</h4>
                  <div className="space-y-1.5">
                    {spec.options.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-brand-blue rounded" />
                        <span className="text-sm font-manrope text-text-2">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {/* HP Range */}
              <div className="border-t border-brand-border pt-3">
                <h4 className="font-syne font-700 text-text-1 text-xs uppercase tracking-wider mb-2">Horsepower Range</h4>
                <div className="flex gap-2 items-center text-xs font-manrope text-text-3">
                  <input type="number" placeholder="2 HP" className="w-16 border border-brand-border rounded px-2 py-1 text-xs" />
                  <span>–</span>
                  <input type="number" placeholder="350 HP" className="w-16 border border-brand-border rounded px-2 py-1 text-xs" />
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <div className="flex-1">
            {ENGINE_BRANDS.map((brand) => (
              <div key={brand.slug} className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex items-center gap-3 bg-gradient-to-r ${brand.color} text-white px-5 py-2.5 rounded-xl`}>
                    <span className="text-xl">{brand.icon}</span>
                    <span className="font-syne font-800 text-lg">{brand.name}</span>
                    <span className="text-white/60 text-xs font-manrope">Outboard & Inboard Engines</span>
                  </div>
                  <Link href={`/shop?brand=${brand.slug}&category=boat-engines`}
                    className="flex items-center gap-1 text-sm text-brand-blue font-manrope font-600 hover:underline">
                    View All {brand.name} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Model grid — placeholder until products populated */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {brand.models.slice(0, 4).map((model) => (
                    <Link key={model} href={`/shop?brand=${brand.slug}&search=${model}`}
                      className="bg-white border border-brand-border rounded-xl p-4 hover:border-brand-blue hover:shadow-card transition-all group">
                      <div className="aspect-square bg-brand-offwhite rounded-lg flex items-center justify-center mb-3 text-3xl">
                        ⚓
                      </div>
                      <div className="font-syne font-700 text-text-1 text-sm">{brand.name} {model}</div>
                      <div className="font-manrope text-text-4 text-xs mt-0.5">Outboard Engine</div>
                      <div className="font-syne font-700 text-brand-red text-sm mt-2">₦XXX,XXX</div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Buyer guide */}
            <div className="bg-white rounded-2xl border border-brand-border p-6 mt-6">
              <h3 className="font-syne font-800 text-text-1 text-xl mb-4">How to Choose the Right Engine</h3>
              <div className="space-y-3 font-manrope text-text-2 text-sm">
                {[
                  { boat: '<14ft boat', hp: '5–25 HP', use: 'Small fishing, dinghies, tenders' },
                  { boat: '14–20ft boat', hp: '25–75 HP', use: 'Recreational, fishing, patrol' },
                  { boat: '20–30ft boat', hp: '75–175 HP', use: 'Passenger, work boats, cruisers' },
                  { boat: '30ft+ boat', hp: '175–350+ HP', use: 'Commercial, fast patrol, big cruisers' },
                ].map((row) => (
                  <div key={row.boat} className="grid grid-cols-3 gap-4 py-2.5 border-b border-brand-border last:border-0">
                    <span className="font-600 text-text-1">{row.boat}</span>
                    <span className="text-brand-blue font-600">{row.hp}</span>
                    <span className="text-text-3">{row.use}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm font-manrope text-text-2">
                <strong>Need installation or advice?</strong> Book a consultation with our marine technicians →{' '}
                <Link href="/services/consultation" className="text-brand-blue hover:underline">Book Consultation</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
