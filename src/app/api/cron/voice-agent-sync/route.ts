import { NextRequest, NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { adminDb } from '@/lib/db'

// Called every midnight: syncs product/policy data to AI agent RAG knowledge base
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const enabled = await isFeatureEnabled('ai_voice_agent')
  if (!enabled) {
    return NextResponse.json({ skipped: true })
  }

  // Fetch all active products for RAG sync
  const { data: products } = await adminDb
    .from('products')
    .select('id, name, slug, short_description, regular_price_kobo, sale_price_kobo, tags, specifications')
    .eq('is_active', true)
    .eq('is_draft', false)
    .limit(500)

  // Fetch site settings (policies)
  const { data: settings } = await adminDb
    .from('site_settings')
    .select('key, value')
    .in('key', ['return_policy', 'shipping_policy', 'warranty_policy', 'contact_info'])

  // In production: upload this data to Vapi.ai knowledge base via their API
  // For now: store in a RAG_sync table
  const syncPayload = {
    products: (products ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      price: `₦${((p.sale_price_kobo ?? p.regular_price_kobo) / 100).toLocaleString()}`,
      description: p.short_description,
      tags: p.tags,
    })),
    policies: settings ?? [],
    syncedAt: new Date().toISOString(),
  }

  await adminDb.from('site_settings').upsert({
    key: 'rag_last_sync',
    value: JSON.stringify(syncPayload),
    type: 'json',
    group: 'ai',
  })

  return NextResponse.json({
    ok: true,
    productsCount: products?.length ?? 0,
    syncedAt: new Date().toISOString(),
  })
}
