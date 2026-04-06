import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Phone } from 'lucide-react'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Kitchen Installation Services — Indoor, Outdoor & Commercial',
  description: 'Professional kitchen installation by Roshanal Global. Indoor kitchens, outdoor cooking stations, commercial kitchens, and domestic kitchen fit-outs across Nigeria.',
  path: '/services/kitchen-installation',
  keywords: ['kitchen installation Nigeria', 'outdoor kitchen Nigeria', 'commercial kitchen Port Harcourt', 'kitchen fitting Nigeria'],
})

const SERVICE_TABS = [
  {
    id: 'indoor',
    label: 'Indoor Kitchen',
    icon: '🍽️',
    desc: 'Full indoor kitchen design and installation for homes and apartments.',
    features: ['Cabinets & Worktops', 'Cooking Ranges & Ovens', 'Extractor Hoods', 'Sinks & Taps', 'Refrigeration', 'Dishwashers', 'Kitchen Islands', 'Kitchen Lighting'],
    startingPrice: '₦350,000',
  },
  {
    id: 'outdoor',
    label: 'Outdoor Kitchen',
    icon: '🔥',
    desc: 'Outdoor BBQ stations, patio kitchens, and garden cooking areas.',
    features: ['Outdoor Grills & BBQ Stations', 'Patio Kitchens', 'Outdoor Refrigeration', 'Weatherproof Worktops', 'Pizza Ovens', 'Outdoor Sinks', 'Canopy Structures'],
    startingPrice: '₦250,000',
  },
  {
    id: 'commercial',
    label: 'Commercial Kitchen',
    icon: '🏭',
    desc: 'Industrial-grade commercial kitchen setups for restaurants, hotels & caterers.',
    features: ['Commercial Fryers', 'Commercial Ovens', 'Walk-in Refrigerators', 'Industrial Extractors', 'Commercial Dishwashers', 'Cold Rooms', 'Steam Ovens', 'Stainless Steel Benches'],
    startingPrice: '₦1,200,000',
  },
  {
    id: 'cooking-equipment',
    label: 'Cooking Equipment',
    icon: '🫕',
    desc: 'Supply and installation of standalone cooking equipment and appliances.',
    features: ['Gas Cookers', 'Electric Cookers', 'Microwaves', 'Blenders & Mixers', 'Deep Fryers', 'Rice Cookers', 'Pressure Cookers', 'Kitchen Accessories'],
    startingPrice: '₦50,000',
  },
]

export default function KitchenInstallationPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-900 to-amber-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <span className="sale-badge bg-amber-600 text-white mb-4 inline-block">PROFESSIONAL INSTALLATION</span>
            <h1 className="font-syne font-800 text-3xl md:text-5xl mb-4">
              Kitchen Installation Services
            </h1>
            <p className="text-white/80 font-manrope text-lg max-w-xl leading-relaxed mb-6">
              From cozy home kitchens to industrial commercial setups — we design, supply, and install complete kitchen solutions across Nigeria.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/quote" className="flex items-center gap-2 bg-white text-orange-900 font-syne font-700 px-6 py-3 rounded-lg hover:bg-orange-50 transition-colors">
                Get Free Quote <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="tel:+2348001234567" className="flex items-center gap-2 border-2 border-white text-white font-syne font-700 px-6 py-3 rounded-lg hover:bg-white/10 transition-colors">
                <Phone className="w-4 h-4" /> Call Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Service type tabs */}
      <section className="py-14 bg-brand-offwhite">
        <div className="container mx-auto px-4">
          <h2 className="font-syne font-800 text-2xl md:text-3xl text-text-1 text-center mb-10">What We Install</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICE_TABS.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl border border-brand-border p-6 hover:shadow-card-hover transition-shadow">
                <div className="text-3xl mb-3">{service.icon}</div>
                <h3 className="font-syne font-800 text-text-1 text-xl mb-2">{service.label}</h3>
                <p className="font-manrope text-text-3 text-sm mb-4">{service.desc}</p>
                <div className="grid grid-cols-2 gap-1.5 mb-5">
                  {service.features.map((f) => (
                    <div key={f} className="flex items-center gap-1.5 text-xs font-manrope text-text-2">
                      <CheckCircle className="w-3 h-3 text-success shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-syne font-700 text-brand-red">From {service.startingPrice}</span>
                  <Link href={`/quote?service=kitchen-${service.id}`}
                    className="flex items-center gap-1.5 bg-brand-blue text-white font-syne font-700 text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Book Now <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-14 bg-white border-t border-brand-border">
        <div className="container mx-auto px-4">
          <h2 className="font-syne font-800 text-2xl text-text-1 text-center mb-8">Why Choose Roshanal for Kitchen Installation?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: '⚡', title: 'Fast Turnaround', desc: 'Most kitchen installations completed within 3–7 days depending on scope' },
              { icon: '🛡️', title: '2-Year Workmanship Warranty', desc: 'All our installations backed by a 2-year workmanship guarantee' },
              { icon: '🔧', title: 'Supply & Install', desc: 'We source quality materials and handle everything from design to cleanup' },
            ].map((t) => (
              <div key={t.title} className="text-center bg-brand-offwhite rounded-xl p-6 border border-brand-border">
                <div className="text-3xl mb-3">{t.icon}</div>
                <h3 className="font-syne font-700 text-text-1 mb-2">{t.title}</h3>
                <p className="font-manrope text-text-3 text-sm">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 bg-brand-red text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-syne font-800 text-2xl md:text-3xl mb-4">Ready to Transform Your Kitchen?</h2>
          <p className="font-manrope text-white/80 mb-6">Book a free site visit — our team will assess your space and provide a detailed quote.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/quote?service=kitchen" className="flex items-center gap-2 bg-white text-brand-red font-syne font-700 px-8 py-3.5 rounded-xl hover:bg-red-50">
              Request Free Quote <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="tel:+2348001234567" className="flex items-center gap-2 border-2 border-white text-white font-syne font-700 px-8 py-3.5 rounded-xl hover:bg-white/10">
              <Phone className="w-4 h-4" /> +234 800 ROSHANAL
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
