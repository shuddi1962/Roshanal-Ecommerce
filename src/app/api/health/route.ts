import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(): Promise<NextResponse> {
  const start = Date.now()

  let dbStatus = 'ok'
  try {
    await db.from('site_settings').select('id').limit(1)
  } catch {
    dbStatus = 'error'
  }

  return NextResponse.json({
    status: dbStatus === 'ok' ? 'healthy' : 'degraded',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    responseTime: `${Date.now() - start}ms`,
    services: {
      database: dbStatus,
    },
  })
}
