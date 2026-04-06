import type { Metadata } from 'next'
import { Suspense } from 'react'
import BoatBuildingConfigurator from '@/features/boat-building/component'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Custom Boat Building Service — Design Your Vessel',
  description: 'Commission a custom-built vessel with Roshanal Global. Configure your boat online — hull type, engines, features — and get a formal quote. Fibre glass, aluminium, steel & composite builds.',
  path: '/services/boat-building',
  keywords: ['custom boat building Nigeria', 'boat building Port Harcourt', 'vessel construction Nigeria', 'fibre glass boat Nigeria', 'boat configurator'],
})

export default function BoatBuildingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-navy via-blue-900 to-teal-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/boat-bg.jpg')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <span className="sale-badge bg-brand-red text-white mb-4 inline-block">CUSTOM BUILDS</span>
          <h1 className="font-syne font-800 text-3xl md:text-5xl mb-4 leading-tight">
            Build Your Custom Vessel
          </h1>
          <p className="text-white/80 font-manrope text-lg max-w-2xl mx-auto leading-relaxed">
            From fishing boats to passenger vessels and patrol crafts — we build to your exact specifications.
            Configure online, get a formal quote, commission your build.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm font-manrope text-white/70">
            <span>✅ Fibre Glass · Aluminium · Steel · Composite</span>
            <span>✅ Yamaha · Honda · Mercury · Suzuki engines</span>
            <span>✅ All Nigeria waterways specification</span>
          </div>
        </div>
      </section>

      {/* Configurator */}
      <section className="py-16 bg-brand-offwhite">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-syne font-800 text-2xl md:text-3xl text-text-1 mb-2">Configure Your Boat</h2>
            <p className="text-text-3 font-manrope">Complete the steps below to generate your boat concept and request a quote.</p>
          </div>
          <Suspense fallback={<div className="h-[600px] bg-white rounded-2xl animate-pulse" />}>
            <BoatBuildingConfigurator />
          </Suspense>
        </div>
      </section>

      {/* Build process */}
      <section className="py-16 bg-white border-t border-brand-border">
        <div className="container mx-auto px-4">
          <h2 className="font-syne font-800 text-2xl text-center text-text-1 mb-10">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              { step: '01', title: 'Configure', desc: 'Use our online configurator to specify your vessel requirements' },
              { step: '02', title: 'Visual', desc: 'Generate a concept illustration of your boat' },
              { step: '03', title: 'Quote', desc: 'Receive a formal price quote within 48 hours' },
              { step: '04', title: 'Build', desc: 'Our team begins construction to your spec' },
              { step: '05', title: 'Deliver', desc: 'Test launch and delivery at your location' },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-12 h-12 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="font-syne font-700 text-white text-sm">{s.step}</span>
                </div>
                <h3 className="font-syne font-700 text-text-1 mb-1">{s.title}</h3>
                <p className="font-manrope text-text-3 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust section */}
      <section className="py-12 bg-brand-offwhite border-t border-brand-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: '🏭', title: '15+ Years Experience', desc: 'Building vessels for Nigeria\'s waterways since 2010' },
              { icon: '🔧', title: 'In-House Team', desc: 'Skilled marine engineers, welders and craftsmen' },
              { icon: '🛡️', title: 'Warranty Included', desc: 'All builds include a structural warranty and aftersales support' },
            ].map((t) => (
              <div key={t.title} className="bg-white rounded-xl p-6 text-center border border-brand-border">
                <div className="text-3xl mb-3">{t.icon}</div>
                <h3 className="font-syne font-700 text-text-1 mb-2">{t.title}</h3>
                <p className="font-manrope text-text-3 text-sm">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
