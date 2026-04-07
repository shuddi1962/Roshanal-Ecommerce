import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    let dbQuery = adminDb
      .from('products')
      .select('*, inventory:inventory(branch_id, quantity)')
      .eq('is_active', true)
      .eq('is_draft', false)
      .limit(limit)

    if (query.trim()) {
      const cleanQuery = query.trim()
      dbQuery = dbQuery.or(`name.ilike.%${cleanQuery}%,sku.ilike.%${cleanQuery}%,barcode.ilike.%${cleanQuery}%`)
    }

    const { data: products, error } = await dbQuery

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const formattedProducts = (products || []).map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      regular_price_kobo: product.regular_price_kobo,
      sale_price_kobo: product.sale_price_kobo,
      images: product.images || [],
      inventory: product.inventory || [],
    }))

    return NextResponse.json({ products: formattedProducts })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
