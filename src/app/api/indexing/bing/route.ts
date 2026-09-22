import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { submitToBing } from '@/lib/indexing'
import { isFeatureEnabled } from '@/lib/feature-flags'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const enabled = await isFeatureEnabled('bing_auto_indexing')
  if (!enabled) return NextResponse.json({ skipped: true, reason: 'Bing auto-indexing is disabled' })

  const body = (await request.json()) as { url: string }

  if (!body.url) return NextResponse.json({ error: 'url required' }, { status: 400 })

  const result = await submitToBing(body.url)
  return NextResponse.json(result)
}
