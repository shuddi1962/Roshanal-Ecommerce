const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

async function main() {
  const file = process.argv[2] || 'supabase-hardening.sql'
  const sql = fs.readFileSync(path.join(__dirname, file), 'utf8')
  const client = new Client({
    host: process.env.PGHOST || 'aws-1-eu-west-1.pooler.supabase.com',
    port: Number(process.env.PGPORT || 6543),
    user: process.env.PGUSER || 'postgres.lgkuzffuvywlzwrlsgjg',
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE || 'postgres',
    ssl: { rejectUnauthorized: false },
  })
  if (!process.env.PGPASSWORD) {
    console.error('Set PGPASSWORD env (see .env.example / Supabase Dashboard > Settings > Database)')
    process.exit(1)
  }
  await client.connect()
  console.log(`Applying ${file}...`)
  try {
    await client.query(sql)
    console.log('Done.')
  } catch (e) {
    console.error('Error:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}
main()
