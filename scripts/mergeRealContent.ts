/**
 * Merge real extracted passages and items into the item bank,
 * replacing poor-quality synthetic content.
 *
 * Usage:
 *   npx tsx scripts/mergeRealContent.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const CLEANED_DIR = path.join(process.cwd(), 'content', 'cleaned_items')
const ITEM_BANK_DIR = path.join(process.cwd(), 'content', 'hsat_full_item_bank')
const OUTPUT_DIR = path.join(process.cwd(), 'content', 'merged_item_bank')

interface Passage {
  id: string
  genre: string
  title: string | null
  text: string
  lexile_band: string | null
  word_count?: number | null
  source?: string
  grade?: number | null
  state?: string
  created_at: string
}

interface Item {
  id: string
  subject: string
  topic: string
  subtopic: string | null
  difficulty: number
  cognitive_level: number
  source_style: string
  stem: string
  choices: string[] | null
  answer_key: string
  rationale: string
  tags: string[]
  status: string
  passage_id: string | null
  source?: string
  question_number?: number | null
  created_at: string
}

async function main() {
  console.log('Merging real content into item bank...\n')

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Load cleaned (real) content
  const realPassages: Passage[] = JSON.parse(
    fs.readFileSync(path.join(CLEANED_DIR, 'passages.json'), 'utf8')
  )
  const realItems: Item[] = JSON.parse(
    fs.readFileSync(path.join(CLEANED_DIR, 'items.json'), 'utf8')
  )

  console.log(`Loaded ${realPassages.length} real passages`)
  console.log(`Loaded ${realItems.length} real items`)

  // Load existing item bank
  const existingPassages: Passage[] = JSON.parse(
    fs.readFileSync(path.join(ITEM_BANK_DIR, 'passages.json'), 'utf8')
  )
  const existingItems: Item[] = JSON.parse(
    fs.readFileSync(path.join(ITEM_BANK_DIR, 'items.json'), 'utf8')
  )

  console.log(`\nExisting bank: ${existingPassages.length} passages, ${existingItems.length} items`)

  // Identify bad synthetic passages (contain repetitive "The organizer was" patterns)
  const badPassagePattern = /The organizer was \w+ at first.*The organizer was \w+ at first/i
  const badPassageIds = new Set<string>()

  for (const passage of existingPassages) {
    if (badPassagePattern.test(passage.text)) {
      badPassageIds.add(passage.id)
    }
  }

  console.log(`\nIdentified ${badPassageIds.size} poor-quality synthetic passages to remove`)

  // Keep good synthetic passages (if any)
  const goodSyntheticPassages = existingPassages.filter(p => !badPassageIds.has(p.id))

  // Keep items that don't reference bad passages
  // But also keep math items (they don't have passages)
  const goodExistingItems = existingItems.filter(item => {
    // Keep math items
    if (item.subject === 'math') return true
    // Keep reading items without passage reference
    if (!item.passage_id) return true
    // Keep reading items referencing good passages
    return !badPassageIds.has(item.passage_id)
  })

  console.log(`Keeping ${goodSyntheticPassages.length} good synthetic passages`)
  console.log(`Keeping ${goodExistingItems.length} existing items`)

  // Prepare real passages with proper schema
  const formattedRealPassages: Passage[] = realPassages.map(p => ({
    id: p.id,
    genre: p.genre as 'informational' | 'literary' | 'poetry',
    title: p.title,
    text: p.text,
    lexile_band: p.lexile_band,
    created_at: p.created_at
  }))

  // Prepare real items with proper schema
  const formattedRealItems: Item[] = realItems.map(item => ({
    id: item.id,
    subject: item.subject as 'math' | 'reading',
    topic: item.topic,
    subtopic: item.subtopic,
    difficulty: item.difficulty,
    cognitive_level: item.cognitive_level,
    source_style: item.source_style as 'iowa_like' | 'terranova_like',
    stem: item.stem,
    choices: item.choices,
    answer_key: item.answer_key,
    rationale: item.rationale,
    tags: item.tags,
    status: item.status === 'active' ? 'active' : 'needs_review',
    passage_id: item.passage_id,
    created_at: item.created_at
  }))

  // Merge
  const mergedPassages = [...formattedRealPassages, ...goodSyntheticPassages]
  const mergedItems = [...formattedRealItems, ...goodExistingItems]

  // Remove duplicates by ID
  const uniquePassages = Array.from(new Map(mergedPassages.map(p => [p.id, p])).values())
  const uniqueItems = Array.from(new Map(mergedItems.map(i => [i.id, i])).values())

  // Write output
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'passages.json'),
    JSON.stringify(uniquePassages, null, 2)
  )
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'items.json'),
    JSON.stringify(uniqueItems, null, 2)
  )

  // Summary
  console.log('\n========================================')
  console.log('Merge Complete!')
  console.log('========================================')
  console.log(`Total passages: ${uniquePassages.length}`)
  console.log(`  - Real (from state tests): ${formattedRealPassages.length}`)
  console.log(`  - Synthetic (good quality): ${goodSyntheticPassages.length}`)
  console.log(`\nTotal items: ${uniqueItems.length}`)
  console.log(`  - Reading: ${uniqueItems.filter(i => i.subject === 'reading').length}`)
  console.log(`  - Math: ${uniqueItems.filter(i => i.subject === 'math').length}`)

  // Breakdown by source
  const realReadingItems = formattedRealItems.filter(i => i.subject === 'reading').length
  const realMathItems = formattedRealItems.filter(i => i.subject === 'math').length
  console.log(`\nReal items from state tests:`)
  console.log(`  - Reading: ${realReadingItems}`)
  console.log(`  - Math: ${realMathItems}`)

  console.log(`\nOutput saved to: ${OUTPUT_DIR}`)
}

main().catch(console.error)
