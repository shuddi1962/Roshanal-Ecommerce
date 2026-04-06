import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { adminDb } from '@/lib/db'
import { hasMinRole } from '@/lib/auth'
import { emit } from '@/lib/event-bus'
import { submitToAllIndexers } from '@/lib/indexing'
import { isFeatureEnabled } from '@/lib/feature-flags'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasMinRole(session.user.role, 'content_editor')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') ?? '1')
  const count = Math.min(parseInt(searchParams.get('count') ?? '25'), 100)
  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? 'all'
  const offset = (page - 1) * count

  let query = adminDb
    .from('products')
    .select(`
      id, name, slug, sku, type, regular_price_kobo, sale_price_kobo,
      is_active, is_draft, is_featured, images, created_at,
      categories:category_id(name),
      brands:brand_id(name)
    `, { count: 'exact' })

  if (search) query = query.ilike('name', `%${search}%`)
  if (status === 'active') query = query.eq('is_active', true).eq('is_draft', false)
  if (status === 'draft') query = query.eq('is_draft', true)
  if (status === 'inactive') query = query.eq('is_active', false)

  query = query.order('created_at', { ascending: false }).range(offset, offset + count - 1)

  const { data: products, count: total, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ products: products ?? [], total: total ?? 0 })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasMinRole(session.user.role, 'technical_team')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = (await request.json()) as Record<string, unknown>

  const { data: product, error } = await adminDb
    .from('products')
    .insert({ ...body, created_by: session.user.id, is_draft: true })
    .select('id, slug')
    .single()

  if (error || !product) return NextResponse.json({ error: error?.message ?? 'Failed to create product' }, { status: 500 })

  // Auto-index if publishing
  if (!body.is_draft) {
    const googleEnabled = await isFeatureEnabled('google_auto_indexing')
    const bingEnabled = await isFeatureEnabled('bing_auto_indexing')
    if (googleEnabled || bingEnabled) {
      const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://roshanalglobal.com'}/products/${product.slug}`
      void submitToAllIndexers(url)
    }
    emit('indexing:url-published', { url: `/products/${product.slug}` })
  }

  return NextResponse.json({ product })
}
