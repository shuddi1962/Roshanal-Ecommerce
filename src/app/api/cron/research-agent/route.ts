import { NextRequest, NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { adminDb } from '@/lib/db'
import { generateText } from '@/lib/ai'

// Called every midnight WAT (00:00 UTC+1 = 23:00 UTC)
export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const enabled = await isFeatureEnabled('ai_daily_research_agent')
  if (!enabled) {
    return NextResponse.json({ skipped: true, reason: 'ai_daily_research_agent feature flag is disabled' })
  }

  const niches = [
    'security systems Nigeria', 'marine accessories Nigeria', 'solar panels Nigeria',
    'boat engines Nigeria', 'dredging equipment Nigeria', 'kitchen installation Nigeria',
    'networking equipment Nigeria', 'safety equipment Nigeria',
  ]

  const researchPrompt = `You are a market research analyst for Roshanal Global (Nigeria). Today's date: ${new Date().toLocaleDateString('en-NG')}.

Research the following niches for the Nigerian/West African market: ${niches.join(', ')}

Provide a JSON report with these keys:
{
  "trending_products": [5 items with {name, category, source_hint, estimated_margin}],
  "competitor_promotions": [3 items with {product, competitor_name, price_hint, promotion_type}],
  "blog_topics": [5 items with {title, keyword, estimated_monthly_searches}],
  "rising_keywords": ["keyword1", "keyword2", ...up to 8],
  "price_alerts": [any notable price changes observed]
}

Be specific and practical. Focus on products Roshanal can realistically source and sell.`

  try {
    const reportText = await generateText(researchPrompt, {
      model: 'claude-haiku-4-5',
      maxTokens: 2000,
      systemPrompt: 'You are a market research assistant. Always return valid JSON.',
    })

    const jsonMatch = reportText.match(/\{[\s\S]*\}/)
    const findings = jsonMatch ? JSON.parse(jsonMatch[0]) as object : { raw: reportText }

    await adminDb.from('research_agent_reports').insert({
      date: new Date().toISOString().split('T')[0],
      findings,
      was_read: false,
    })

    return NextResponse.json({ ok: true, ranAt: new Date().toISOString() })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Research failed' }, { status: 500 })
  }
}
