const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

function loadEnv(file) {
  const text = fs.readFileSync(file, 'utf8')
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i === -1) continue
    const k = t.slice(0, i).trim()
    const v = t.slice(i + 1).trim()
    if (!(k in process.env)) process.env[k] = v
  }
}
loadEnv(path.join(__dirname, '..', '.env.local'))

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
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
  console.log('Connected to Supabase Postgres, applying schema.sql...')
  try {
    await client.query(sql)
    console.log('Schema applied successfully.')
  } catch (e) {
    console.error('Schema apply error:', e.message)
    process.exit(1)
  } finally {
    await client.end()
  }
}
main()
