import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/db'

interface EmailCampaign {
  id: string
  name: string
  subject: string
  preview_text?: string
  from_name: string
  from_email: string
  template: string
  audience: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  scheduled_at?: string
  sent_at?: string
  recipients_count: number
  open_rate?: number
  click_rate?: number
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const campaigns = await adminDb.query<EmailCampaign>(
      'SELECT * FROM email_campaigns WHERE id = ?',
      [id]
    )

    if (!campaigns.length) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ campaign: campaigns[0] })
  } catch (error) {
    console.error('Failed to fetch campaign:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
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
      subject,
      preview_text,
      from_name,
      from_email,
      template,
      audience,
      scheduled_at,
      status,
    } = body

    const campaigns = await adminDb.query<EmailCampaign>(
      'SELECT * FROM email_campaigns WHERE id = ?',
      [id]
    )

    if (!campaigns.length) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    const updates: string[] = []
    const values: (string | null)[] = []

    if (name !== undefined) {
      updates.push('name = ?')
      values.push(name)
    }
    if (subject !== undefined) {
      updates.push('subject = ?')
      values.push(subject)
    }
    if (preview_text !== undefined) {
      updates.push('preview_text = ?')
      values.push(preview_text)
    }
    if (from_name !== undefined) {
      updates.push('from_name = ?')
      values.push(from_name)
    }
    if (from_email !== undefined) {
      updates.push('from_email = ?')
      values.push(from_email)
    }
    if (template !== undefined) {
      updates.push('template = ?')
      values.push(template)
    }
    if (audience !== undefined) {
      updates.push('audience = ?')
      values.push(audience)
    }
    if (scheduled_at !== undefined) {
      updates.push('scheduled_at = ?')
      values.push(scheduled_at)
    }
    if (status !== undefined) {
      updates.push('status = ?')
      values.push(status)
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
      `UPDATE email_campaigns SET ${updates.join(', ')} WHERE id = ?`,
      values
    )

    if (status === 'sending') {
      await triggerCampaignSend(id)
    }

    return NextResponse.json({
      message: 'Campaign updated successfully',
    })
  } catch (error) {
    console.error('Failed to update campaign:', error)
    return NextResponse.json(
      { error: 'Failed to update campaign' },
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

    if (!campaigns.length) return

    await adminDb.query(
      "UPDATE email_campaigns SET status = 'sent', sent_at = datetime('now') WHERE id = ?",
      [campaignId]
    )
  } catch (error) {
    console.error('Failed to trigger campaign send:', error)
    await adminDb.query(
      "UPDATE email_campaigns SET status = 'paused' WHERE id = ?",
      [campaignId]
    )
  }
}
