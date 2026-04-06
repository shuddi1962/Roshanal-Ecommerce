import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { generateMetadata as genMeta, productSchema, schemaScript } from '@/lib/seo'
import ProductDetailClient from '@/components/product/ProductDetailClient'

interface Params { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const { data: product } = await db
    .from('products')
    .select('name, short_description, images, seo_title, seo_description, seo_keyword')
    .eq('slug', slug)
    .single()

  if (!product) return {}

  const images = (product.images as Array<{ url?: string; large?: string }>) ?? []

  return genMeta({
    title: product.seo_title ?? product.name,
    description: product.seo_description ?? product.short_description ?? product.name,
    path: `/products/${slug}`,
    image: images[0]?.large ?? images[0]?.url,
    keywords: product.seo_keyword ? [product.seo_keyword] : undefined,
  })
}

export default async function ProductDetailPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params

  const { data: product } = await db
    .from('products')
    .select(`
      id, name, slug, short_description, description_html, sku, type,
      regular_price_kobo, sale_price_kobo, images, video_url, specifications,
      tags, badges, sale_badge_label, sale_badge_color, sale_badge_placements,
      countdown_enabled, countdown_end, countdown_placements, countdown_label, countdown_style,
      watermark_enabled, is_active, is_draft, vendor_id, created_at,
      brands:brand_id(name, slug, logo_url, is_authorized_dealer),
      categories:category_id(name, slug)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .eq('is_draft', false)
    .single()

  if (!product) notFound()

  const images = (product.images as Array<{ url?: string; small?: string; medium?: string; large?: string }>) ?? []
  const brandsRaw = product.brands
  const brand = brandsRaw && !Array.isArray(brandsRaw) ? brandsRaw as { name: string; slug: string; logo_url: string | null; is_authorized_dealer: boolean } : Array.isArray(brandsRaw) && brandsRaw.length > 0 ? (brandsRaw[0] as { name: string; slug: string; logo_url: string | null; is_authorized_dealer: boolean }) : null

  const schema = productSchema({
    name: product.name,
    description: product.short_description ?? product.name,
    sku: product.sku,
    brand: brand?.name ?? 'Roshanal Global',
    imageUrl: images[0]?.large ?? images[0]?.url ?? '',
    priceNaira: product.sale_price_kobo ?? product.regular_price_kobo,
    availability: 'InStock',
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roshanalglobal.com'}/products/${slug}`,
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaScript(schema) }} />
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <ProductDetailClient product={product as any} />
    </>
  )
}
