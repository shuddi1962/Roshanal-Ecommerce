/**
 * Anthropic Claude AI Wrapper
 * - Claude API key retrieved from API Vault (never hardcoded)
 * - Used for: product descriptions, blog posts, SEO, social posts, boat visuals
 * - All generated content saved as DRAFT — admin approves before publishing
 * - Never label as "AI" in customer-facing output
 */

import Anthropic from '@anthropic-ai/sdk'
import { getApiKey } from '@/lib/api-vault'

let _client: Anthropic | null = null

async function getClient(): Promise<Anthropic> {
  if (_client) return _client

  const apiKey = await getApiKey('anthropic', 'api_key')
  if (!apiKey) throw new Error('Anthropic API key not configured in API Vault')

  _client = new Anthropic({ apiKey })
  return _client
}

export interface AIGenerateOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

const DEFAULT_MODEL = 'claude-opus-4-5'
const DEFAULT_MAX_TOKENS = 4096

/**
 * Generate text content using Claude.
 * All content should be saved as DRAFT — caller is responsible.
 */
export async function generateText(
  prompt: string,
  options: AIGenerateOptions = {}
): Promise<string> {
  const client = await getClient()

  const response = await client.messages.create({
    model: options.model ?? DEFAULT_MODEL,
    max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    system: options.systemPrompt ?? 'You are a helpful assistant for Roshanal Global, a premium e-commerce company in Nigeria.',
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected AI response type')
  return block.text
}

/**
 * Generate a rich HTML product description.
 * Returns DRAFT-ready HTML — admin must approve before publishing.
 */
export async function generateProductDescription(product: {
  name: string
  category: string
  brand?: string
  specifications?: Record<string, string>
  keywords?: string[]
}): Promise<{ descriptionHtml: string; shortDescription: string; seoTitle: string; seoDescription: string }> {
  const client = await getClient()

  const systemPrompt = `You are an expert e-commerce copywriter for Roshanal Global, a premium Nigerian tech/marine/security products company.
Write rich, detailed HTML product descriptions that:
- Use <h3>, <p>, <ul>, <strong>, <em> tags appropriately
- Lead with a compelling product overview
- Include key features in a bulleted list
- Mention use cases specific to Nigerian/African market when relevant
- End with a call to action
- NEVER use placeholder text
- NEVER use generic filler phrases like "high quality" or "premium product" without specifics`

  const prompt = `Create a complete product content package for:
Product: ${product.name}
Category: ${product.category}
Brand: ${product.brand ?? 'Unknown'}
Specifications: ${JSON.stringify(product.specifications ?? {})}
Keywords: ${(product.keywords ?? []).join(', ')}

Return a JSON object with these exact keys:
{
  "descriptionHtml": "full rich HTML description (300-600 words)",
  "shortDescription": "single compelling paragraph (max 150 chars)",
  "seoTitle": "SEO optimized title (max 60 chars)",
  "seoDescription": "meta description (max 160 chars)"
}`

  const response = await client.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 2000,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const block = response.content[0]
  if (block.type !== 'text') throw new Error('Unexpected AI response type')

  try {
    const jsonMatch = block.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    return JSON.parse(jsonMatch[0]) as {
      descriptionHtml: string
      shortDescription: string
      seoTitle: string
      seoDescription: string
    }
  } catch {
    return {
      descriptionHtml: `<p>${block.text}</p>`,
      shortDescription: product.name,
      seoTitle: product.name.substring(0, 60),
      seoDescription: product.name.substring(0, 160),
    }
  }
}

/**
 * Generate a blog post (research-driven).
 * Returns DRAFT — admin approves before publishing.
 */
export async function generateBlogPost(topic: {
  title: string
  keywords: string[]
  targetAudience: string
  researchContext?: string
}): Promise<{ title: string; contentHtml: string; excerpt: string; seoTitle: string; seoDescription: string }> {
  const prompt = `Write a comprehensive, SEO-optimized blog post for Roshanal Global's website.

Title: ${topic.title}
Target Audience: ${topic.targetAudience}
Keywords to include naturally: ${topic.keywords.join(', ')}
${topic.researchContext ? `Research context:\n${topic.researchContext}` : ''}

Requirements:
- 800-1200 words
- Rich HTML with h2, h3, p, ul, ol, strong, blockquote tags
- Practical, Nigeria/Africa-relevant content
- Natural keyword integration (not stuffed)
- Engaging introduction, actionable body, clear conclusion
- Return as JSON: { "title", "contentHtml", "excerpt" (150 chars), "seoTitle" (60 chars), "seoDescription" (160 chars) }`

  const text = await generateText(prompt, { maxTokens: 3000 })
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    return JSON.parse(jsonMatch[0]) as {
      title: string; contentHtml: string; excerpt: string; seoTitle: string; seoDescription: string
    }
  } catch {
    return {
      title: topic.title,
      contentHtml: `<p>${text}</p>`,
      excerpt: text.substring(0, 150),
      seoTitle: topic.title.substring(0, 60),
      seoDescription: text.substring(0, 160),
    }
  }
}

/**
 * Generate a social media post for a product/campaign.
 * Returns DRAFT — admin approves before scheduling.
 */
export async function generateSocialPost(params: {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'tiktok'
  productName?: string
  campaignMessage?: string
  tone?: 'professional' | 'casual' | 'energetic'
}): Promise<{ caption: string; hashtags: string[] }> {
  const limits: Record<string, number> = {
    twitter: 280, instagram: 2200, facebook: 500, linkedin: 700, tiktok: 300,
  }

  const prompt = `Write a social media post for Roshanal Global's ${params.platform} account.
${params.productName ? `Product: ${params.productName}` : ''}
${params.campaignMessage ? `Campaign: ${params.campaignMessage}` : ''}
Tone: ${params.tone ?? 'professional'}
Max characters: ${limits[params.platform]}
Return JSON: { "caption": "post text", "hashtags": ["array", "of", "hashtags"] }`

  const text = await generateText(prompt, { maxTokens: 500 })
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON')
    return JSON.parse(jsonMatch[0]) as { caption: string; hashtags: string[] }
  } catch {
    return { caption: text.substring(0, limits[params.platform] ?? 280), hashtags: [] }
  }
}
