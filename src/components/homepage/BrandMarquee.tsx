'use client'

import React from 'react'
import Link from 'next/link'

const BRANDS = [
  { name: 'Yamaha', slug: 'yamaha' },
  { name: 'Honda', slug: 'honda' },
  { name: 'Mercury', slug: 'mercury' },
  { name: 'Suzuki', slug: 'suzuki' },
  { name: 'Hikvision', slug: 'hikvision' },
  { name: 'Dahua', slug: 'dahua' },
  { name: 'Pelco', slug: 'pelco' },
  { name: 'Cisco', slug: 'cisco' },
  { name: 'Volvo', slug: 'volvo' },
  { name: 'Tohatsu', slug: 'tohatsu' },
  { name: 'Solex', slug: 'solex' },
  { name: 'Sukam', slug: 'sukam' },
]

export default function BrandMarquee() {
  return (
    <div>
      <h3 className="font-syne font-700 text-text-3 text-xs uppercase tracking-widest text-center mb-5">Authorized Dealer — Trusted Brands</h3>
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee gap-12 w-max">
          {[...BRANDS, ...BRANDS].map((brand, i) => (
            <Link
              key={`${brand.slug}-${i}`}
              href={`/brands?brand=${brand.slug}`}
              className="shrink-0 px-6 py-2 bg-white border border-brand-border rounded-lg hover:border-brand-blue hover:shadow-card transition-all"
            >
              <span className="font-syne font-700 text-text-3 hover:text-brand-blue transition-colors text-sm">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
