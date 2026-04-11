'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { SlotProvider } from '@/components/slots/ComponentSlot'

const SiteHeader = dynamic(() => import('@/components/shared/SiteHeader'), { ssr: true })
const SiteFooter = dynamic(() => import('@/components/shared/SiteFooter'), { ssr: true })
const AISupportChat = dynamic(() => import('@/components/shared/AISupportChat'), { ssr: false })
const CookieConsentBanner = dynamic(() => import('@/components/shared/CookieConsentBanner'), { ssr: false })

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <SlotProvider>
      <Suspense fallback={<div className="h-[148px] bg-[#0C1A36]" />}>
        <SiteHeader />
      </Suspense>

      <main className="flex-1 min-h-screen">
        {children}
      </main>

      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>

      <Suspense fallback={null}>
        <AISupportChat />
      </Suspense>

      <Suspense fallback={null}>
        <CookieConsentBanner />
      </Suspense>
    </SlotProvider>
  )
}
