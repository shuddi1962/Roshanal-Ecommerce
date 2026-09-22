/**
 * Supabase Database Client (migrated from Insforge.dev)
 * Insforge was Supabase-compatible, so @supabase/supabase-js works as-is.
 * Reads SUPABASE_* first, falls back to legacy INSFORGE_* for backward compat.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.SUPABASE_URL ??
  process.env.INSFORGE_URL

const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_ANON_KEY ??
  process.env.INSFORGE_ANON_KEY

const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.INSFORGE_SERVICE_KEY ??
  SUPABASE_ANON_KEY

if (!SUPABASE_URL) {
  throw new Error(
    'Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL (or legacy INSFORGE_URL).'
  )
}
if (!SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase anon key. Set NEXT_PUBLIC_SUPABASE_ANON_KEY (or legacy INSFORGE_ANON_KEY).'
  )
}

export const db = createClient<any>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
})

export const adminDb = createClient<any>(SUPABASE_URL, SUPABASE_SERVICE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export function createUserDb(accessToken: string) {
  return createClient<any>(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}