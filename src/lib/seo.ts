/**
 * SEO Utility Functions
 * - Per-page meta generation
 * - Schema.org structured data generators
 * - OpenGraph + Twitter Card tags
 * - hreflang support
 */

import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roshanalglobal.com'
const SITE_NAME = 'Roshanal Global'

export interface SEOParams {
  title: string
  description?: string
  path: string
  image?: string
  noIndex?: boolean
  type?: 'website' | 'article'
  publishedAt?: string
  updatedAt?: string
  keywords?: string[]
}

/**
 * Generate Next.js Metadata object for any page.
 */
export function generateMetadata(params: SEOParams): Metadata {
  const url = `${SITE_URL}${params.path}`
  const image = params.image ?? `${SITE_URL}/og-default.png`
  const description = params.description ?? `${params.title} - Shop security systems, marine equipment, boat engines, and professional services from Roshanal Global.`

  return {
    title: `${params.title} | ${SITE_NAME}`,
    description,
    keywords: params.keywords?.join(', '),
    alternates: { canonical: url },
    robots: params.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title: params.title,
      description: params.description,
      url,
      siteName: SITE_NAME,
      images: [{ url: image, width: 1200, height: 630, alt: params.title }],
      type: (params.type as 'website' | 'article') ?? 'website',
      locale: 'en_NG',
      ...(params.publishedAt && { publishedTime: params.publishedAt }),
      ...(params.updatedAt && { modifiedTime: params.updatedAt }),
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
      images: [image],
      site: '@RoshanalglobalNG',
    },
  }
}

/** Schema.org Product */
export function productSchema(product: {
  name: string
  description: string
  sku: string
  brand: string
  imageUrl: string
  priceNaira: number
  availability: 'InStock' | 'OutOfStock' | 'PreOrder'
  reviewCount?: number
  ratingValue?: number
  url: string
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    sku: product.sku,
    brand: { '@type': 'Brand', name: product.brand },
    image: product.imageUrl,
    offers: {
      '@type': 'Offer',
      price: (product.priceNaira / 100).toFixed(2),
      priceCurrency: 'NGN',
      availability: `https://schema.org/${product.availability}`,
      url: product.url,
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
    ...(product.reviewCount && product.ratingValue
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.ratingValue,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  }
}

/** Schema.org Organization */
export function organizationSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Roshanal Infotech Limited',
    alternateName: 'Roshanal Global',
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+234-800-ROSHANAL',
      contactType: 'customer service',
      areaServed: 'NG',
      availableLanguage: 'English',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: '14 Aba Road',
      addressLocality: 'Port Harcourt',
      addressRegion: 'Rivers State',
      addressCountry: 'NG',
    },
    sameAs: [
      'https://www.facebook.com/roshanalglobal',
      'https://www.instagram.com/roshanalglobal',
      'https://twitter.com/roshanalglobal',
    ],
  }
}

/** Schema.org BreadcrumbList */
export function breadcrumbSchema(
  crumbs: Array<{ name: string; url: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.url}`,
    })),
  }
}

/** Schema.org FAQPage */
export function faqSchema(
  faq: Array<{ question: string; answer: string }>
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

/** Schema.org LocalBusiness */
export function localBusinessSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Roshanal Global',
    image: `${SITE_URL}/images/storefront.jpg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: '14 Aba Road',
      addressLocality: 'Port Harcourt',
      addressRegion: 'Rivers State',
      postalCode: '500001',
      addressCountry: 'NG',
    },
    telephone: '+234-800-ROSHANAL',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '18:00',
      },
    ],
    url: SITE_URL,
    priceRange: '₦₦₦',
  }
}

/**
 * Inject schema.org JSON-LD script tag content.
 */
export function schemaScript(data: Record<string, unknown>): string {
  return JSON.stringify(data)
}
