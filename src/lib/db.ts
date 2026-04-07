/**
 * Insforge.dev Database Client
 * DO NOT add any other backend client here.
 * Insforge.dev is the ONLY backend for this project.
 *
 * Note: Until official @insforge/client is published, we use
 * the Supabase-compatible JS client. Types are asserted at
 * the query level using the typed helpers below.
 */

import { createClient } from '@supabase/supabase-js'

if (!process.env.INSFORGE_URL) {
  throw new Error('INSFORGE_URL environment variable is required')
}
if (!process.env.INSFORGE_ANON_KEY) {
  throw new Error('INSFORGE_ANON_KEY environment variable is required')
}

export const db = createClient<any>(
  process.env.INSFORGE_URL,
  process.env.INSFORGE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  }
)

export const adminDb = createClient<any>(
  process.env.INSFORGE_URL,
  process.env.INSFORGE_SERVICE_KEY ?? process.env.INSFORGE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export function createUserDb(accessToken: string) {
  return createClient<any>(
    process.env.INSFORGE_URL!,
    process.env.INSFORGE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
