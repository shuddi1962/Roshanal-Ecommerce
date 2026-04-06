import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const ids = request.nextUrl.searchParams.get('ids')?.split(',').filter(Boolean)
  if (!ids?.length) return NextResponse.json({ products: [] })

  const { data: products } = await db
    .from('products')
    .select('id, name, slug, sku, regular_price_kobo, sale_price_kobo, images, brands:brand_id(name)')
    .in('id', ids.slice(0, 50)) // max 50
    .eq('is_active', true)

  const formatted = (products ?? []).map((p) => {
    const images = (p.images as Array<{ small?: string; url?: string }>) ?? []
    const brand = p.brands as { name?: string } | null
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      regularPriceKobo: p.regular_price_kobo,
      salePriceKobo: p.sale_price_kobo,
      image: images[0]?.small ?? images[0]?.url,
      brand: brand?.name ?? '',
    }
  })

  return NextResponse.json({ products: formatted })
}
