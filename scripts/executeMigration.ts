/**
 * Execute the initial schema migration via Supabase's pg_execute function
 * This requires the pgcrypto extension to be enabled
 */

import fs from 'node:fs'
import path from 'node:path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

async function main() {
  const migrationPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '001_initial_schema.sql'
  )

  const sql = fs.readFileSync(migrationPath, 'utf8')

  console.log('Attempting to run migration via REST API...')
  console.log('SQL length:', sql.length, 'characters')

  // Try to execute via the postgres endpoint
  // Supabase hosted instances have a /rest/v1/ endpoint but it doesn't support DDL

  // Let's try the internal pg-meta endpoint if accessible
  const projectRef = 'yqwilqhnhivgmobetlhq'

  // Try running a simple query first to check if service role has SQL access
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        query: 'SELECT 1'
      })
    })

    const data = await response.text()
    console.log('RPC response:', response.status, data.substring(0, 200))
  } catch (error) {
    console.error('RPC error:', error)
  }

  console.log('\n==================================================')
  console.log('The database tables need to be created manually.')
  console.log('')
  console.log('Please go to the Supabase SQL Editor:')
  console.log(`  https://supabase.com/dashboard/project/${projectRef}/sql/new`)
  console.log('')
  console.log('And paste the contents of:')
  console.log('  supabase/migrations/001_initial_schema.sql')
  console.log('==================================================\n')
}

main().catch(console.error)
