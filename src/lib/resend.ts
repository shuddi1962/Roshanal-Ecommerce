/**
 * Resend Email Service
 * API key retrieved from API Vault.
 * Used for: order confirmations, booking receipts, campaign emails, notifications.
 */

import { Resend } from 'resend'
import { getApiKey } from '@/lib/api-vault'

let _client: Resend | null = null

async function getClient(): Promise<Resend> {
  if (_client) return _client
  const apiKey = await getApiKey('resend', 'api_key')
  if (!apiKey) throw new Error('Resend API key not configured in API Vault')
  _client = new Resend(apiKey)
  return _client
}

export interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  from?: string
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
}

const FROM_DEFAULT = 'Roshanal Global <noreply@roshanalglobal.com>'

/**
 * Send a transactional email.
 */
export async function sendEmail(params: SendEmailParams): Promise<{ id: string }> {
  const client = await getClient()

  const { data, error } = await client.emails.send({
    from: params.from ?? FROM_DEFAULT,
    to: Array.isArray(params.to) ? params.to : [params.to],
    subject: params.subject,
    html: params.html,
    replyTo: params.replyTo,
    tags: params.tags,
  })

  if (error) throw new Error(`Resend error: ${error.message}`)
  return { id: data!.id }
}

/**
 * Send order confirmation email.
 */
export async function sendOrderConfirmation(params: {
  to: string
  orderNumber: string
  customerName: string
  totalFormatted: string
  items: Array<{ name: string; quantity: number; price: string }>
  deliveryAddress: string
}): Promise<void> {
  const items = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #E8EBF6;">${item.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #E8EBF6;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #E8EBF6;text-align:right;font-family:monospace;">${item.price}</td>
      </tr>`
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F5FB;font-family:sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #E8EBF6;">
    <div style="background:#0C1A36;padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;letter-spacing:1px;">ROSHANAL GLOBAL</h1>
      <p style="color:#8990AB;margin:4px 0 0;">Roshanal Infotech Limited</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#080E22;margin-top:0;">Order Confirmed!</h2>
      <p style="color:#4A5270;">Hello ${params.customerName},</p>
      <p style="color:#4A5270;">Your order <strong style="color:#1641C4;font-family:monospace;">${params.orderNumber}</strong> has been received and is being processed.</p>
      
      <table style="width:100%;border-collapse:collapse;margin:24px 0;">
        <thead>
          <tr style="border-bottom:2px solid #E8EBF6;">
            <th style="padding:8px 0;text-align:left;color:#4A5270;font-size:12px;text-transform:uppercase;">Item</th>
            <th style="padding:8px 0;text-align:center;color:#4A5270;font-size:12px;text-transform:uppercase;">Qty</th>
            <th style="padding:8px 0;text-align:right;color:#4A5270;font-size:12px;text-transform:uppercase;">Price</th>
          </tr>
        </thead>
        <tbody>${items}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:16px 0 0;font-weight:700;color:#080E22;">Total</td>
            <td style="padding:16px 0 0;text-align:right;font-weight:700;color:#C8191C;font-size:18px;font-family:monospace;">${params.totalFormatted}</td>
          </tr>
        </tfoot>
      </table>

      <div style="background:#F3F5FB;border-radius:6px;padding:16px;margin:24px 0;">
        <p style="margin:0;font-size:13px;color:#4A5270;"><strong>Delivery to:</strong><br>${params.deliveryAddress}</p>
      </div>

      <p style="color:#4A5270;font-size:14px;">Track your order at <a href="https://roshanalglobal.com/track-order" style="color:#1641C4;">roshanalglobal.com/track-order</a></p>
    </div>
    <div style="background:#F3F5FB;padding:20px;text-align:center;border-top:1px solid #E8EBF6;">
      <p style="margin:0;font-size:12px;color:#8990AB;">14 Aba Road, Port Harcourt, Rivers State, Nigeria</p>
      <p style="margin:4px 0 0;font-size:12px;color:#8990AB;">Mon–Sat 8AM–6PM WAT | info@roshanalglobal.com | +234 800 ROSHANAL</p>
    </div>
  </div>
</body>
</html>`

  await sendEmail({ to: params.to, subject: `Order Confirmed — ${params.orderNumber} | Roshanal Global`, html })
}

export interface BoatEnquiryEmailParams {
  customerName: string; customerEmail: string; customerPhone: string
  vesselType: string; enquiryType: string; budget?: string
  timeline?: string; notes?: string
}

export async function sendBoatEnquiryEmail(params: BoatEnquiryEmailParams): Promise<void> {
  const html = `
<!DOCTYPE html><html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F3F5FB;font-family:sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #E8EBF6;">
    <div style="background:#0C1A36;padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">ROSHANAL GLOBAL</h1>
      <p style="color:#8990AB;margin:4px 0 0;">Boat Building Enquiry</p>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#080E22;margin-top:0;">New Boat Building Enquiry</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 0;color:#4A5270;font-size:14px;"><strong>Customer:</strong></td><td style="padding:8px 0;color:#080E22;">${params.customerName}</td></tr>
        <tr><td style="padding:8px 0;color:#4A5270;font-size:14px;"><strong>Email:</strong></td><td style="padding:8px 0;"><a href="mailto:${params.customerEmail}" style="color:#1641C4;">${params.customerEmail}</a></td></tr>
        <tr><td style="padding:8px 0;color:#4A5270;font-size:14px;"><strong>Phone:</strong></td><td style="padding:8px 0;color:#080E22;">${params.customerPhone}</td></tr>
        <tr><td style="padding:8px 0;color:#4A5270;font-size:14px;"><strong>Vessel Type:</strong></td><td style="padding:8px 0;color:#080E22;">${params.vesselType}</td></tr>
        <tr><td style="padding:8px 0;color:#4A5270;font-size:14px;"><strong>Action:</strong></td><td style="padding:8px 0;color:#080E22;">${params.enquiryType}</td></tr>
        ${params.budget ? `<tr><td style="padding:8px 0;color:#4A5270;"><strong>Budget:</strong></td><td style="padding:8px 0;color:#080E22;">${params.budget}</td></tr>` : ''}
        ${params.timeline ? `<tr><td style="padding:8px 0;color:#4A5270;"><strong>Timeline:</strong></td><td style="padding:8px 0;color:#080E22;">${params.timeline}</td></tr>` : ''}
        ${params.notes ? `<tr><td style="padding:8px 0;color:#4A5270;vertical-align:top;"><strong>Notes:</strong></td><td style="padding:8px 0;color:#080E22;">${params.notes}</td></tr>` : ''}
      </table>
      <p style="color:#4A5270;font-size:14px;margin-top:24px;">
        Respond to this enquiry within 24 hours.
      </p>
    </div>
    <div style="background:#F3F5FB;padding:20px;text-align:center;border-top:1px solid #E8EBF6;">
      <p style="margin:0;font-size:12px;color:#8990AB;">Roshanal Infotech Limited — 14 Aba Road, Port Harcourt, Nigeria</p>
    </div>
  </div>
</body></html>`

  await sendEmail({
    to: 'boatbuilding@roshanalglobal.com',
    subject: `New Enquiry — ${params.vesselType} from ${params.customerName} | Roshanal Global`,
    html,
    tags: [{ name: 'type', value: 'boat-enquiry' }, { name: 'source', value: 'boat-configurator' }],
  })
}
