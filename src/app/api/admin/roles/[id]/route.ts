import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

interface CustomRole {
  id: string
  name: string
  description?: string
  color: string
  dashboard_redirect?: string
  permissions: Record<string, boolean>
  is_system: boolean
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const roles = await adminDb.query<CustomRole>(
      'SELECT * FROM custom_roles WHERE id = ?',
      [id]
    )

    if (!roles.length) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    const role = roles[0]
    return NextResponse.json({
      role: {
        ...role,
        permissions: typeof role.permissions === 'string'
          ? JSON.parse(role.permissions)
          : role.permissions,
      },
    })
  } catch (error) {
    console.error('Failed to fetch role:', error)
    return NextResponse.json(
      { error: 'Failed to fetch role' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const {
      name,
      description,
      color,
      dashboard_redirect,
      permissions,
    } = body

    const roles = await adminDb.query<CustomRole>(
      'SELECT * FROM custom_roles WHERE id = ?',
      [id]
    )

    if (!roles.length) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    const role = roles[0]

    if (role.is_system) {
      return NextResponse.json(
        { error: 'Cannot modify system roles' },
        { status: 403 }
      )
    }

    const updates: string[] = []
    const values: (string | null)[] = []

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      values.push(description)
    }
    if (color !== undefined) {
      updates.push('color = ?')
      values.push(color)
    }
    if (dashboard_redirect !== undefined) {
      updates.push('dashboard_redirect = ?')
      values.push(dashboard_redirect)
    }
    if (permissions !== undefined) {
      updates.push('permissions = ?')
      values.push(JSON.stringify(permissions))
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    updates.push("updated_at = datetime('now')")
    values.push(id)

    await adminDb.query(
      `UPDATE custom_roles SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    return NextResponse.json({ message: 'Role updated successfully' })
  } catch (error) {
    console.error('Failed to update role:', error)
    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const roles = await adminDb.query<CustomRole>(
      'SELECT * FROM custom_roles WHERE id = ?',
      [id]
    )

    if (!roles.length) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    const role = roles[0]

    if (role.is_system) {
      return NextResponse.json(
        { error: 'Cannot delete system roles' },
        { status: 403 }
      )
    }

    await adminDb.query('DELETE FROM custom_roles WHERE id = ?', [id])

    return NextResponse.json({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Failed to delete role:', error)
    return NextResponse.json(
      { error: 'Failed to delete role' },
      { status: 500 }
    )
  }
}
