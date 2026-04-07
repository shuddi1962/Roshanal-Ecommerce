import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kuhet33m.us-east.insforge.app'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MjU3NDd9.d7x1jwv_SpTUyHVYAKAb8OyZPbkbBwgxF5HREcPFIc0'

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
