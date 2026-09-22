import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

export async function GET(): Promise<NextResponse> {
  // Get latest site doctor logs and compute health score
  const { data: logs } = await adminDb
    .from('site_doctor_logs')
    .select('check_type, status, issue_found, ran_at')
    .order('ran_at', { ascending: false })
    .limit(20)

  if (!logs?.length) {
    return NextResponse.json({ score: 100, checks: [], lastRun: null })
  }

  // Get most recent run per check type
  const latest = new Map<string, { check_type: string; status: string; issue_found: string | null; ran_at: string }>()
  for (const log of logs) {
    if (!latest.has(log.check_type)) latest.set(log.check_type, log as { check_type: string; status: string; issue_found: string | null; ran_at: string })
  }

  const checks = Array.from(latest.values())
  const errorCount = checks.filter((c) => c.status === 'error').length
  const warningCount = checks.filter((c) => c.status === 'warning').length
  const score = Math.max(0, 100 - errorCount * 15 - warningCount * 5)

  return NextResponse.json({ score, checks, lastRun: checks[0]?.ran_at ?? null })
}
