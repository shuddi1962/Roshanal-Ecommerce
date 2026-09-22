import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await adminDb
      .from('custom_roles')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    return NextResponse.json({
      role: {
        ...data,
        permissions: typeof data.permissions === 'string'
          ? JSON.parse(data.permissions)
          : data.permissions,
      },
    })
  } catch (error) {
    console.error('Failed to fetch role:', error)
    return NextResponse.json({ error: 'Failed to fetch role' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data: existing } = await adminDb
      .from('custom_roles')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    if (existing.is_system) {
      return NextResponse.json({ error: 'Cannot modify system roles' }, { status: 403 })
    }

    const updateData: Record<string, any> = {}
    const fields = ['name', 'description', 'color', 'dashboard_redirect', 'permissions']

    for (const field of fields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    const { data, error } = await adminDb
      .from('custom_roles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ role: data, message: 'Role updated successfully' })
  } catch (error) {
    console.error('Failed to update role:', error)
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: existing } = await adminDb
      .from('custom_roles')
      .select('*')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Role not found' }, { status: 404 })
    }

    if (existing.is_system) {
      return NextResponse.json({ error: 'Cannot delete system roles' }, { status: 403 })
    }

    const { error } = await adminDb
      .from('custom_roles')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Failed to delete role:', error)
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}