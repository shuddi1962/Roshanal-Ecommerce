import { createClient } from '@supabase/supabase-js'

// Legacy Insforge endpoint (decommissioned 2026-09-22).
// Source backend returned "No backend services available" — data migrated
// to Supabase. Use scripts/test-supabase.ts instead.
const supabaseUrl = process.env.INSFORGE_URL ?? ''
const supabaseKey = process.env.INSFORGE_ANON_KEY ?? ''

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing INSFORGE_URL or INSFORGE_ANON_KEY')
  process.exit(1)
}

const db = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔌 Testing Insforge connection...\n')
  console.log(`URL: ${supabaseUrl}`)
  
  try {
    const { data, error } = await db.from('feature_flags').select('*').limit(1)
    
    if (error) {
      console.error('❌ Connection failed:', error.message)
      console.log('\nNote: Tables may not exist yet.')
      console.log('Run the schema.sql in Insforge SQL editor to create tables.')
    } else {
      console.log('✅ Connected successfully!')
      console.log('📋 Feature flags table accessible:', data)
    }
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

testConnection()
