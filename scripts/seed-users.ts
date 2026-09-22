/**
 * Seed demo users using the API
 */

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
];

async function seedUsers() {
  console.log('Seeding demo users...');

  for (const user of demoUsers) {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ Created ${user.role}: ${user.email}`);
      } else {
        console.log(`❌ Failed ${user.role}: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ Error creating ${user.role}: ${error}`);
    }
  }

  console.log('\n📋 Demo Accounts:');
  console.log('─'.repeat(50));
  demoUsers.forEach(user => {
    console.log(`${user.role.padEnd(12)}: ${user.email.padEnd(30)} / ${user.password}`);
  });
}

// Run if called directly
if (require.main === module) {
  seedUsers().catch(console.error);
}

export { seedUsers };