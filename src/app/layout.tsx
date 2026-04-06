import type { Metadata } from 'next'
import { Syne, Manrope, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { organizationSchema } from '@/lib/seo'

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  display: 'swap',
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Roshanal Global — Security, Marine & Technology Products',
    template: '%s | Roshanal Global',
  },
  description:
    'Roshanal Global (Roshanal Infotech Limited) — Your trusted supplier of CCTV, Security Systems, Marine Accessories, Boat Engines, Solar, Networking & ICT solutions in Nigeria.',
  keywords: [
    'CCTV Nigeria', 'Security systems Port Harcourt', 'Marine accessories Nigeria',
    'Boat engines Nigeria', 'Solar panels Nigeria', 'Networking equipment Nigeria',
    'Roshanal Global', 'Roshanal Infotech',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roshanalglobal.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: '/',
    siteName: 'Roshanal Global',
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'Roshanal Global — AI Commerce Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@RoshanalglobalNG',
  },
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? '',
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const orgSchema = organizationSchema()

  return (
    <html
      lang="en"
      className={`${syne.variable} ${manrope.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* Schema.org — Organization (global) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        {/* Google Tag Manager placeholder — injected when ga4/gtm flag is ON */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');`,
            }}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col bg-brand-offwhite font-manrope text-text-1">
        {/* GTM noscript fallback */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'var(--font-manrope)',
              fontSize: '14px',
              background: '#fff',
              color: '#080E22',
              border: '1px solid #E8EBF6',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(8,14,34,.12)',
            },
            success: {
              iconTheme: { primary: '#0B6B3A', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#C8191C', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
