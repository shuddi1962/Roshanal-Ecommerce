import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'
import { resend } from '@/lib/resend'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  preview_text?: string
  from_name: string
  from_email: string
  template: 'welcome' | 'abandoned_cart' | 'reorder_reminder' | 'new_product' | 'seasonal_sale'
  audience: 'all_customers' | 'active_30d' | 'cart_abandoners' | 'VIP' | 'newsletter_only'
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  scheduled_at?: string
  sent_at?: string
  recipients_count: number
  open_rate?: number
  click_rate?: number
  created_at: string
  updated_at: string
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = (page - 1) * limit

    let query = 'SELECT * FROM email_campaigns'
    const params: (string | number)[] = []

    if (status) {
      query += ' WHERE status = ?'
      params.push(status)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    const campaigns = await adminDb.query<EmailCampaign>(query, params)

    const countQuery = status
      ? 'SELECT COUNT(*) as total FROM email_campaigns WHERE status = ?'
      : 'SELECT COUNT(*) as total FROM email_campaigns'
    const countParams = status ? [status] : []
    const countResult = await adminDb.query<{ total: number }>(countQuery, countParams)
    const total = countResult[0]?.total || 0

    return NextResponse.json({
      campaigns,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch email campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch email campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      subject,
      preview_text,
      from_name,
      from_email,
      template,
      audience,
      scheduled_at,
      status = 'draft',
    } = body

    if (!name || !subject || !from_name || !from_email || !template || !audience) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await adminDb.query<{ id: string }>(
      `INSERT INTO email_campaigns 
       (name, subject, preview_text, from_name, from_email, template, audience, scheduled_at, status, recipients_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
       RETURNING id`,
      [name, subject, preview_text || null, from_name, from_email, template, audience, scheduled_at || null, status]
    )

    const campaignId = result[0]?.id

    if (status === 'sending' && campaignId) {
      await triggerCampaignSend(campaignId)
    }

    return NextResponse.json({
      id: campaignId,
      message: 'Campaign created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Failed to create email campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create email campaign' },
      { status: 500 }
    )
  }
}

async function triggerCampaignSend(campaignId: string) {
  try {
    const campaigns = await adminDb.query<EmailCampaign>(
      'SELECT * FROM email_campaigns WHERE id = ?',
      [campaignId]
    )

    if (!campaigns.length) {
      throw new Error('Campaign not found')
    }

    const campaign = campaigns[0]

    let audienceQuery = 'SELECT email FROM customers WHERE subscribed = 1'

    switch (campaign.audience) {
      case 'active_30d':
        audienceQuery += " AND last_active_at >= date('now', '-30 days')"
        break
      case 'cart_abandoners':
        audienceQuery += " AND cart_abandoned_at >= date('now', '-7 days')"
        break
      case 'VIP':
        audienceQuery += " AND tier = 'VIP'"
        break
      case 'newsletter_only':
        audienceQuery += " AND newsletter_only = 1"
        break
    }

    const recipients = await adminDb.query<{ email: string }>(audienceQuery)

    if (!recipients.length) {
      await adminDb.query(
        "UPDATE email_campaigns SET status = 'sent', sent_at = datetime('now'), recipients_count = 0 WHERE id = ?",
        [campaignId]
      )
      return
    }

    const emailPromises = recipients.map(async (recipient) => {
      try {
        await resend.emails.send({
          from: `${campaign.from_name} <${campaign.from_email}>`,
          to: recipient.email,
          subject: campaign.subject,
          html: renderEmailTemplate(campaign.template, campaign.preview_text),
        })
        return { success: true }
      } catch {
        return { success: false }
      }
    })

    const results = await Promise.allSettled(emailPromises)
    const successful = results.filter((r) => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length

    await adminDb.query(
      "UPDATE email_campaigns SET status = 'sent', sent_at = datetime('now'), recipients_count = ? WHERE id = ?",
      [successful, campaignId]
    )
  } catch (error) {
    console.error('Failed to send campaign:', error)
    await adminDb.query(
      "UPDATE email_campaigns SET status = 'paused' WHERE id = ?",
      [campaignId]
    )
  }
}

function renderEmailTemplate(
  template: string,
  previewText?: string
): string {
  const templates: Record<string, string> = {
    welcome: `<html><body style="font-family: Manrope, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-family: Syne, sans-serif; color: #0C1A36;">Welcome!</h1>
      <p style="color: #1E2540;">${previewText || 'Thanks for joining us.'}</p>
    </body></html>`,
    abandoned_cart: `<html><body style="font-family: Manrope, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-family: Syne, sans-serif; color: #0C1A36;">You left something behind</h1>
      <p style="color: #1E2540;">${previewText || 'Complete your purchase today.'}</p>
    </body></html>`,
    reorder_reminder: `<html><body style="font-family: Manrope, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-family: Syne, sans-serif; color: #0C1A36;">Time to reorder?</h1>
      <p style="color: #1E2540;">${previewText || 'Your favorites are waiting.'}</p>
    </body></html>`,
    new_product: `<html><body style="font-family: Manrope, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-family: Syne, sans-serif; color: #0C1A36;">New Arrivals</h1>
      <p style="color: #1E2540;">${previewText || 'Check out what is new.'}</p>
    </body></html>`,
    seasonal_sale: `<html><body style="font-family: Manrope, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-family: Syne, sans-serif; color: #0C1A36;">Sale Alert!</h1>
      <p style="color: #1E2540;">${previewText || 'Limited time offers inside.'}</p>
    </body></html>`,
  }

  return templates[template] || templates.welcome
}
