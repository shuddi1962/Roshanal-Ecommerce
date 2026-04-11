import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle, TrendingUp, Package, DollarSign, BarChart3, Users } from 'lucide-react'
import { generateMetadata as genMeta } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Become a Vendor — Sell on Roshanal Global Marketplace',
  description: 'Join Nigeria\'s fastest-growing B2B and B2C marketplace. List your products, reach thousands of buyers, and grow your business with Roshanal Global.',
  path: '/become-a-vendor',
})

export default function BecomeAVendorPage() {
  const BENEFITS = [
    { icon: <Users className="w-5 h-5" />, title: 'Access 50,000+ Customers', desc: 'Tap into our growing base of verified buyers across Nigeria and West Africa' },
    { icon: <TrendingUp className="w-5 h-5" />, title: 'Built-in Marketing', desc: 'Your products appear in our search, category pages, and marketing campaigns' },
    { icon: <Package className="w-5 h-5" />, title: 'Managed Logistics', desc: 'Use our delivery network or your own. We handle the platform infrastructure.' },
    { icon: <BarChart3 className="w-5 h-5" />, title: 'Full Analytics', desc: 'Real-time sales, order tracking, and performance insights on your vendor dashboard' },
    { icon: <DollarSign className="w-5 h-5" />, title: 'Fast Payouts', desc: 'Weekly, bi-weekly, or monthly payouts directly to your Nigerian bank account' },
    { icon: <CheckCircle className="w-5 h-5" />, title: 'Ad Platform', desc: 'Run CPC, CPM, CPA ad campaigns to boost visibility — managed from your dashboard' },
  ]

  const STEPS = [
    { step: '01', title: 'Apply Online', desc: 'Fill in your business details and product categories' },
    { step: '02', title: 'Get Approved', desc: 'Admin review within 24–48 hours' },
    { step: '03', title: 'List Products', desc: 'Upload products via dashboard, CSV, or API' },
    { step: '04', title: 'Start Selling', desc: 'Your products go live in the marketplace' },
    { step: '05', title: 'Get Paid', desc: 'Earnings credited to your vendor wallet' },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-navy to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <span className="sale-badge bg-brand-blue text-white mb-4 inline-block">VENDOR MARKETPLACE</span>
          <h1 className="font-syne font-800 text-4xl md:text-5xl mb-4 leading-tight">
            Sell More on Roshanal Global
          </h1>
          <p className="font-manrope text-white/80 text-lg mb-8">
            Join hundreds of vendors selling security, marine, solar, and technology products to buyers across Nigeria and West Africa.
          </p>
          <Link href="#apply"
            className="inline-flex items-center gap-2 bg-brand-red text-white font-syne font-700 px-8 py-4 rounded-xl hover:bg-red-700 transition-colors text-lg shadow-float">
            Apply to Sell <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-brand-offwhite">
        <div className="container mx-auto px-4">
          <h2 className="font-syne font-800 text-2xl md:text-3xl text-text-1 text-center mb-10">Why Sell on Roshanal Global?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white rounded-xl border border-brand-border p-6">
                <div className="w-10 h-10 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center mb-3">{b.icon}</div>
                <h3 className="font-syne font-700 text-text-1 mb-1">{b.title}</h3>
                <p className="font-manrope text-text-3 text-sm">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white border-t border-brand-border">
        <div className="container mx-auto px-4">
          <h2 className="font-syne font-800 text-2xl text-center text-text-1 mb-10">How It Works</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {STEPS.map((s, i) => (
              <div key={s.step} className="flex items-center gap-3">
                <div className="flex flex-col items-center text-center max-w-[120px]">
                  <div className="w-10 h-10 bg-brand-blue rounded-full flex items-center justify-center text-white font-syne font-700 text-sm mb-2">{s.step}</div>
                  <div className="font-syne font-700 text-text-1 text-sm mb-1">{s.title}</div>
                  <div className="font-manrope text-text-3 text-xs">{s.desc}</div>
                </div>
                {i < STEPS.length - 1 && <ArrowRight className="w-5 h-5 text-text-4 shrink-0 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commission structure */}
      <section className="py-14 bg-brand-offwhite border-t border-brand-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-syne font-800 text-2xl text-text-1 text-center mb-8">Commission Structure</h2>
          <div className="bg-white rounded-2xl border border-brand-border overflow-hidden">
            <table className="w-full">
              <thead className="bg-brand-offwhite">
                <tr>
                  {['Tier', 'Commission Rate', 'Features', 'Payout Schedule'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-manrope font-700 text-text-4 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border font-manrope text-sm">
                {[
                  { tier: 'Standard', rate: '10%', features: 'Basic dashboard, standard support', payout: 'Monthly' },
                  { tier: 'Premium', rate: '8%', features: 'Priority listing, advanced analytics, ads', payout: 'Bi-weekly' },
                  { tier: 'Verified', rate: '6%', features: 'Top search placement, custom shop, dedicated support', payout: 'Weekly' },
                ].map((row) => (
                  <tr key={row.tier} className="hover:bg-brand-offwhite">
                    <td className="px-5 py-4 font-syne font-700 text-text-1">{row.tier}</td>
                    <td className="px-5 py-4 font-syne font-700 text-brand-red">{row.rate}</td>
                    <td className="px-5 py-4 text-text-3">{row.features}</td>
                    <td className="px-5 py-4 text-text-3">{row.payout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="py-16 bg-white border-t border-brand-border">
        <div className="container mx-auto px-4 max-w-lg">
          <h2 className="font-syne font-800 text-2xl text-text-1 text-center mb-2">Apply to Become a Vendor</h2>
          <p className="font-manrope text-text-3 text-sm text-center mb-8">Complete the form below. Our team reviews all applications within 24–48 hours.</p>
          <div className="bg-white rounded-2xl border border-brand-border p-7">
            <form className="space-y-4">
              {[
                { label: 'Business Name', placeholder: 'Your registered business name', type: 'text' },
                { label: 'RC Number (optional)', placeholder: 'Company registration number', type: 'text' },
                { label: 'Email Address', placeholder: 'business@example.com', type: 'email' },
                { label: 'Phone Number', placeholder: '+234 xxx xxxx xxx', type: 'tel' },
                { label: 'Product Category', placeholder: 'What do you sell?', type: 'text' },
                { label: 'Bank Name', placeholder: 'Your business bank', type: 'text' },
                { label: 'Account Number', placeholder: 'NUBAN account number', type: 'text' },
              ].map((field) => (
                <div key={field.label}>
                  <label className="block font-manrope font-600 text-text-2 text-sm mb-1.5">{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder}
                    className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue" />
                </div>
              ))}
              <div>
                <label className="block font-manrope font-600 text-text-2 text-sm mb-1.5">Tell us about your products</label>
                <textarea rows={3} placeholder="Brief description of what you sell and where you're based..."
                  className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue resize-none" />
              </div>
              <button type="submit"
                className="w-full bg-brand-blue hover:bg-blue-700 text-white font-syne font-700 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                Submit Application <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
