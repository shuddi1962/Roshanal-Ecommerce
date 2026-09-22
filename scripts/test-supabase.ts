import { createClient } from '@supabase/supabase-js'

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  process.env.INSFORGE_URL
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.INSFORGE_ANON_KEY

if (!url || !key) {
  console.error('Missing Supabase URL / anon key in env')
  process.exit(1)
}

const db = createClient(url, key)

async function testConnection() {
  console.log('Testing Supabase connection...')
  console.log(`URL: ${url}`)
  try {
    // Lightweight check: list tables via a probe query.
    // feature_flags may not exist yet — that's OK, connection success is what matters.
    const { data, error } = await db.from('feature_flags').select('*').limit(1)
    if (error) {
      console.log(`Reachable, query returned: ${error.message}`)
      console.log('If tables do not exist yet, run scripts/schema.sql in Supabase SQL editor.')
    } else {
      console.log('Connected successfully!')
      console.log('Rows:', data)
    }
  } catch (err) {
    console.error('Connection failed:', err)
    process.exit(1)
  }
}

testConnection()
