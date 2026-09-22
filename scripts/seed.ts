/**
 * Database Seed Script for Roshanal Ecommerce
 * Run with: npx tsx scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const SUPABASE_URL = process.env.INSFORGE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.INSFORGE_SERVICE_KEY || process.env.INSFORGE_ANON_KEY || ''

const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function seed() {
  console.log('Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const { data: admin, error: adminError } = await db
    .from('users')
    .insert({
      email: 'admin@roshanalglobal.com',
      password_hash: adminPassword,
      full_name: 'Admin User',
      phone: '+2348000000001',
      role: 'super_admin',
      is_active: true,
      email_verified: true,
    })
    .select()
    .single()

  if (adminError) {
    console.log('Admin may already exist:', adminError.message)
  } else {
    console.log('Admin created:', admin.email)
  }

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 12)
  const { data: staff, error: staffError } = await db
    .from('staff')
    .insert({
      email: 'staff@roshanalglobal.com',
      password_hash: staffPassword,
      full_name: 'Store Manager',
      phone: '+2348000000002',
      role: 'store_manager',
      is_active: true,
      branch_id: null,
    })
    .select()
    .single()

  if (staffError) {
    console.log('Staff may already exist:', staffError.message)
  } else {
    console.log('Staff created:', staff.email)
  }

  // Create customer
  const customerPassword = await bcrypt.hash('customer123', 12)
  const { data: customer, error: customerError } = await db
    .from('users')
    .insert({
      email: 'customer@test.com',
      password_hash: customerPassword,
      full_name: 'Test Customer',
      phone: '+2348000000003',
      role: 'customer',
      is_active: true,
    })
    .select()
    .single()

  if (customerError) {
    console.log('Customer may already exist:', customerError.message)
  } else {
    console.log('Customer created:', customer.email)
  }

  // Create vendor
  const vendorPassword = await bcrypt.hash('vendor123', 12)
  const { data: vendor, error: vendorError } = await db
    .from('vendors')
    .insert({
      email: 'vendor@roshanalglobal.com',
      password_hash: vendorPassword,
      business_name: 'Test Vendor Shop',
      owner_name: 'Test Vendor',
      phone: '+2348000000004',
      status: 'active',
    })
    .select()
    .single()

  if (vendorError) {
    console.log('Vendor may already exist:', vendorError.message)
  } else {
    console.log('Vendor created:', vendor.email)
  }

  // Create sample categories
  const categories = [
    { name: 'CCTV Cameras', slug: 'cctv-cameras', emoji_icon: '📹', description: 'Security cameras and surveillance systems' },
    { name: 'Fire Alarms', slug: 'fire-alarms', emoji_icon: '🔥', description: 'Fire detection and alarm systems' },
    { name: 'Boat Engines', slug: 'boat-engines', emoji_icon: '🚤', description: 'Marine boat engines and parts' },
    { name: 'Solar Systems', slug: 'solar-systems', emoji_icon: '☀️', description: 'Solar panels and inverters' },
    { name: 'Kitchen Equipment', slug: 'kitchen-equipment', emoji_icon: '🍳', description: 'Commercial kitchen appliances' },
    { name: 'Access Control', slug: 'access-control', emoji_icon: '🔐', description: 'Door access and entry systems' },
  ]

  for (const cat of categories) {
    const { error } = await db.from('categories').upsert([{
      ...cat,
      is_active: true,
      sort_order: categories.indexOf(cat),
    }], { onConflict: 'slug' })
    if (!error) console.log('Category:', cat.name)
  }

  // Create branches
  const branches = [
    { name: 'Port Harcourt Main', city: 'Port Harcourt', address: '14 Aba Road, Port Harcourt', is_active: true },
    { name: 'Lagos Office', city: 'Lagos', address: 'Victoria Island, Lagos', is_active: true },
  ]

  for (const branch of branches) {
    const { error } = await db.from('branches').upsert([branch], { onConflict: 'name' })
    if (!error) console.log('Branch:', branch.name)
  }

  console.log('\n✅ Seed complete!')
  console.log('\n📋 Test Accounts:')
  console.log('─'.repeat(40))
  console.log('Admin:    admin@roshanalglobal.com / admin123')
  console.log('Staff:    staff@roshanalglobal.com / staff123')
  console.log('Customer: customer@test.com / customer123')
  console.log('Vendor:   vendor@roshanalglobal.com / vendor123')
}

seed().catch(console.error)