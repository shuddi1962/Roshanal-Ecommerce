/**
 * Check and create demo users if they don't exist
 */

import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

async function checkAndCreateUsers() {
  console.log('Checking demo users...')

  const demoUsers = [
    {
      email: 'admin@roshanalglobal.com',
      password: 'admin123',
      name: 'Super Admin',
      role: 'super_admin'
    },
    {
      email: 'manager@roshanalglobal.com',
      password: 'manager123',
      name: 'Store Manager',
      role: 'store_manager'
    },
    {
      email: 'accountant@roshanalglobal.com',
      password: 'accountant123',
      name: 'Accountant',
      role: 'accountant'
    },
    {
      email: 'vendor@roshanalglobal.com',
      password: 'vendor123',
      name: 'Test Vendor',
      role: 'vendor'
    },
    {
      email: 'customer@test.com',
      password: 'customer123',
      name: 'Test Customer',
      role: 'customer'
    }
  ]

  for (const user of demoUsers) {
    try {
      // Check if user exists
      const { data: existing } = await db
        .from('users')
        .select('id')
        .eq('email', user.email)
        .single()

      if (existing) {
        console.log(`✅ ${user.role}: ${user.email} already exists`)
        continue
      }

      // Create user if doesn't exist
      const passwordHash = await hashPassword(user.password)

      const { data, error } = await db
        .from('users')
        .insert({
          email: user.email,
          name: user.name,
          role: user.role,
          password_hash: passwordHash,
          email_verified: true,
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.log(`❌ Failed to create ${user.role}: ${error.message}`)
      } else {
        console.log(`✅ Created ${user.role}: ${user.email}`)
      }
    } catch (error) {
      console.log(`❌ Error with ${user.role}: ${error}`)
    }
  }

  console.log('\n📋 Demo Accounts Ready:')
  demoUsers.forEach(user => {
    console.log(`${user.role.padEnd(12)}: ${user.email.padEnd(30)} / ${user.password}`)
  })
}

// Run if called directly
if (require.main === module) {
  checkAndCreateUsers().catch(console.error)
}

export { checkAndCreateUsers }