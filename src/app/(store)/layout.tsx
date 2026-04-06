'use client'

import React, { Suspense } from 'react'
import dynamic from 'next/dynamic'

const SiteHeader = dynamic(() => import('@/components/shared/SiteHeader'), { ssr: true })
const SiteFooter = dynamic(() => import('@/components/shared/SiteFooter'), { ssr: true })
const AISupportChat = dynamic(() => import('@/components/shared/AISupportChat'), { ssr: false })
const CookieConsentBanner = dynamic(() => import('@/components/shared/CookieConsentBanner'), { ssr: false })

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<div className="h-[148px] bg-brand-navy" />}>
        <SiteHeader />
      </Suspense>

      <main className="flex-1 min-h-screen">
        {children}
      </main>

      <Suspense fallback={null}>
        <SiteFooter />
      </Suspense>

      {/* Feature-flagged: AI Support Chat */}
      <Suspense fallback={null}>
        <AISupportChat />
      </Suspense>

      {/* GDPR/NDPR Cookie Consent */}
      <Suspense fallback={null}>
        <CookieConsentBanner />
      </Suspense>
    </>
  )
}
