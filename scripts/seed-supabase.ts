/**
 * Seed Supabase with schema-correct demo data.
 * Run: npx tsx --env-file=.env.local scripts/seed-supabase.ts
 */
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? ''
const KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.INSFORGE_SERVICE_KEY ??
  ''

const db = createClient(URL, KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function upsertUser(
  email: string,
  password: string,
  name: string,
  role: string,
  phone: string
) {
  const password_hash = await bcrypt.hash(password, 12)
  const { data, error } = await db
    .from('users')
    .upsert(
      [{ email, password_hash, name, phone, role, is_active: true }],
      { onConflict: 'email' }
    )
    .select()
    .single()
  if (error) {
    console.log(`user ${email}: ${error.message}`)
    return null
  }
  console.log(`user OK: ${email} (${role})`)
  return data
}

async function main() {
  console.log('Seeding Supabase...')

  const admin = await upsertUser(
    'admin@roshanalglobal.com',
    'admin123',
    'Super Admin',
    'super_admin',
    '+2348000000001'
  )
  await upsertUser(
    'manager@roshanalglobal.com',
    'manager123',
    'Store Manager',
    'store_manager',
    '+2348000000002'
  )
  await upsertUser(
    'accountant@roshanalglobal.com',
    'accountant123',
    'Accountant',
    'accountant',
    '+2348000000003'
  )
  const vendorUser = await upsertUser(
    'vendor@roshanalglobal.com',
    'vendor123',
    'Test Vendor',
    'vendor',
    '+2348000000004'
  )
  await upsertUser(
    'customer@test.com',
    'customer123',
    'Test Customer',
    'customer',
    '+2348000000005'
  )

  if (vendorUser) {
    const { error } = await db.from('vendors').upsert(
      [
        {
          user_id: vendorUser.id,
          shop_name: 'Test Vendor Shop',
          shop_slug: 'test-vendor-shop',
          shop_description: 'Demo vendor storefront',
          is_approved: true,
        },
      ],
      { onConflict: 'shop_slug' }
    )
    console.log(error ? `vendor: ${error.message}` : 'vendor OK: Test Vendor Shop')
  }

  const categories = [
    { name: 'CCTV & Surveillance', slug: 'cctv-surveillance', emoji_icon: '📹', description: 'Security cameras and surveillance systems' },
    { name: 'Fire Alarm Systems', slug: 'fire-alarm', emoji_icon: '🔥', description: 'Fire detection and alarm systems' },
    { name: 'Access Control', slug: 'access-control', emoji_icon: '🔐', description: 'Door access and entry systems' },
    { name: 'Solar & Power', slug: 'solar-systems', emoji_icon: '☀️', description: 'Solar panels and inverters' },
    { name: 'Boat Engines', slug: 'boat-engines', emoji_icon: '🚤', description: 'Yamaha, Honda, Mercury, Suzuki, Volvo marine engines' },
    { name: 'Kitchen Equipment', slug: 'kitchen-equipment', emoji_icon: '🍳', description: 'Commercial and domestic kitchen installations' },
    { name: 'Networking & ICT', slug: 'networking-ict', emoji_icon: '🌐', description: 'Networking gear and ICT equipment' },
    { name: 'Marine Accessories', slug: 'marine-accessories', emoji_icon: '⚓', description: 'Marine safety, navigation and accessories' },
  ]
  for (const [i, cat] of categories.entries()) {
    const { error } = await db
      .from('categories')
      .upsert([{ ...cat, is_active: true, sort_order: i }], {
        onConflict: 'slug',
      })
    console.log(error ? `category ${cat.slug}: ${error.message}` : `category OK: ${cat.name}`)
  }

  for (const b of [
    { name: 'Port Harcourt Main', slug: 'port-harcourt-main', city: 'Port Harcourt', state: 'Rivers', address: '14 Aba Road, Port Harcourt', is_active: true },
    { name: 'Lagos Office', slug: 'lagos-office', city: 'Lagos', state: 'Lagos', address: 'Victoria Island, Lagos', is_active: true },
  ]) {
    const { error } = await db.from('branches').upsert([b], { onConflict: 'slug' })
    console.log(error ? `branch ${b.name}: ${error.message}` : `branch OK: ${b.name}`)
  }

  const flags = [
    { key: 'multivendor', name: 'Multivendor Marketplace', description: 'Vendor marketplace (invisible when OFF)', module: 'Marketplace', enabled: false },
    { key: 'ai_chat', name: 'AI Chat Agents', description: 'AI support chat', module: 'AI', enabled: false },
    { key: 'voice_agent', name: 'Voice Agent', description: 'Vapi.ai voice support', module: 'AI', enabled: false },
    { key: 'pos', name: 'POS System', description: 'Point of sale', module: 'Sales', enabled: true },
    { key: 'crm', name: 'CRM Engine', description: 'CRM and acquisition', module: 'Sales', enabled: true },
  ]
  for (const f of flags) {
    const { error } = await db.from('feature_flags').upsert([f], { onConflict: 'key' })
    console.log(error ? `flag ${f.key}: ${error.message}` : `flag OK: ${f.key}`)
  }

  console.log('\nSeed complete.')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
