import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { submitToGoogle, batchSubmitSitemap } from '@/lib/indexing'
import { isFeatureEnabled } from '@/lib/feature-flags'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const enabled = await isFeatureEnabled('google_auto_indexing')
  if (!enabled) return NextResponse.json({ skipped: true, reason: 'Google auto-indexing is disabled' })

  const body = (await request.json()) as { url?: string; urls?: string[] }

  if (body.url) {
    const result = await submitToGoogle(body.url)
    return NextResponse.json(result)
  }

  if (body.urls?.length) {
    await batchSubmitSitemap(body.urls)
    return NextResponse.json({ ok: true, count: body.urls.length })
  }

  return NextResponse.json({ error: 'url or urls required' }, { status: 400 })
}
