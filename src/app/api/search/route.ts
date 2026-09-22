import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const query = request.nextUrl.searchParams.get('q')?.trim()
  const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '8')

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const [productsResult, categoriesResult, blogsResult] = await Promise.allSettled([
    db
      .from('products')
      .select('id, name, slug, images, regular_price_kobo, sale_price_kobo')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .eq('is_draft', false)
      .limit(Math.min(limit, 6)),

    db
      .from('categories')
      .select('id, name, slug, image_url')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .limit(3),

    db
      .from('blog_posts')
      .select('id, title, slug, cover_image')
      .ilike('title', `%${query}%`)
      .eq('status', 'published')
      .limit(2),
  ])

  const results: Array<{
    id: string; type: string; name: string; slug: string; price?: string; image?: string
  }> = []

  if (productsResult.status === 'fulfilled' && productsResult.value.data) {
    for (const p of productsResult.value.data) {
      const images = p.images as Array<{ small?: string; url?: string }> ?? []
      const price = p.sale_price_kobo ?? p.regular_price_kobo
      results.push({
        id: p.id,
        type: 'product',
        name: p.name,
        slug: p.slug,
        price: `₦${(price / 100).toLocaleString('en-NG')}`,
        image: images[0]?.small ?? images[0]?.url,
      })
    }
  }

  if (categoriesResult.status === 'fulfilled' && categoriesResult.value.data) {
    for (const c of categoriesResult.value.data) {
      results.push({ id: c.id, type: 'category', name: c.name, slug: c.slug, image: c.image_url ?? undefined })
    }
  }

  if (blogsResult.status === 'fulfilled' && blogsResult.value.data) {
    for (const b of blogsResult.value.data) {
      results.push({ id: b.id, type: 'blog', name: b.title, slug: b.slug, image: b.cover_image ?? undefined })
    }
  }

  return NextResponse.json({ results }, {
    headers: { 'Cache-Control': 'private, max-age=60' },
  })
}
