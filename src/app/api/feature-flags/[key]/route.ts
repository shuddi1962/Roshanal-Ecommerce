import { NextRequest, NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/feature-flags'
import type { FeatureFlagKey } from '@/lib/feature-flags'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
): Promise<NextResponse> {
  const { key } = await params
  const enabled = await isFeatureEnabled(key as FeatureFlagKey)
  return NextResponse.json({ key, enabled }, {
    headers: { 'Cache-Control': 'private, max-age=60' },
  })
}
