import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { isFeatureEnabled } from '@/lib/feature-flags'
import type { FeatureFlagKey } from '@/lib/feature-flags'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key') as FeatureFlagKey | null

  if (key) {
    const enabled = await isFeatureEnabled(key)
    return NextResponse.json({ key, enabled })
  }

  return NextResponse.json({ error: 'key query parameter required' }, { status: 400 })
}
