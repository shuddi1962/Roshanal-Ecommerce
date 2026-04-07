import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const branchId = searchParams.get('branchId')
    const status = searchParams.get('status')
    const search = searchParams.get('search') || ''

    let query = adminDb
      .from('inventory')
      .select(`
        *,
        products!inner(name, sku),
        branches!inner(name, city)
      `)

    if (branchId && branchId !== 'all') {
      query = query.eq('branch_id', branchId)
    }

    if (status === 'low') {
      query = query.lte('available_qty', adminDb.ref('low_stock_threshold')).gt('available_qty', 0)
    } else if (status === 'out') {
      query = query.eq('available_qty', 0)
    } else if (status === 'overstocked') {
      query = query.gt('available_qty', adminDb.ref('low_stock_threshold').multipliedBy(5))
    }

    if (search) {
      query = query.or(`products.name.ilike.%${search}%,products.sku.ilike.%${search}%`)
    }

    const { data: inventory, error } = await query.order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calculate stats
    const totalSKUs = inventory?.length ?? 0
    const lowStock = inventory?.filter((i: { available_qty: number; low_stock_threshold: number }) => 
      i.available_qty <= i.low_stock_threshold && i.available_qty > 0
    ).length ?? 0
    const outOfStock = inventory?.filter((i: { available_qty: number }) => i.available_qty === 0).length ?? 0
    const reserved = inventory?.reduce((sum: number, i: { reserved_qty: number }) => sum + (i.reserved_qty || 0), 0) ?? 0
    const totalQuantity = inventory?.reduce((sum: number, i: { quantity: number }) => sum + (i.quantity || 0), 0) ?? 0

    // Format inventory items
    const formattedInventory = inventory?.map((item: { 
      id: string
      product_id: string
      products: { name: string; sku: string }
      branch_id: string
      branches: { name: string; city: string }
      quantity: number
      reserved_qty: number
      available_qty: number
      low_stock_threshold: number
      updated_at: string
    }) => {
      const available = item.available_qty ?? (item.quantity - (item.reserved_qty || 0))
      let status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstocked' = 'in_stock'
      if (available <= 0) status = 'out_of_stock'
      else if (available <= item.low_stock_threshold) status = 'low_stock'
      else if (available > item.low_stock_threshold * 5) status = 'overstocked'

      return {
        id: item.id,
        product_id: item.product_id,
        product_name: item.products?.name || 'Unknown',
        sku: item.products?.sku || 'N/A',
        branch_id: item.branch_id,
        branch_name: item.branches?.name || 'Unknown',
        quantity: item.quantity || 0,
        reserved_qty: item.reserved_qty || 0,
        available_qty: available,
        low_stock_threshold: item.low_stock_threshold || 10,
        status,
        last_updated: item.updated_at,
      }
    }) ?? []

    // Get branch totals for chart
    const branchTotals = formattedInventory.reduce((acc: Record<string, { name: string; quantity: number }>, item) => {
      if (!acc[item.branch_id]) {
        acc[item.branch_id] = { name: item.branch_name, quantity: 0 }
      }
      acc[item.branch_id].quantity += item.quantity
      return acc
    }, {})

    return NextResponse.json({
      inventory: formattedInventory,
      stats: {
        totalSKUs,
        lowStock,
        outOfStock,
        reserved,
        totalQuantity,
      },
      inventoryByBranch: Object.values(branchTotals),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { inventoryId, change, reason, notes, staffId } = body

    if (!inventoryId || typeof change !== 'number' || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current inventory
    const { data: current, error: fetchError } = await adminDb
      .from('inventory')
      .select('quantity, reserved_qty')
      .eq('id', inventoryId)
      .single()

    if (fetchError || !current) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    const newQuantity = (current.quantity || 0) + change
    if (newQuantity < 0) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 })
    }

    const availableQty = newQuantity - (current.reserved_qty || 0)

    // Update inventory
    const { error: updateError } = await adminDb
      .from('inventory')
      .update({
        quantity: newQuantity,
        available_qty: availableQty,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventoryId)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log adjustment
    await adminDb.from('inventory_adjustments').insert({
      inventory_id: inventoryId,
      change,
      reason,
      notes: notes || null,
      staff_id: staffId || null,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, newQuantity, availableQty })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
