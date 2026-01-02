/**
 * Run the initial schema migration against the remote Supabase database
 * Uses the service role key to execute SQL via the REST API
 */

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function main() {
  // Read the migration file
  const migrationPath = path.join(
    process.cwd(),
    'supabase',
    'migrations',
    '001_initial_schema.sql'
  )

  const sql = fs.readFileSync(migrationPath, 'utf8')

  console.log('Running migration...')
  console.log('SQL length:', sql.length, 'characters')

  // Execute via rpc call to a helper function or try direct execution
  // Since we can't run raw SQL directly, we'll need to use the database connection
  // through the Supabase Data API - but that doesn't support DDL.

  // For now, output instructions for the user
  console.log('\n===========================================')
  console.log('The schema migration needs to be run manually.')
  console.log('Please copy the SQL from:')
  console.log('  supabase/migrations/001_initial_schema.sql')
  console.log('\nAnd run it in the Supabase SQL Editor at:')
  console.log(`  ${SUPABASE_URL.replace('.supabase.co', '.supabase.com')}/project/yqwilqhnhivgmobetlhq/sql`)
  console.log('===========================================\n')

  // Try to check if tables exist
  const { data, error } = await supabase
    .from('passages')
    .select('id')
    .limit(1)

  if (error?.code === 'PGRST205') {
    console.log('❌ Tables do not exist yet. Please run the migration first.')
  } else if (error) {
    console.log('Error checking tables:', error.message)
  } else {
    console.log('✅ Tables already exist!')
  }
}

main().catch(console.error)
