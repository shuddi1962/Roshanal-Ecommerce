/**
 * Initialize database schema and create demo users
 */

import { createClient } from '@supabase/supabase-js'
import bcryptjs from 'bcryptjs'

const SUPABASE_URL = process.env.INSFORGE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.INSFORGE_SERVICE_KEY || process.env.INSFORGE_ANON_KEY || ''

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function initializeDatabase() {
  console.log('Initializing database...')

  // Create users table if it doesn't exist
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'customer',
      password_hash TEXT,
      avatar_url TEXT,
      wallet_balance_kobo BIGINT NOT NULL DEFAULT 0,
      loyalty_points INTEGER NOT NULL DEFAULT 0,
      loyalty_tier TEXT NOT NULL DEFAULT 'bronze',
      birthday DATE,
      language TEXT NOT NULL DEFAULT 'en',
      currency_preference TEXT NOT NULL DEFAULT 'NGN',
      detected_country TEXT,
      two_factor_enabled BOOLEAN DEFAULT FALSE,
      is_active BOOLEAN DEFAULT TRUE,
      email_verified BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `

  try {
    const { error: tableError } = await db.rpc('exec_sql', { sql: createUsersTable })
    if (tableError) {
      console.log('Table creation note:', tableError.message)
    } else {
      console.log('✅ Users table ready')
    }
  } catch (err) {
    console.log('Table creation failed, continuing...')
  }

  // Demo users to create
  const demoUsers = [
    {
      email: 'admin@roshanalglobal.com',
      password: 'admin123',
      name: 'Super Admin',
      phone: '+2348000000001',
      role: 'super_admin'
    },
    {
      email: 'manager@roshanalglobal.com',
      password: 'manager123',
      name: 'Store Manager',
      phone: '+2348000000002',
      role: 'store_manager'
    },
    {
      email: 'accountant@roshanalglobal.com',
      password: 'accountant123',
      name: 'Accountant',
      phone: '+2348000000003',
      role: 'accountant'
    },
    {
      email: 'vendor@roshanalglobal.com',
      password: 'vendor123',
      name: 'Test Vendor',
      phone: '+2348000000004',
      role: 'vendor'
    },
    {
      email: 'customer@test.com',
      password: 'customer123',
      name: 'Test Customer',
      phone: '+2348000000005',
      role: 'customer'
    }
  ]

  console.log('Creating demo users...')

  for (const user of demoUsers) {
    try {
      // Hash password
      const passwordHash = await bcryptjs.hash(user.password, 12)

      // Try to upsert user
      const { data, error } = await db
        .from('users')
        .upsert({
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          password_hash: passwordHash,
          email_verified: true,
          is_active: true,
        }, {
          onConflict: 'email'
        })
        .select()

      if (error) {
        console.log(`❌ Failed to create ${user.role}: ${error.message}`)
      } else {
        console.log(`✅ Created/Updated ${user.role}: ${user.email}`)
      }
    } catch (error) {
      console.log(`❌ Error with ${user.role}: ${error}`)
    }
  }

  console.log('\n📋 Demo Accounts:')
  console.log('─'.repeat(50))
  demoUsers.forEach(user => {
    console.log(`${user.role.padEnd(12)}: ${user.email.padEnd(30)} / ${user.password}`)
  })

  console.log('\n🎯 Redirect URLs:')
  const redirects = {
    'super_admin': '/admin/dashboard',
    'store_manager': '/admin/dashboard',
    'accountant': '/admin/finance',
    'vendor': '/vendor/dashboard',
    'customer': '/account/dashboard'
  }

  demoUsers.forEach(user => {
    console.log(`${user.role.padEnd(12)} → https://roshanalglobal.vercel.app${redirects[user.role as keyof typeof redirects]}`)
  })
}

// Run if called directly
if (require.main === module) {
  initializeDatabase().catch(console.error)
}

export { initializeDatabase }