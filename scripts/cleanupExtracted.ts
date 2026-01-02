/**
 * Clean up extracted passages and items from state assessment PDFs.
 *
 * Usage:
 *   npx tsx scripts/cleanupExtracted.ts
 *
 * This script:
 * 1. Removes noise (page markers, session text, instructions) from passages
 * 2. Cleans question stems
 * 3. Extracts answer keys from raw text files
 * 4. Removes malformed items
 * 5. Outputs cleaned JSON files
 */

import fs from 'node:fs'
import path from 'node:path'

const EXTRACTED_DIR = path.join(process.cwd(), 'content', 'extracted_items')
const RAW_TEXT_DIR = path.join(EXTRACTED_DIR, 'raw_text')
const OUTPUT_DIR = path.join(process.cwd(), 'content', 'cleaned_items')

interface Passage {
  id: string
  genre: 'informational' | 'literary' | 'poetry' | 'drama'
  title: string | null
  text: string
  lexile_band: string | null
  word_count: number | null
  source: string
  created_at: string
}

interface Item {
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
  source: string
  created_at: string
}

/**
 * Extract answer keys from all raw text files
 */
function extractAllAnswerKeys(): Map<string, Map<number, string>> {
  const answerKeysByFile = new Map<string, Map<number, string>>()

  if (!fs.existsSync(RAW_TEXT_DIR)) {
    return answerKeysByFile
  }

  const files = fs.readdirSync(RAW_TEXT_DIR)

  for (const file of files) {
    if (!file.endsWith('.txt')) continue

    const text = fs.readFileSync(path.join(RAW_TEXT_DIR, file), 'utf8')
    const pdfName = file.replace('.txt', '.pdf')
    const answerKeys = new Map<number, string>()

    // Look for answer key patterns
    // Pattern 1: "Question Type Key Points Standard" table format
    // Pattern 2: Simple "1 A", "2 B" format
    // Pattern 3: "Question 1: A" format

    // NY State format: "15 MC A 1 NGLS..."
    const nyPattern = /(\d+)\s+(?:MC|CR|Multiple\s*Choice)?\s*([A-D])\s+\d+\s+(?:NGLS|NY|8\.)/gi
    let match
    while ((match = nyPattern.exec(text)) !== null) {
      answerKeys.set(parseInt(match[1]), match[2].toUpperCase())
    }

    // Simple format: just number and letter on same line
    if (answerKeys.size === 0) {
      const simplePattern = /^(\d{1,2})\s+([A-D])\s*$/gm
      while ((match = simplePattern.exec(text)) !== null) {
        answerKeys.set(parseInt(match[1]), match[2].toUpperCase())
      }
    }

    // Answer key section format
    const keySection = text.match(/(?:Answer\s*Key|Scoring\s*Key|Key\s*and\s*Alignment)[\s\S]{0,5000}/i)
    if (keySection) {
      const sectionPattern = /(\d{1,2})\s+(?:[A-Za-z\s]+)?\s*([A-D])\b/g
      while ((match = sectionPattern.exec(keySection[0])) !== null) {
        const qNum = parseInt(match[1])
        if (qNum > 0 && qNum < 100) {
          answerKeys.set(qNum, match[2].toUpperCase())
        }
      }
    }

    if (answerKeys.size > 0) {
      answerKeysByFile.set(pdfName, answerKeys)
    }
  }

  return answerKeysByFile
}

/**
 * Clean passage text
 */
function cleanPassageText(text: string): string {
  let cleaned = text

  // Remove common noise patterns
  const noisePatterns = [
    // Page markers
    /Page\s*\d+\s*(Session\s*\d+)?/gi,
    /Session\s*\d+/gi,
    /GO\s*ON/gi,
    /STOP/gi,

    // Instructions
    /Read\s+(?:this|the)\s+(?:passage|text|story|poem|article)[^\n]*(?:carefully)?\.?\s*/gi,
    /Then\s+answer\s+(?:the\s+)?questions[^\n]*\.?\s*/gi,
    /Most\s+questions\s+will\s+make\s+sense[^\n]+\n/gi,
    /You\s+may\s+read\s+the\s+passage[^\n]+\n/gi,
    /When\s+a\s+question\s+includes[^\n]+\n/gi,
    /Read\s+each\s+question\s+carefully[^\n]+\n/gi,
    /In\s+writing\s+your\s+responses[^\n]+\n/gi,
    /carefully\.\s*•/gi,
    /•\s*[^\n]+/g, // Bullet points (instructions)

    // Test artifacts
    /\d{4}\s*Grade\s*\d+\s*(?:ELA|Math|English)/gi,
    /New\s+York\s+State\s+Testing\s+Program/gi,
    /Released\s+(?:Questions|Items)/gi,

    // Headers/footers
    /Copyright\s*©[^\n]+/gi,
    /\bGrade\s*\d+\b(?!\s+(?:student|level|reading))/gi,
  ]

  for (const pattern of noisePatterns) {
    cleaned = cleaned.replace(pattern, ' ')
  }

  // Clean up whitespace
  cleaned = cleaned
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/^\s+/gm, '')
    .trim()

  return cleaned
}

/**
 * Clean question stem
 */
function cleanStem(stem: string): string {
  let cleaned = stem

  // Remove page/session markers
  cleaned = cleaned
    .replace(/Page\s*\d+\s*/gi, '')
    .replace(/Session\s*\d+\s*/gi, '')
    .replace(/GO\s*ON\s*/gi, '')
    .replace(/STOP\s*/gi, '')
    .replace(/^\s*\d+\s*/, '') // Remove leading question number if present

  // Clean up whitespace
  cleaned = cleaned
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return cleaned
}

/**
 * Validate an item is well-formed
 */
function isValidItem(item: Item): boolean {
  // Must have a stem with actual question content
  if (!item.stem || item.stem.length < 15) return false

  // Stem should contain a question or instruction
  const hasQuestionIndicator = /\?|which|what|how|why|according|based|select|choose|identify|determine|explain/i.test(item.stem)
  if (!hasQuestionIndicator) return false

  // Must have 4 choices
  if (!item.choices || item.choices.length !== 4) return false

  // Choices should have content
  for (const choice of item.choices) {
    if (!choice || choice.length < 3) return false
    // Choice should start with A., B., C., or D.
    if (!/^[A-D]\.\s*.+/.test(choice)) return false
  }

  // Filter out items that are just formulas or fragments
  const formulaPatterns = [
    /^[A-Z]\s*=\s*[πr\d]+/i, // Formula patterns
    /^General\s+Prisms/i,
    /^Circle$/i,
    /^Volume$/i,
    /^Area$/i,
  ]

  for (const pattern of formulaPatterns) {
    if (pattern.test(item.stem)) return false
  }

  return true
}

/**
 * Get question number from stem or context
 */
function extractQuestionNumber(stem: string): number | null {
  // Look for question number at start
  const match = stem.match(/^(?:Page\s*\d+\s*)?(?:Session\s*\d+\s*)?(?:GO\s*ON\s*)?(\d{1,2})\s+/i)
  if (match) {
    return parseInt(match[1])
  }
  return null
}

/**
 * Clean up passages
 */
function cleanPassages(passages: Passage[]): Passage[] {
  const cleaned: Passage[] = []

  for (const passage of passages) {
    const cleanedText = cleanPassageText(passage.text)

    // Skip if too short after cleaning
    if (cleanedText.length < 200) continue

    // Skip if still contains too much instructional content
    if (cleanedText.includes('Multiple-Choice Questions') ||
        cleanedText.includes('Constructed-Response') ||
        cleanedText.includes('text complexity')) continue

    cleaned.push({
      ...passage,
      text: cleanedText,
      word_count: cleanedText.split(/\s+/).length
    })
  }

  return cleaned
}

/**
 * Clean up items
 */
function cleanItems(items: Item[], answerKeysByFile: Map<string, Map<number, string>>): Item[] {
  const cleaned: Item[] = []

  for (const item of items) {
    // Clean the stem
    const originalStem = item.stem
    const cleanedStem = cleanStem(item.stem)

    // Try to extract question number for answer key lookup
    const qNum = extractQuestionNumber(originalStem)

    // Look up answer key
    let answerKey = item.answer_key
    if (qNum) {
      const pdfName = path.basename(item.source)
      const fileKeys = answerKeysByFile.get(pdfName)
      if (fileKeys && fileKeys.has(qNum)) {
        answerKey = fileKeys.get(qNum)!
      }
    }

    // Clean choices
    const cleanedChoices = item.choices?.map(choice => {
      return choice
        .replace(/\s+/g, ' ')
        .trim()
    })

    const cleanedItem: Item = {
      ...item,
      stem: cleanedStem,
      choices: cleanedChoices || null,
      answer_key: answerKey,
      status: answerKey !== 'A' || item.status === 'active' ? 'active' : 'needs_review'
    }

    // Validate
    if (isValidItem(cleanedItem)) {
      cleaned.push(cleanedItem)
    }
  }

  return cleaned
}

/**
 * Extract passage titles and Lexile from raw text
 */
function extractPassageMetadata(rawTextDir: string): Map<string, { title: string; lexile: string }[]> {
  const metadata = new Map<string, { title: string; lexile: string }[]>()

  if (!fs.existsSync(rawTextDir)) return metadata

  const files = fs.readdirSync(rawTextDir)

  for (const file of files) {
    if (!file.endsWith('.txt')) continue

    const text = fs.readFileSync(path.join(rawTextDir, file), 'utf8')

    // Look for text complexity table
    const passages: { title: string; lexile: string }[] = []

    // Pattern: "Excerpt from Title 794 980" or "Title 718 1050"
    const tablePattern = /(?:Excerpt\s+from\s+)?([A-Z][A-Za-z\s',\-:]+?)\s+(\d{3,4})\s+(\d{3,4})\s+[\d.]+\s+[\d.]+\s+Appropriate/g
    let match
    while ((match = tablePattern.exec(text)) !== null) {
      passages.push({
        title: match[1].trim(),
        lexile: `${match[3]}L`
      })
    }

    if (passages.length > 0) {
      metadata.set(file.replace('.txt', '.pdf'), passages)
    }
  }

  return metadata
}

/**
 * Update passages with metadata
 */
function enrichPassages(passages: Passage[], metadata: Map<string, { title: string; lexile: string }[]>): Passage[] {
  return passages.map(passage => {
    const pdfName = path.basename(passage.source)
    const fileMeta = metadata.get(pdfName)

    if (fileMeta && !passage.title && !passage.lexile_band) {
      // Try to match passage to metadata by finding title in text
      for (const meta of fileMeta) {
        if (passage.text.toLowerCase().includes(meta.title.toLowerCase().substring(0, 20))) {
          return {
            ...passage,
            title: meta.title,
            lexile_band: meta.lexile
          }
        }
      }
    }

    return passage
  })
}

/**
 * Main function
 */
async function main() {
  console.log('Starting cleanup of extracted content...\n')

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Load extracted data
  const passagesPath = path.join(EXTRACTED_DIR, 'passages.json')
  const itemsPath = path.join(EXTRACTED_DIR, 'items.json')

  if (!fs.existsSync(passagesPath) || !fs.existsSync(itemsPath)) {
    console.error('Extracted files not found. Run extractPDFs.ts first.')
    process.exit(1)
  }

  const passages: Passage[] = JSON.parse(fs.readFileSync(passagesPath, 'utf8'))
  const items: Item[] = JSON.parse(fs.readFileSync(itemsPath, 'utf8'))

  console.log(`Loaded ${passages.length} passages and ${items.length} items`)

  // Extract answer keys from raw text
  console.log('\nExtracting answer keys from raw text files...')
  const answerKeysByFile = extractAllAnswerKeys()
  console.log(`Found answer keys in ${answerKeysByFile.size} files`)

  // Extract passage metadata
  console.log('\nExtracting passage metadata...')
  const passageMetadata = extractPassageMetadata(RAW_TEXT_DIR)
  console.log(`Found metadata in ${passageMetadata.size} files`)

  // Clean passages
  console.log('\nCleaning passages...')
  let cleanedPassages = cleanPassages(passages)
  cleanedPassages = enrichPassages(cleanedPassages, passageMetadata)
  console.log(`Cleaned: ${cleanedPassages.length} passages (removed ${passages.length - cleanedPassages.length})`)

  // Clean items
  console.log('\nCleaning items...')
  const cleanedItems = cleanItems(items, answerKeysByFile)
  console.log(`Cleaned: ${cleanedItems.length} items (removed ${items.length - cleanedItems.length})`)

  // Update passage IDs in items if passages were removed
  const validPassageIds = new Set(cleanedPassages.map(p => p.id))
  const finalItems = cleanedItems.map(item => {
    if (item.passage_id && !validPassageIds.has(item.passage_id)) {
      return { ...item, passage_id: null }
    }
    return item
  })

  // Write output
  const cleanedPassagesPath = path.join(OUTPUT_DIR, 'passages.json')
  const cleanedItemsPath = path.join(OUTPUT_DIR, 'items.json')

  fs.writeFileSync(cleanedPassagesPath, JSON.stringify(cleanedPassages, null, 2))
  fs.writeFileSync(cleanedItemsPath, JSON.stringify(finalItems, null, 2))

  // Summary
  console.log('\n========================================')
  console.log('Cleanup Complete!')
  console.log('========================================')
  console.log(`Passages: ${passages.length} → ${cleanedPassages.length}`)
  console.log(`Items: ${items.length} → ${finalItems.length}`)
  console.log(`  - Reading: ${finalItems.filter(i => i.subject === 'reading').length}`)
  console.log(`  - Math: ${finalItems.filter(i => i.subject === 'math').length}`)
  console.log(`  - Active (with answer key): ${finalItems.filter(i => i.status === 'active').length}`)
  console.log(`  - Needs review: ${finalItems.filter(i => i.status === 'needs_review').length}`)
  console.log(`\nOutput files:`)
  console.log(`  ${cleanedPassagesPath}`)
  console.log(`  ${cleanedItemsPath}`)
}

main().catch(console.error)
