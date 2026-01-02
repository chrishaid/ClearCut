/**
 * Import passages.json and items.json into Supabase.
 *
 * Usage:
 *   npx tsx scripts/importBank.ts
 *
 * Required env vars (loaded from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import dotenv from 'dotenv'
import fs from 'node:fs'

// Load .env.local
dotenv.config({ path: '.env.local' })
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

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

const bankDir = path.join(process.cwd(), 'content', 'hsat_full_item_bank')

interface RawPassage {
  id: string
  genre: string
  title: string | null
  text: string
  lexile_band: string | null
  created_at: string
}

interface RawItem {
  id: string
  subject: 'math' | 'reading'
  topic: string
  subtopic: string | null
  difficulty: number
  cognitive_level: number
  source_style: 'iowa_like' | 'terranova_like'
  stem: string
  choices: string[] | null
  answer_key: string
  rationale: string
  tags: string[]
  status: string
  passage_id: string | null
  created_at: string
}

// Determine week_phase based on topic
function getWeekPhase(topic: string): 'fundamentals' | 'balanced' | 'applications' {
  const fundamentals = [
    'number_sense',
    'linear_equations',
    'fractions_decimals',
    'vocab_context',
    'main_idea',
  ]

  const applications = [
    'data_probability',
    'word_problems',
    'multi_step',
    'author_craft',
    'compare_contrast',
    'analysis',
  ]

  if (fundamentals.includes(topic)) return 'fundamentals'
  if (applications.includes(topic)) return 'applications'
  return 'balanced'
}

async function chunkedUpsert<T extends Record<string, unknown>>(
  table: string,
  rows: T[],
  chunkSize = 250
): Promise<void> {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await supabase.from(table).upsert(chunk as never[], {
      onConflict: 'id',
      ignoreDuplicates: false
    })
    if (error) {
      console.error(`Error upserting into ${table}:`, error)
      throw error
    }
    console.log(
      `Upserted ${Math.min(i + chunkSize, rows.length)} / ${rows.length} into ${table}`
    )
  }
}

async function main() {
  console.log('Reading passage and item files...')

  const passagesPath = path.join(bankDir, 'passages.json')
  const itemsPath = path.join(bankDir, 'items.json')

  if (!fs.existsSync(passagesPath) || !fs.existsSync(itemsPath)) {
    console.error('passages.json or items.json not found in', bankDir)
    process.exit(1)
  }

  const rawPassages: RawPassage[] = JSON.parse(
    fs.readFileSync(passagesPath, 'utf8')
  )
  const rawItems: RawItem[] = JSON.parse(fs.readFileSync(itemsPath, 'utf8'))

  console.log(`Found ${rawPassages.length} passages and ${rawItems.length} items`)

  // Transform passages to match schema
  const passages = rawPassages.map((p) => ({
    id: p.id,
    genre: p.genre,
    title: p.title,
    text: p.text,
    lexile_band: p.lexile_band,
    word_count: p.text ? p.text.split(/\s+/).length : null,
    created_at: p.created_at || new Date().toISOString(),
  }))

  // Transform items to match schema
  const items = rawItems.map((i) => ({
    id: i.id,
    subject: i.subject,
    topic: i.topic,
    subtopic: i.subtopic,
    difficulty: i.difficulty,
    cognitive_level: i.cognitive_level,
    source_style: i.source_style,
    stem: i.stem,
    choices: i.choices, // Keep as JSON array
    answer_key: i.answer_key,
    rationale: i.rationale,
    tags: i.tags || [],
    status: i.status || 'active',
    passage_id: i.passage_id,
    week_phase: getWeekPhase(i.topic),
    created_at: i.created_at || new Date().toISOString(),
  }))

  console.log('Upserting passages...')
  await chunkedUpsert('passages', passages)

  console.log('Upserting items...')
  await chunkedUpsert('items', items)

  console.log('Import complete!')

  // Print summary
  const mathItems = items.filter((i) => i.subject === 'math').length
  const readingItems = items.filter((i) => i.subject === 'reading').length
  console.log(`\nSummary:`)
  console.log(`  Passages: ${passages.length}`)
  console.log(`  Math items: ${mathItems}`)
  console.log(`  Reading items: ${readingItems}`)
  console.log(`  Total items: ${items.length}`)
}

main().catch((e) => {
  console.error('Import failed:', e)
  process.exit(1)
})
