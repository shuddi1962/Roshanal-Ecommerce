import { NextRequest, NextResponse } from 'next/server'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { getApiKey } from '@/lib/api-vault'
import Anthropic from '@anthropic-ai/sdk'
import { adminDb } from '@/lib/db'

interface ChatMessage { role: 'user' | 'assistant'; content: string }

interface RequestBody {
  message: string
  sessionId: string
  personaId: string
  history?: ChatMessage[]
  userId?: string
}

const PERSONA_PROFILES = {
  sarah: {
    name: 'Sarah Adeyemi',
    personality: 'warm, professional, knowledgeable about security systems and marine products',
    style: 'Warm but professional. Use "I" not "we". Keep responses concise and helpful.',
  },
  kemi: {
    name: 'Kemi Okafor',
    personality: 'enthusiastic, friendly, great at recommendations',
    style: 'Friendly and upbeat. Use simple language. Great at suggesting products.',
  },
  tunde: {
    name: 'Tunde Nwachukwu',
    personality: 'technical, precise, expert in technical products',
    style: 'Technical and precise. Great at explaining specifications and compatibility.',
  },
  fatima: {
    name: 'Fatima Aliyu',
    personality: 'patient, thorough, excellent customer service skills',
    style: 'Patient and thorough. Takes time to understand customer needs.',
  },
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Check feature flag
  const enabled = await isFeatureEnabled('ai_support_chat')
  if (!enabled) {
    return NextResponse.json({ reply: 'Shopping assistant is currently unavailable. Call +234 800 ROSHANAL for help.' })
  }

  const body = (await request.json()) as RequestBody
  const { message, sessionId, personaId, history = [], userId } = body

  if (!message?.trim()) {
    return NextResponse.json({ reply: 'I didn\'t catch that. Could you please repeat?' })
  }

  const persona = PERSONA_PROFILES[personaId as keyof typeof PERSONA_PROFILES] ?? PERSONA_PROFILES.sarah

  const apiKey = await getApiKey('anthropic', 'api_key')
  if (!apiKey) {
    return NextResponse.json({ reply: 'I\'m having a technical hiccup right now. Please call +234 800 ROSHANAL for immediate help.' })
  }

  const client = new Anthropic({ apiKey })

  const systemPrompt = `You are ${persona.name}, a shopping assistant at Roshanal Global (Roshanal Infotech Limited), a Nigerian company in Port Harcourt that sells security systems, marine accessories, boat engines, solar products, kitchen equipment, and networking/ICT solutions.

Personality: ${persona.personality}
Communication style: ${persona.style}

Critical rules:
- NEVER admit to being an AI, robot, or chatbot. You are a human shopping assistant.
- NEVER mention the names Anthropic, Claude, GPT, or any AI company.
- If asked if you're an AI, deflect naturally: "I'm Sarah, your shopping assistant! Now, how can I help you find the right product?"
- Only discuss Roshanal's products and services.
- For prices, always mention they're in Nigerian Naira unless the customer says otherwise.
- You can: recommend products, check order status (tell them you'll check and follow up), book service appointments, answer product questions.
- Company info: 14 Aba Road, Port Harcourt. Phone: +234 800 ROSHANAL. Mon-Sat 8AM-6PM WAT.
- Keep responses under 3 sentences unless the customer asks for details.`

  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ]

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: systemPrompt,
      messages,
    })

    const block = response.content[0]
    const reply = block.type === 'text' ? block.text : "I'm unable to respond right now."

    // Save conversation to DB
    await adminDb.from('support_conversations').upsert({
      id: sessionId,
      user_id: userId ?? null,
      agent_persona_id: personaId,
      status: 'active',
      messages: [...history, { role: 'user', content: message }, { role: 'assistant', content: reply }],
      admin_monitoring: false,
    })

    return NextResponse.json({ reply })
  } catch {
    return NextResponse.json({ reply: 'I\'m having trouble right now. Please call +234 800 ROSHANAL for immediate assistance.' })
  }
}
