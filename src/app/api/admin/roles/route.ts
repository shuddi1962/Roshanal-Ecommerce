import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET() {
  try {
    const { data, error } = await adminDb
      .from('custom_roles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ roles: data ?? [] })
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, color, dashboard_redirect, permissions } = body

    if (!name || !color) {
      return NextResponse.json({ error: 'Name and color are required' }, { status: 400 })
    }

    if (permissions && typeof permissions !== 'object') {
      return NextResponse.json({ error: 'Permissions must be an object' }, { status: 400 })
    }

    const { data: existing } = await adminDb
      .from('custom_roles')
      .select('id')
      .eq('name', name)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Role with this name already exists' }, { status: 409 })
    }

    const { data, error } = await adminDb
      .from('custom_roles')
      .insert({
        name,
        description: description || null,
        color,
        dashboard_redirect: dashboard_redirect || null,
        permissions: permissions || {},
        is_system: false,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ id: data.id, role: data, message: 'Role created successfully' }, { status: 201 })
  } catch (error) {
    console.error('Failed to create role:', error)
    return NextResponse.json({ error: 'Failed to create role' }, { status: 500 })
  }
}