import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { generateId, toSlug } from '@/lib/utils'
import { nanoid } from 'nanoid'

interface RegisterBody {
  name: string
  email: string
  phone?: string
  password: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as RegisterBody
  const { name, email, phone, password } = body

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  const normalizedEmail = email.toLowerCase().trim()

  // Check if email already exists
  const { data: existing } = await adminDb
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
  }

  const passwordHash = await hashPassword(password)

  const { data: user, error } = await adminDb
    .from('users')
    .insert({
      email: normalizedEmail,
      name: name.trim(),
      phone: phone?.trim() ?? null,
      role: 'customer',
      password_hash: passwordHash,
      wallet_balance_kobo: 0,
      loyalty_points: 0,
      loyalty_tier: 'bronze',
      language: 'en',
      currency_preference: 'NGN',
    })
    .select('id, email, name')
    .single()

  if (error || !user) {
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }

  // Create affiliate code for new customer (optional — feature flagged)
  await adminDb.from('affiliates').insert({
    user_id: user.id,
    code: nanoid(8).toUpperCase(),
    commission_rate: 5,
    is_active: false, // requires enrollment
  }).select('id')

  return NextResponse.json({ ok: true, userId: user.id })
}
