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
  created_at: string
  updated_at: string
}

export async function GET() {
  try {
    const roles = await adminDb.query<CustomRole>(
      'SELECT * FROM custom_roles ORDER BY created_at DESC'
    )

    return NextResponse.json({ roles })
  } catch (error) {
    console.error('Failed to fetch roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      color,
      dashboard_redirect,
      permissions,
    } = body

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Name and color are required' },
        { status: 400 }
      )
    }

    if (permissions && typeof permissions !== 'object') {
      return NextResponse.json(
        { error: 'Permissions must be an object' },
        { status: 400 }
      )
    }

    const existingRole = await adminDb.query<CustomRole>(
      'SELECT id FROM custom_roles WHERE name = ?',
      [name]
    )

    if (existingRole.length) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 409 }
      )
    }

    const result = await adminDb.query<{ id: string }>(
      `INSERT INTO custom_roles 
       (name, description, color, dashboard_redirect, permissions, is_system, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
       RETURNING id`,
      [
        name,
        description || null,
        color,
        dashboard_redirect || null,
        JSON.stringify(permissions || {}),
      ]
    )

    return NextResponse.json(
      { id: result[0]?.id, message: 'Role created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create role:', error)
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 }
    )
  }
}
