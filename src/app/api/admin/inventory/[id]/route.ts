import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params

    const { data, error } = await adminDb
      .from('inventory')
      .select(`
        *,
        products(name, sku, description),
        branches(name, city)
      `)
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    return NextResponse.json({
      inventory: {
        ...data,
        product_name: data.products?.name,
        sku: data.products?.sku,
        branch_name: data.branches?.name,
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch inventory item' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params
    const body = await request.json()
    const { quantity, reserved_qty, low_stock_threshold } = body

    const updates: Record<string, number | string> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof quantity === 'number') updates.quantity = quantity
    if (typeof reserved_qty === 'number') updates.reserved_qty = reserved_qty
    if (typeof low_stock_threshold === 'number') updates.low_stock_threshold = low_stock_threshold

    // Calculate available quantity
    const currentQty = typeof quantity === 'number' ? quantity : undefined
    const currentReserved = typeof reserved_qty === 'number' ? reserved_qty : undefined

    if (currentQty !== undefined || currentReserved !== undefined) {
      const { data: current } = await adminDb
        .from('inventory')
        .select('quantity, reserved_qty')
        .eq('id', id)
        .single()

      if (current) {
        const qty = currentQty ?? current.quantity ?? 0
        const res = currentReserved ?? current.reserved_qty ?? 0
        updates.available_qty = Math.max(0, qty - res)
      }
    }

    const { data, error } = await adminDb
      .from('inventory')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ inventory: data })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
