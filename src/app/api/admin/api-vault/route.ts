import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { encrypt, decrypt } from '@/lib/encryption'

export async function GET(): Promise<NextResponse> {
  const { data } = await adminDb
    .from('api_vault')
    .select('id, service, key_name, allowed_staff_ids, is_active, last_tested, updated_at')
    .order('service', { ascending: true })

  return NextResponse.json({ entries: data ?? [] })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { service, keyName, value, allowedStaffIds } = body

    if (!service || !keyName || !value) {
      return NextResponse.json({ error: 'service, keyName, and value are required' }, { status: 400 })
    }

    const encrypted = encrypt(value)

    await adminDb.from('api_vault').upsert({
      service, key_name: keyName, encrypted_value: encrypted,
      allowed_staff_ids: allowedStaffIds ?? [], is_active: true,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await adminDb.from('api_vault').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
