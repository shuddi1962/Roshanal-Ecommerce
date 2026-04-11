import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react'
import { generateMetadata as genMeta, localBusinessSchema, schemaScript } from '@/lib/seo'

export const metadata: Metadata = genMeta({
  title: 'Contact Us — Roshanal Global',
  description: 'Get in touch with Roshanal Global. Call us at +234 800 ROSHANAL, email info@roshanalglobal.com, or visit our store at 14 Aba Road, Port Harcourt.',
  path: '/contact',
})

export default function ContactPage() {
  const schema = localBusinessSchema()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaScript(schema) }} />

      <div className="min-h-screen bg-brand-offwhite">
        <div className="bg-white border-b border-brand-border py-10">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-syne font-800 text-3xl text-text-1 mb-2">Contact Us</h1>
            <p className="font-manrope text-text-3">We&apos;re here to help. Reach us by phone, email, or visit our store.</p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Contact info */}
            <div className="space-y-5">
              <h2 className="font-syne font-800 text-xl text-text-1">Get in Touch</h2>

              {[
                { icon: <Phone className="w-5 h-5 text-brand-blue" />, label: 'Phone', value: '+234 800 ROSHANAL', href: 'tel:+2348001234567' },
                { icon: <Mail className="w-5 h-5 text-brand-blue" />, label: 'Email', value: 'info@roshanalglobal.com', href: 'mailto:info@roshanalglobal.com' },
                { icon: <MapPin className="w-5 h-5 text-brand-blue" />, label: 'Address', value: '14 Aba Road, Port Harcourt, Rivers State, Nigeria', href: 'https://maps.google.com/?q=14+Aba+Road+Port+Harcourt' },
                { icon: <Clock className="w-5 h-5 text-brand-blue" />, label: 'Business Hours', value: 'Monday – Saturday: 8:00 AM – 6:00 PM WAT', href: null },
              ].map((item) => (
                <div key={item.label} className="flex items-start gap-4 bg-white rounded-xl border border-brand-border p-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">{item.icon}</div>
                  <div>
                    <div className="font-manrope font-700 text-text-2 text-xs uppercase tracking-wider mb-0.5">{item.label}</div>
                    {item.href ? (
                      <a href={item.href} className="font-manrope text-text-1 text-sm hover:text-brand-blue transition-colors">{item.value}</a>
                    ) : (
                      <div className="font-manrope text-text-1 text-sm">{item.value}</div>
                    )}
                  </div>
                </div>
              ))}

              {/* WhatsApp CTA */}
              <a
                href="https://wa.me/2348001234567?text=Hello%20Roshanal%20Global%2C%20I%20need%20help%20with..."
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white rounded-xl p-4 transition-colors"
              >
                <span className="text-2xl">💬</span>
                <div>
                  <div className="font-syne font-700 text-sm">WhatsApp Us</div>
                  <div className="text-white/80 text-xs font-manrope">Quick response via WhatsApp</div>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </a>
            </div>

            {/* Contact form */}
            <div className="bg-white rounded-2xl border border-brand-border p-7">
              <h2 className="font-syne font-800 text-xl text-text-1 mb-5">Send a Message</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-manrope font-600 text-text-2 text-sm mb-1.5">Name</label>
                    <input type="text" placeholder="Your full name" className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue" />
                  </div>
                  <div>
                    <label className="block font-manrope font-600 text-text-2 text-sm mb-1.5">Phone</label>
                    <input type="tel" placeholder="+234 xxx xxxx xxx" className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue" />
                  </div>
                </div>
                <div>
                  <label className="block font-manrope font-600 text-text-2 text-sm mb-1.5">Email</label>
                  <input type="email" placeholder="you@example.com" className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue" />
                </div>
                <div>
                  <label className="block font-manrope font-600 text-text-2 text-sm mb-1.5">Subject</label>
                  <select className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue">
                    <option>Select a subject</option>
                    <option>Product inquiry</option>
                    <option>Request for quotation</option>
                    <option>Service booking</option>
                    <option>After-sales support</option>
                    <option>Become a vendor</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-manrope font-600 text-text-2 text-sm mb-1.5">Message</label>
                  <textarea rows={5} placeholder="Tell us how we can help..." className="w-full border border-brand-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-blue resize-none" />
                </div>
                <button type="submit" className="w-full bg-brand-blue hover:bg-blue-700 text-white font-syne font-700 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                  Send Message <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
