import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')
    const status = searchParams.get('status')
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    let query = adminDb
      .from('inventory')
      .select('*, products(name, sku, regular_price_kobo), branches(name, city)', { count: 'exact' })

    if (branchId && branchId !== 'all') {
      query = query.eq('branch_id', branchId)
    }

    if (search) {
      query = query.or(`product_id.eq.${search}`)
    }

    const { data: inventory, error, count } = await query.range((page - 1) * limit, page * limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const totalSKUs = count ?? 0
    const lowStock = inventory?.filter((i: any) => 
      (i.quantity - i.reserved_qty) <= i.low_stock_threshold && (i.quantity - i.reserved_qty) > 0
    ).length ?? 0
    const outOfStock = inventory?.filter((i: any) => (i.quantity - i.reserved_qty) <= 0).length ?? 0

    const formattedInventory = inventory?.map((item: any) => {
      const available = item.quantity - (item.reserved_qty || 0)
      let itemStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock'
      if (available <= 0) itemStatus = 'out_of_stock'
      else if (available <= (item.low_stock_threshold || 5)) itemStatus = 'low_stock'

      return {
        id: item.id,
        product_id: item.product_id,
        product_name: item.products?.name || 'Unknown',
        sku: item.products?.sku || 'N/A',
        price: item.products?.regular_price_kobo || 0,
        branch_id: item.branch_id,
        branch_name: item.branches?.name || 'Unknown',
        quantity: item.quantity || 0,
        reserved_qty: item.reserved_qty || 0,
        available_qty: available,
        low_stock_threshold: item.low_stock_threshold || 5,
        status: itemStatus,
        last_updated: item.created_at,
      }
    }) ?? []

    return NextResponse.json({
      inventory: formattedInventory,
      stats: { totalSKUs, lowStock, outOfStock },
      pagination: { page, limit, total: totalSKUs, totalPages: Math.ceil(totalSKUs / limit) }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { product_id, branch_id, quantity, low_stock_threshold } = body

    if (!product_id || !branch_id || quantity === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await adminDb
      .from('inventory')
      .insert({
        product_id,
        branch_id,
        quantity,
        reserved_qty: 0,
        low_stock_threshold: low_stock_threshold || 5,
        allow_backorder: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ inventory: data, message: 'Inventory created' }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create inventory' }, { status: 500 })
  }
}