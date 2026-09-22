import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)

  const source = searchParams.get('source') ?? 'tag'
  const sourceValue = searchParams.get('sourceValue') ?? 'featured'
  const count = Math.min(parseInt(searchParams.get('count') ?? '8'), 50)
  const sort = searchParams.get('sort') ?? 'featured'
  const categorySlug = searchParams.get('category')
  const brandSlug = searchParams.get('brand')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') ?? '1')
  const offset = (page - 1) * count

  let query = db
    .from('products')
    .select(`
      id, name, slug, brand_id, category_id,
      regular_price_kobo, sale_price_kobo,
      images, badges, sale_badge_label, sale_badge_color,
      countdown_enabled, countdown_end, tags, is_active, is_draft,
      brands:brand_id(name, slug)
    `)
    .eq('is_active', true)
    .eq('is_draft', false)

  // Filter by source
  if (source === 'tag' && sourceValue) {
    query = query.contains('tags', [sourceValue])
  } else if (source === 'category' && categorySlug) {
    // Join on category slug
    const { data: cat } = await db.from('categories').select('id').eq('slug', categorySlug).single()
    if (cat) query = query.eq('category_id', cat.id)
  } else if (source === 'brand' && brandSlug) {
    const { data: brand } = await db.from('brands').select('id').eq('slug', brandSlug).single()
    if (brand) query = query.eq('brand_id', brand.id)
  }

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  // Sort
  switch (sort) {
    case 'newest':
      query = query.order('created_at', { ascending: false })
      break
    case 'price_asc':
      query = query.order('regular_price_kobo', { ascending: true })
      break
    case 'price_desc':
      query = query.order('regular_price_kobo', { ascending: false })
      break
    case 'bestselling':
      query = query.order('created_at', { ascending: false }) // placeholder: would join orders
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  query = query.range(offset, offset + count - 1)

  const { data: products, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const formatted = (products ?? []).map((p) => {
    const images = p.images as Array<{ url?: string; small?: string }> ?? []
    const firstImage = images[0]?.small ?? images[0]?.url ?? ''
    const brandData = p.brands as { name?: string; slug?: string } | null

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      brand: brandData?.name ?? '',
      regularPriceKobo: p.regular_price_kobo,
      salePriceKobo: p.sale_price_kobo,
      image: firstImage,
      badges: (p.badges as string[]) ?? [],
      saleBadgeLabel: p.sale_badge_label,
      saleBadgeColor: p.sale_badge_color,
      countdownEnabled: p.countdown_enabled,
      countdownEnd: p.countdown_end,
      inStock: true, // TODO: join inventory table
    }
  })

  return NextResponse.json({ products: formatted })
}
