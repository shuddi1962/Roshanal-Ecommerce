import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(): Promise<NextResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roshanalglobal.com'

  const staticRoutes = ['', '/shop', '/blog', '/contact', '/about', '/track-order']

  const { data: products } = await db
    .from('products')
    .select('slug')
    .eq('is_active', true)
    .eq('is_draft', false)

  const { data: categories } = await db
    .from('categories')
    .select('slug')
    .eq('is_active', true)

  const { data: blogPosts } = await db
    .from('blog_posts')
    .select('slug')
    .eq('status', 'published')

  const urls: string[] = []

  for (const route of staticRoutes) {
    urls.push(`${baseUrl}${route}`)
  }

  if (products) {
    for (const p of products) {
      urls.push(`${baseUrl}/products/${(p as { slug: string }).slug}`)
    }
  }

  if (categories) {
    for (const c of categories) {
      urls.push(`${baseUrl}/categories/${(c as { slug: string }).slug}`)
    }
  }

  if (blogPosts) {
    for (const bp of blogPosts) {
      urls.push(`${baseUrl}/blog/${(bp as { slug: string }).slug}`)
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <url>
    <loc>${url}</loc>
    <changefreq>${url === baseUrl ? 'daily' : 'weekly'}</changefreq>
    <priority>${url === baseUrl ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
    },
  })
}
