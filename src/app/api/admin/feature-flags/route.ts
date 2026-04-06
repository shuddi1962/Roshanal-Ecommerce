import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getAllFeatureFlags, setFeatureFlag, DEFAULT_FEATURE_FLAGS } from '@/lib/feature-flags'
import { adminDb } from '@/lib/db'
import type { FeatureFlagKey } from '@/lib/feature-flags'

export async function GET(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Seed defaults if not seeded
  const flags = await getAllFeatureFlags()

  if (flags.length === 0) {
    // Seed defaults
    for (const flag of DEFAULT_FEATURE_FLAGS) {
      await adminDb.from('feature_flags').upsert({
        key: flag.key,
        name: flag.name,
        description: flag.description,
        module: flag.module,
        enabled: flag.enabled,
        updated_at: new Date().toISOString(),
      })
    }
    return NextResponse.json({ flags: DEFAULT_FEATURE_FLAGS })
  }

  return NextResponse.json({ flags })
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const adminRoles = ['super_admin', 'store_manager']
  if (!adminRoles.includes(session.user.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
  }

  const body = (await request.json()) as { key: FeatureFlagKey; enabled: boolean }

  await setFeatureFlag(body.key, body.enabled, session.user.id)

  return NextResponse.json({ ok: true })
}
