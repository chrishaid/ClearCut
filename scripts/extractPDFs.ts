/**
 * Extract passages and items from state assessment PDFs into JSON format.
 *
 * Usage:
 *   npx tsx scripts/extractPDFs.ts
 *
 * This script processes downloaded PDF files from various state assessments
 * and outputs passages.json and items.json files matching the item bank schema.
 */

import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { extractText } from 'unpdf'

// Output paths
const OUTPUT_DIR = path.join(process.cwd(), 'content', 'extracted_items')
const RAW_TEXT_DIR = path.join(OUTPUT_DIR, 'raw_text')
const REAL_PASSAGES_DIR = path.join(process.cwd(), 'content', 'real_passages')

// Types matching the item bank schema
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

interface ExtractionResult {
  passages: Passage[]
  items: Item[]
  errors: string[]
}

// Topic mappings for ELA standards
const ELA_TOPIC_MAP: Record<string, string> = {
  'R.1': 'inference',
  'R.2': 'main_idea',
  'R.3': 'structure_evidence',
  'R.4': 'vocab_context',
  'R.5': 'structure_evidence',
  'R.6': 'author_craft',
  'R.7': 'compare_contrast',
  'R.8': 'structure_evidence',
  'R.9': 'compare_contrast',
  'RI': 'inference',
  'RL': 'inference',
}

// Topic mappings for Math standards
const MATH_TOPIC_MAP: Record<string, string> = {
  'NS': 'number_sense',
  'EE': 'linear_equations',
  'F': 'linear_equations',
  'G': 'geometry',
  'SP': 'data_probability',
  'RP': 'fractions_decimals',
  '8.NS': 'number_sense',
  '8.EE': 'linear_equations',
  '8.F': 'linear_equations',
  '8.G': 'geometry',
  '8.SP': 'data_probability',
  'A1': 'linear_equations',
  'A2': 'linear_equations',
}

/**
 * Extract text from a PDF using unpdf
 */
async function extractPDFText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath)
  const data = new Uint8Array(buffer)
  const result = await extractText(data)

  // Handle cases where text might be an array or undefined
  if (!result.text) {
    return ''
  }
  if (Array.isArray(result.text)) {
    return result.text.join('\n')
  }
  if (typeof result.text !== 'string') {
    return String(result.text)
  }
  return result.text
}

/**
 * Get topic from standard code
 */
function getTopic(standard: string, subject: 'math' | 'reading'): string {
  const topicMap = subject === 'math' ? MATH_TOPIC_MAP : ELA_TOPIC_MAP

  for (const [pattern, topic] of Object.entries(topicMap)) {
    if (standard.includes(pattern)) {
      return topic
    }
  }

  return subject === 'math' ? 'linear_equations' : 'inference'
}

/**
 * Extract answer key from NY State format
 */
function extractNYAnswerKey(text: string): Record<number, { key: string; standard: string }> {
  const answerKeyMap: Record<number, { key: string; standard: string }> = {}

  // Look for answer key section
  const keySection = text.match(/(?:Answer\s*Key|Scoring\s*Key|Map)[\s\S]*?(?=\n\n\n|\z)/i)
  if (!keySection) return answerKeyMap

  // Pattern: Question number, Type (MC/CR), Key (A/B/C/D), Points, Standard
  const lines = keySection[0].split('\n')
  for (const line of lines) {
    // Match patterns like: "15 MC A 1 NGLS.ELA.Content.NY-8.R.1"
    const match = line.match(/(\d+)\s+(?:MC|CR|Multiple\s*Choice)?\s*([A-D])\s+\d+\s+([\w\.\-]+)/i)
    if (match) {
      answerKeyMap[parseInt(match[1])] = {
        key: match[2].toUpperCase(),
        standard: match[3]
      }
    }
  }

  return answerKeyMap
}

/**
 * Extract passage info from text complexity table
 */
function extractPassageInfo(text: string): Array<{ title: string; lexile: string; wordCount?: number }> {
  const passages: Array<{ title: string; lexile: string; wordCount?: number }> = []

  // Look for text complexity table
  // Pattern: Title, Word Count, Lexile, ...
  const tableMatch = text.match(/Passage\s*Title[\s\S]*?(?:Appropriate[\s\n]+){2,}/gi)
  if (!tableMatch) return passages

  for (const table of tableMatch) {
    // Extract rows - look for patterns like "Excerpt from Growing a Farmer 794 980"
    const rowPattern = /(?:Excerpt\s+from\s+)?([A-Z][^0-9\n]{10,}?)\s+(\d{2,4})\s+(\d{3,4})/g
    let match
    while ((match = rowPattern.exec(table)) !== null) {
      passages.push({
        title: match[1].trim(),
        wordCount: parseInt(match[2]),
        lexile: `${match[3]}L`
      })
    }
  }

  return passages
}

/**
 * Parse NY State ELA format
 */
function parseNYStateELA(text: string, source: string): ExtractionResult {
  const passages: Passage[] = []
  const items: Item[] = []
  const errors: string[] = []

  // Get answer key
  const answerKeyMap = extractNYAnswerKey(text)

  // Get passage info from text complexity table
  const passageInfo = extractPassageInfo(text)

  // Find "Directions:" sections which precede passages
  const directionSections = text.split(/Directions:?\s*/i)

  for (let i = 1; i < directionSections.length; i++) {
    const section = directionSections[i]

    // Skip if too short
    if (section.length < 500) continue

    // Try to find where questions start (numbered questions)
    const questionStart = section.search(/\n\s*\d{1,2}\s+(?:Which|What|How|Why|According|The|In|Based|Read|This|Select)/i)

    if (questionStart > 200) {
      // Extract passage text (before questions)
      let passageText = section.slice(0, questionStart)

      // Clean up
      passageText = passageText
        .replace(/^Read\s+(?:this|the)\s+(?:passage|text|story|poem|article)[^\n]*\n/i, '')
        .replace(/Then\s+answer\s+(?:the\s+)?questions[^\n]*\n?/gi, '')
        .trim()

      // Skip if still too short or contains metadata
      if (passageText.length < 300) continue
      if (passageText.includes('Text Complexity') || passageText.includes('Multiple-Choice')) continue

      // Try to match with passage info
      let title: string | null = null
      let lexile: string | null = null
      for (const info of passageInfo) {
        if (passageText.includes(info.title) || section.includes(info.title)) {
          title = info.title
          lexile = info.lexile
          break
        }
      }

      // Determine genre
      const isPoetry = /\bpoem\b|\bstanza\b|\bverse\b|\brhyme\b/i.test(passageText)
      const isLiterary = /\bnarrator\b|\bcharacter\b|"[^"]+"\s+(?:he|she)\s+said/i.test(passageText)

      const passage: Passage = {
        id: randomUUID(),
        genre: isPoetry ? 'poetry' : isLiterary ? 'literary' : 'informational',
        title: title,
        text: passageText,
        lexile_band: lexile,
        word_count: passageText.split(/\s+/).length,
        source: source,
        created_at: new Date().toISOString()
      }
      passages.push(passage)

      // Extract questions from this section
      const questionSection = section.slice(questionStart)
      const questionBlocks = questionSection.split(/\n\s*(\d{1,2})\s+/)

      for (let j = 1; j < questionBlocks.length; j += 2) {
        const qNum = parseInt(questionBlocks[j])
        const qContent = questionBlocks[j + 1]

        if (!qContent || qContent.length < 20) continue

        // Find question stem (ends with ?)
        const stemMatch = qContent.match(/^([^\?]+\?)/)
        if (!stemMatch) continue
        const stem = stemMatch[1].trim()

        // Find choices (A, B, C, D)
        const choices: string[] = []
        const choicePattern = /\n\s*([A-D])\s+([^\n]+)/g
        let choiceMatch
        while ((choiceMatch = choicePattern.exec(qContent)) !== null) {
          choices.push(`${choiceMatch[1]}. ${choiceMatch[2].trim()}`)
          if (choices.length >= 4) break
        }

        // Only add if we have 4 choices (multiple choice question)
        if (choices.length === 4) {
          const answerInfo = answerKeyMap[qNum]
          const topic = answerInfo ? getTopic(answerInfo.standard, 'reading') : 'inference'

          items.push({
            id: randomUUID(),
            subject: 'reading',
            topic: topic,
            subtopic: null,
            difficulty: 3,
            cognitive_level: 2,
            source_style: 'iowa_like',
            stem: stem,
            choices: choices,
            answer_key: answerInfo?.key || 'A',
            rationale: answerInfo?.standard ? `Standard: ${answerInfo.standard}` : 'From NY State released items',
            tags: ['ny_state', 'grade_8', 'ela'],
            status: answerInfo ? 'active' : 'needs_review',
            passage_id: passage.id,
            source: source,
            created_at: new Date().toISOString()
          })
        }
      }
    }
  }

  return { passages, items, errors }
}

/**
 * Parse NY State Math format
 */
function parseNYStateMath(text: string, source: string): ExtractionResult {
  const passages: Passage[] = []
  const items: Item[] = []
  const errors: string[] = []

  // Get answer key
  const answerKeyMap = extractNYAnswerKey(text)

  // Math questions are numbered and have choices
  // Pattern: number followed by question text and choices
  const questionBlocks = text.split(/\n\s*(\d{1,2})\s+(?=[A-Z])/)

  for (let i = 1; i < questionBlocks.length; i += 2) {
    const qNum = parseInt(questionBlocks[i])
    const qContent = questionBlocks[i + 1]

    if (!qContent || qContent.length < 20) continue

    // Skip if it's not a question (no choices)
    if (!/\n\s*[A-D]\s+/.test(qContent)) continue

    // Find where choices start
    const choiceStart = qContent.search(/\n\s*A\s+/)
    if (choiceStart < 10) continue

    const stem = qContent.slice(0, choiceStart).trim()

    // Extract choices
    const choices: string[] = []
    const choiceSection = qContent.slice(choiceStart)
    const choicePattern = /\n?\s*([A-D])\s+([^\n]+)/g
    let choiceMatch
    while ((choiceMatch = choicePattern.exec(choiceSection)) !== null) {
      choices.push(`${choiceMatch[1]}. ${choiceMatch[2].trim()}`)
      if (choices.length >= 4) break
    }

    if (choices.length === 4 && stem.length > 10) {
      const answerInfo = answerKeyMap[qNum]
      const topic = answerInfo ? getTopic(answerInfo.standard, 'math') : 'linear_equations'

      items.push({
        id: randomUUID(),
        subject: 'math',
        topic: topic,
        subtopic: null,
        difficulty: 3,
        cognitive_level: 2,
        source_style: 'iowa_like',
        stem: stem,
        choices: choices,
        answer_key: answerInfo?.key || 'A',
        rationale: answerInfo?.standard ? `Standard: ${answerInfo.standard}` : 'From NY State released items',
        tags: ['ny_state', 'grade_8', 'math'],
        status: answerInfo ? 'active' : 'needs_review',
        passage_id: null,
        source: source,
        created_at: new Date().toISOString()
      })
    }
  }

  return { passages, items, errors }
}

/**
 * Generic parser - extracts any multiple choice questions it can find
 */
function parseGeneric(text: string, source: string, subject: 'math' | 'reading'): ExtractionResult {
  const passages: Passage[] = []
  const items: Item[] = []
  const errors: string[] = []

  // Look for numbered questions followed by choices
  const questionPattern = /(\d{1,2})[.\)]\s*([^\n]+(?:\n(?![A-D][.\)])[^\n]*)*)\n\s*([A-D])[.\)]\s*([^\n]+)\n\s*([A-D])[.\)]\s*([^\n]+)\n\s*([A-D])[.\)]\s*([^\n]+)\n\s*([A-D])[.\)]\s*([^\n]+)/g

  let match
  while ((match = questionPattern.exec(text)) !== null) {
    const stem = match[2].trim()
    const choices = [
      `${match[3]}. ${match[4].trim()}`,
      `${match[5]}. ${match[6].trim()}`,
      `${match[7]}. ${match[8].trim()}`,
      `${match[9]}. ${match[10].trim()}`
    ]

    if (stem.length > 10) {
      items.push({
        id: randomUUID(),
        subject: subject,
        topic: subject === 'math' ? 'linear_equations' : 'inference',
        subtopic: null,
        difficulty: 3,
        cognitive_level: 2,
        source_style: 'iowa_like',
        stem: stem,
        choices: choices,
        answer_key: 'A', // Unknown
        rationale: 'Extracted from released items - answer key not found',
        tags: [path.basename(source, '.pdf')],
        status: 'needs_review',
        passage_id: null,
        source: source,
        created_at: new Date().toISOString()
      })
    }
  }

  return { passages, items, errors }
}

/**
 * Determine parser and subject based on file path
 */
function getParserInfo(filePath: string): { parser: (text: string, source: string) => ExtractionResult; subject: 'math' | 'reading' } {
  const fileName = path.basename(filePath).toLowerCase()
  const dirName = path.dirname(filePath).toLowerCase()

  const isMath = fileName.includes('math') || dirName.includes('math') || fileName.includes('algebra')
  const subject: 'math' | 'reading' = isMath ? 'math' : 'reading'

  if (dirName.includes('ny_state') || fileName.includes('nys')) {
    if (isMath) {
      return { parser: parseNYStateMath, subject: 'math' }
    }
    return { parser: parseNYStateELA, subject: 'reading' }
  }

  // Default to generic parser
  return {
    parser: (text, source) => parseGeneric(text, source, subject),
    subject
  }
}

/**
 * Process all PDFs in a directory
 */
async function processDirectory(dir: string): Promise<ExtractionResult> {
  const allPassages: Passage[] = []
  const allItems: Item[] = []
  const allErrors: string[] = []

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      const subResult = await processDirectory(fullPath)
      allPassages.push(...subResult.passages)
      allItems.push(...subResult.items)
      allErrors.push(...subResult.errors)
    } else if (entry.name.toLowerCase().endsWith('.pdf')) {
      console.log(`Processing: ${fullPath}`)

      try {
        const text = await extractPDFText(fullPath)

        if (!text || text.length < 100) {
          console.log(`  Skipped: No text extracted`)
          continue
        }

        // Save raw text for debugging
        const rawTextPath = path.join(RAW_TEXT_DIR, entry.name.replace('.pdf', '.txt'))
        fs.writeFileSync(rawTextPath, text)

        const { parser, subject } = getParserInfo(fullPath)
        const result = parser(text, fullPath)

        allPassages.push(...result.passages)
        allItems.push(...result.items)
        allErrors.push(...result.errors)

        console.log(`  Found ${result.passages.length} passages, ${result.items.length} items`)
      } catch (error) {
        const errorMsg = `Error processing ${fullPath}: ${error}`
        console.error(`  ${errorMsg}`)
        allErrors.push(errorMsg)
      }
    }
  }

  return { passages: allPassages, items: allItems, errors: allErrors }
}

/**
 * Main function
 */
async function main() {
  console.log('Starting PDF extraction...\n')

  // Create output directories
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }
  if (!fs.existsSync(RAW_TEXT_DIR)) {
    fs.mkdirSync(RAW_TEXT_DIR, { recursive: true })
  }

  // Process all PDFs
  const result = await processDirectory(REAL_PASSAGES_DIR)

  // Write output files
  const passagesPath = path.join(OUTPUT_DIR, 'passages.json')
  const itemsPath = path.join(OUTPUT_DIR, 'items.json')

  fs.writeFileSync(passagesPath, JSON.stringify(result.passages, null, 2))
  fs.writeFileSync(itemsPath, JSON.stringify(result.items, null, 2))

  // Write errors log
  if (result.errors.length > 0) {
    const errorsPath = path.join(OUTPUT_DIR, 'extraction_errors.log')
    fs.writeFileSync(errorsPath, result.errors.join('\n'))
  }

  // Summary
  console.log('\n========================================')
  console.log('Extraction Complete!')
  console.log('========================================')
  console.log(`Passages extracted: ${result.passages.length}`)
  console.log(`Items extracted: ${result.items.length}`)
  console.log(`  - Reading: ${result.items.filter(i => i.subject === 'reading').length}`)
  console.log(`  - Math: ${result.items.filter(i => i.subject === 'math').length}`)
  console.log(`Errors: ${result.errors.length}`)
  console.log(`\nOutput files:`)
  console.log(`  ${passagesPath}`)
  console.log(`  ${itemsPath}`)
  console.log(`\nRaw text saved to: ${RAW_TEXT_DIR}`)
}

main().catch(console.error)
