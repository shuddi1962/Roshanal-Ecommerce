import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(): Promise<NextResponse> {
  const { data, error } = await adminDb
    .from('users')
    .select('id, name, email, phone, role, loyalty_tier, loyalty_points, wallet_balance_kobo, created_at')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ customers: data ?? [] })
}
