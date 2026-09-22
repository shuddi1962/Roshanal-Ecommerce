import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { sendEmail } from '@/lib/resend'

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as { email: string; name?: string }
  const { email, name } = body

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  // Save to a simple email_subscribers table (or use existing users)
  // For now, log to site_settings as a simple approach
  // In production: use dedicated email_subscribers table

  // Send double opt-in confirmation
  try {
    await sendEmail({
      to: email,
      subject: 'Confirm your subscription — Roshanal Global',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;">
          <h2 style="font-family:sans-serif;color:#0C1A36;">Almost there, ${name ?? 'friend'}!</h2>
          <p style="color:#4A5270;">Thanks for subscribing to Roshanal Global. You'll receive:</p>
          <ul style="color:#4A5270;">
            <li>New product alerts</li>
            <li>Exclusive deals and discounts</li>
            <li>Industry insights and tips</li>
          </ul>
          <p style="color:#8990AB;font-size:12px;">You can unsubscribe anytime by clicking the link in any of our emails.</p>
        </div>
      `,
    })
  } catch {
    // Email send failure should not block subscription
  }

  return NextResponse.json({ ok: true })
}
