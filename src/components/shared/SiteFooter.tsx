'use client'

import React from 'react'
import Link from 'next/link'
import { Phone, Mail, MapPin, Clock } from 'lucide-react'

// Social icons as simple SVG components (lucide-react version may not export these)
const Facebook = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
const Instagram = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
const Twitter = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
const Linkedin = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
const Youtube = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-1.96C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-1.96 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.47z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>

const FOOTER_COLS = [
  {
    title: 'Products',
    links: [
      { label: 'CCTV & Surveillance', href: '/categories/security' },
      { label: 'Fire Alarm Systems', href: '/categories/fire-alarm' },
      { label: 'Access Control', href: '/categories/access-control' },
      { label: 'Boat Engines', href: '/shop/boat-engines' },
      { label: 'Marine Accessories', href: '/categories/marine' },
      { label: 'Solar & Energy', href: '/categories/solar' },
      { label: 'Networking & ICT', href: '/categories/networking' },
      { label: 'Safety Equipment', href: '/categories/safety' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Boat Building', href: '/services/boat-building' },
      { label: 'Kitchen Installation', href: '/services/kitchen-installation' },
      { label: 'CCTV Installation', href: '/services/cctv-installation' },
      { label: 'Fire Alarm Installation', href: '/services/fire-alarm' },
      { label: 'Dredging Services', href: '/services/dredging' },
      { label: 'Maintenance Contracts', href: '/services/maintenance' },
      { label: 'B2B Consultation', href: '/services/consultation' },
      { label: 'Request a Quote', href: '/quote' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Roshanal', href: '/about' },
      { label: 'Blog & News', href: '/blog' },
      { label: 'Find a Store', href: '/stores' },
      { label: 'Affiliate Program', href: '/affiliate' },
      { label: 'Become a Vendor', href: '/become-a-vendor' },
      { label: 'B2B / Wholesale', href: '/wholesale' },
      { label: 'Careers', href: '/about#careers' },
      { label: 'Press', href: '/about#press' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Track Your Order', href: '/track-order' },
      { label: 'Returns & Refunds', href: '/help#returns' },
      { label: 'Warranty Claims', href: '/help#warranty' },
      { label: 'Contact Us', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

const SOCIAL = [
  { icon: Facebook, href: 'https://facebook.com/roshanalglobal', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com/roshanalglobal', label: 'Instagram' },
  { icon: Twitter, href: 'https://twitter.com/roshanalglobal', label: 'Twitter/X' },
  { icon: Linkedin, href: 'https://linkedin.com/company/roshanalglobal', label: 'LinkedIn' },
  { icon: Youtube, href: 'https://youtube.com/@roshanalglobal', label: 'YouTube' },
] as const

export default function SiteFooter() {
  return (
    <footer className="bg-brand-navy text-white">
      {/* Main footer grid */}
      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-blue to-blue-800 flex items-center justify-center shadow-md">
                <span className="font-syne font-800 text-white text-lg leading-none">RS</span>
              </div>
              <div>
                <div className="font-syne font-800 text-white text-[17px] tracking-wide uppercase">Roshanal Global</div>
                <div className="font-manrope text-brand-red text-[9px] font-600 uppercase tracking-[0.12em]">Infotech Limited</div>
              </div>
            </Link>

            <p className="text-white/60 text-sm font-manrope leading-relaxed mb-6 max-w-xs">
              Nigeria&apos;s premier supplier of security systems, marine equipment, solar solutions, boat engines, and technology products. Serving businesses and individuals across Nigeria and globally since 2010.
            </p>

            {/* Contact info */}
            <div className="space-y-2.5 mb-6">
              <a href="tel:+2348001234567" className="flex items-center gap-2.5 text-white/70 hover:text-white transition-colors text-sm">
                <Phone className="w-4 h-4 text-brand-blue shrink-0" />
                +234 800 ROSHANAL
              </a>
              <a href="mailto:info@roshanalglobal.com" className="flex items-center gap-2.5 text-white/70 hover:text-white transition-colors text-sm">
                <Mail className="w-4 h-4 text-brand-blue shrink-0" />
                info@roshanalglobal.com
              </a>
              <div className="flex items-start gap-2.5 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                14 Aba Road, Port Harcourt, Rivers State, Nigeria
              </div>
              <div className="flex items-center gap-2.5 text-white/60 text-sm">
                <Clock className="w-4 h-4 text-brand-blue shrink-0" />
                Monday–Saturday, 8AM–6PM WAT
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-blue flex items-center justify-center transition-colors"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <h4 className="font-syne font-700 text-white text-sm uppercase tracking-wider mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/60 hover:text-white text-sm font-manrope transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs font-manrope text-center sm:text-left">
            &copy; {new Date().getFullYear()} Roshanal Infotech Limited. All rights reserved. RC: 1234567
          </p>
          <div className="flex items-center gap-4 text-white/40 text-xs">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">Terms</Link>
            <Link href="/sitemap.xml" className="hover:text-white/70 transition-colors">Sitemap</Link>
          </div>
          {/* Payment icons */}
          <div className="flex items-center gap-2 opacity-50">
            {['Visa', 'MC', 'Paystack', 'Bank'].map((p) => (
              <div key={p} className="bg-white/10 rounded px-2 py-0.5 text-[10px] font-mono">{p}</div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
