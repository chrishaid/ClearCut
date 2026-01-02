/**
 * Enhanced extraction script with state-specific parsers
 * Handles NY State, Texas STAAR, and other formats
 *
 * Usage:
 *   npx tsx scripts/extractAllStates.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { extractText } from 'unpdf'

// Output paths
const OUTPUT_DIR = path.join(process.cwd(), 'content', 'extracted_items')
const RAW_TEXT_DIR = path.join(OUTPUT_DIR, 'raw_text')
const REAL_PASSAGES_DIR = path.join(process.cwd(), 'content', 'real_passages')

// Types
interface Passage {
  id: string
  genre: 'informational' | 'literary' | 'poetry' | 'drama'
  title: string | null
  text: string
  lexile_band: string | null
  word_count: number | null
  source: string
  grade: number | null
  state: string
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
  choices: string[]
  answer_key: string
  rationale: string
  tags: string[]
  status: string
  passage_id: string | null
  source: string
  question_number: number | null
  created_at: string
}

interface ExtractionResult {
  passages: Passage[]
  items: Item[]
}

// Topic mappings
const READING_TOPICS = ['inference', 'main_idea', 'vocab_context', 'structure_evidence', 'author_craft', 'compare_contrast']
const MATH_TOPICS = ['number_sense', 'linear_equations', 'geometry', 'data_probability', 'fractions_decimals', 'word_problems']

/**
 * Extract text from PDF
 */
async function extractPDFText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath)
  const data = new Uint8Array(buffer)
  const result = await extractText(data)

  if (!result.text) return ''
  if (Array.isArray(result.text)) return result.text.join('\n')
  return String(result.text)
}

/**
 * Determine genre from text
 */
function determineGenre(text: string): 'informational' | 'literary' | 'poetry' | 'drama' {
  if (/\bpoem\b|\bstanza\b|\bverse\b|\brhyme\b/i.test(text)) return 'poetry'
  if (/\bscene\b|\bact\b|\bdialogue\b|\bstage\s+directions?\b/i.test(text)) return 'drama'
  if (/\bnarrator\b|"[^"]+"\s+(?:he|she)\s+said|\bcharacter\b/i.test(text)) return 'literary'
  return 'informational'
}

/**
 * Infer topic from question stem
 */
function inferTopic(stem: string, subject: 'math' | 'reading'): string {
  const stemLower = stem.toLowerCase()

  if (subject === 'reading') {
    if (/main\s*idea|central\s*idea|mostly\s*about|summary/i.test(stemLower)) return 'main_idea'
    if (/word\s*mean|definition|vocabulary|meaning\s*of/i.test(stemLower)) return 'vocab_context'
    if (/author|purpose|point\s*of\s*view|tone|style/i.test(stemLower)) return 'author_craft'
    if (/compare|contrast|similar|different|both/i.test(stemLower)) return 'compare_contrast'
    if (/structure|organize|develop|paragraph|section/i.test(stemLower)) return 'structure_evidence'
    return 'inference'
  } else {
    if (/equation|solve|variable|expression/i.test(stemLower)) return 'linear_equations'
    if (/fraction|decimal|percent|ratio/i.test(stemLower)) return 'fractions_decimals'
    if (/angle|triangle|circle|area|volume|perimeter/i.test(stemLower)) return 'geometry'
    if (/probability|data|graph|chart|mean|median/i.test(stemLower)) return 'data_probability'
    if (/number|integer|factor|multiple/i.test(stemLower)) return 'number_sense'
    return 'word_problems'
  }
}

/**
 * Clean text by removing page markers and noise
 */
function cleanText(text: string): string {
  return text
    .replace(/Page\s*\d+/gi, '')
    .replace(/STAAR\s*Reading[^\n]*/gi, '')
    .replace(/GO\s*ON/gi, '')
    .replace(/STOP/gi, '')
    .replace(/Copyright\s*©[^\n]*/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Parse Texas STAAR Reading format
 */
function parseTexasSTAARReading(text: string, source: string): ExtractionResult {
  const passages: Passage[] = []
  const items: Item[] = []

  // Split by "Read the selection" markers
  const sections = text.split(/Read the selection and choose the best answer/i)

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i]

    // Find the title - look for title pattern after "to each question" or "answer document"
    let title: string | null = null
    const titlePatterns = [
      /(?:answer document[^\n]*\n+)([A-Z][A-Za-z\s,':;\-()]+)\n(?:by\s)/i,
      /(?:to each question[^\n]*\n+)([A-Z][^\n]{5,80})\n/i,
      /\n\n([A-Z][A-Za-z\s,':;\-()]{10,60})\n(?:by\s|from\s)/i
    ]
    for (const pattern of titlePatterns) {
      const match = section.match(pattern)
      if (match) {
        title = match[1].trim()
        break
      }
    }

    // Find where questions start - Texas format: "1 [question text] —" followed by choices
    // Look for pattern: number at start of line, followed by question ending with — or ?
    const questionStart = section.search(/\n1\s+[A-Z][^\n]+[—?]\s*\n[A-D]\s/)

    if (questionStart > 200) {
      let passageText = section.slice(0, questionStart)

      // Clean passage text
      passageText = cleanText(passageText)
        .replace(/^[^\n]*to each question[^\n]*\n/i, '')
        .replace(/^[^\n]*answer document[^\n]*\n/i, '')
        .trim()

      // Remove title from beginning if it's there
      if (title && passageText.startsWith(title)) {
        passageText = passageText.slice(title.length).trim()
      }

      // Remove author line
      passageText = passageText.replace(/^by\s+[^\n]+\n/i, '')

      if (passageText.length > 300) {
        const passage: Passage = {
          id: randomUUID(),
          genre: determineGenre(passageText),
          title: title,
          text: passageText,
          lexile_band: null,
          word_count: passageText.split(/\s+/).length,
          source: source,
          grade: source.includes('english-i') ? 9 : source.includes('english-ii') ? 10 : 8,
          state: 'TX',
          created_at: new Date().toISOString()
        }
        passages.push(passage)

        // Extract questions - Texas uses "1 question —" format with A/B/C/D or F/G/H/J choices
        const questionSection = section.slice(questionStart)

        // Pattern for Texas questions: number, question text (may span lines), choices
        // Choices are either A/B/C/D (odd questions) or F/G/H/J (even questions)
        const questionPattern = /(\d+)\s+([^\n]+(?:\n(?![A-DFGHJ]\s)[^\n]*)*)\n([A-D])\s+([^\n]+)\n([A-D])\s+([^\n]+)\n([A-D])\s+([^\n]+)\n([A-D])\s+([^\n]+)/g

        let match
        while ((match = questionPattern.exec(questionSection)) !== null) {
          const qNum = parseInt(match[1])
          let stem = match[2].trim().replace(/\s*[—]\s*$/, '?') // Replace em-dash with ?

          const choices = [
            `A. ${match[4].trim()}`,
            `B. ${match[6].trim()}`,
            `C. ${match[8].trim()}`,
            `D. ${match[10].trim()}`
          ]

          if (stem.length > 10 && choices.every(c => c.length > 3)) {
            items.push({
              id: randomUUID(),
              subject: 'reading',
              topic: inferTopic(stem, 'reading'),
              subtopic: null,
              difficulty: 3,
              cognitive_level: 2,
              source_style: 'terranova_like',
              stem: stem,
              choices: choices,
              answer_key: 'A',
              rationale: 'From Texas STAAR released items',
              tags: ['texas_staar', `grade_${passage.grade}`, 'reading'],
              status: 'needs_review',
              passage_id: passage.id,
              source: source,
              question_number: qNum,
              created_at: new Date().toISOString()
            })
          }
        }

        // Also try F/G/H/J pattern for even questions
        const questionPatternFGHJ = /(\d+)\s+([^\n]+(?:\n(?![A-DFGHJ]\s)[^\n]*)*)\n([FGHJ])\s+([^\n]+)\n([FGHJ])\s+([^\n]+)\n([FGHJ])\s+([^\n]+)\n([FGHJ])\s+([^\n]+)/g

        while ((match = questionPatternFGHJ.exec(questionSection)) !== null) {
          const qNum = parseInt(match[1])
          let stem = match[2].trim().replace(/\s*[—]\s*$/, '?')

          // Map F/G/H/J to A/B/C/D
          const choices = [
            `A. ${match[4].trim()}`,
            `B. ${match[6].trim()}`,
            `C. ${match[8].trim()}`,
            `D. ${match[10].trim()}`
          ]

          if (stem.length > 10 && choices.every(c => c.length > 3)) {
            items.push({
              id: randomUUID(),
              subject: 'reading',
              topic: inferTopic(stem, 'reading'),
              subtopic: null,
              difficulty: 3,
              cognitive_level: 2,
              source_style: 'terranova_like',
              stem: stem,
              choices: choices,
              answer_key: 'A',
              rationale: 'From Texas STAAR released items',
              tags: ['texas_staar', `grade_${passage.grade}`, 'reading'],
              status: 'needs_review',
              passage_id: passage.id,
              source: source,
              question_number: qNum,
              created_at: new Date().toISOString()
            })
          }
        }
      }
    }
  }

  return { passages, items }
}

/**
 * Parse Texas STAAR Math format
 */
function parseTexasSTAARMath(text: string, source: string): ExtractionResult {
  const passages: Passage[] = []
  const items: Item[] = []

  // Math questions are standalone, numbered
  const questionPattern = /(\d+)\s+([^\n]+(?:\n(?![A-D]\s|[FGHJ]\s|\d+\s+[A-Z])[^\n]*)*)\n\s*([A-D]|F)\s+([^\n]+)\n\s*([A-D]|G)\s+([^\n]+)\n\s*([A-D]|H)\s+([^\n]+)\n\s*([A-D]|J)\s+([^\n]+)/g

  let match
  while ((match = questionPattern.exec(text)) !== null) {
    const qNum = parseInt(match[1])
    let stem = match[2].trim()

    // Clean stem
    stem = cleanText(stem)

    // Skip if stem is too short or just a formula
    if (stem.length < 15) continue
    if (/^[A-Z]\s*=/.test(stem)) continue

    const isABCD = /^[A-D]$/.test(match[3])
    const choices = isABCD ? [
      `A. ${match[4].trim()}`,
      `B. ${match[6].trim()}`,
      `C. ${match[8].trim()}`,
      `D. ${match[10].trim()}`
    ] : [
      `A. ${match[4].trim()}`,
      `B. ${match[6].trim()}`,
      `C. ${match[8].trim()}`,
      `D. ${match[10].trim()}`
    ]

    if (choices.every(c => c.length > 3)) {
      items.push({
        id: randomUUID(),
        subject: 'math',
        topic: inferTopic(stem, 'math'),
        subtopic: null,
        difficulty: 3,
        cognitive_level: 2,
        source_style: 'terranova_like',
        stem: stem,
        choices: choices,
        answer_key: 'A',
        rationale: 'From Texas STAAR released items',
        tags: ['texas_staar', 'grade_8', 'math'],
        status: 'needs_review',
        passage_id: null,
        source: source,
        question_number: qNum,
        created_at: new Date().toISOString()
      })
    }
  }

  return { passages, items }
}

/**
 * Parse NY State ELA format
 */
function parseNYStateELA(text: string, source: string): ExtractionResult {
  const passages: Passage[] = []
  const items: Item[] = []

  // Split by "Directions:" markers
  const sections = text.split(/Directions:?\s*/i)

  for (let i = 1; i < sections.length; i++) {
    const section = sections[i]
    if (section.length < 500) continue

    const questionStart = section.search(/\n\s*\d{1,2}\s+(?:Which|What|How|Why|According|The|In|Based|Read|This|Select)/i)

    if (questionStart > 200) {
      let passageText = section.slice(0, questionStart)

      passageText = cleanText(passageText)
        .replace(/^Read\s+(?:this|the)\s+(?:passage|text|story|poem|article)[^\n]*\n/i, '')
        .replace(/Then\s+answer\s+(?:the\s+)?questions[^\n]*\n?/gi, '')
        .trim()

      if (passageText.length < 300) continue
      if (passageText.includes('Text Complexity') || passageText.includes('Multiple-Choice')) continue

      const passage: Passage = {
        id: randomUUID(),
        genre: determineGenre(passageText),
        title: null,
        text: passageText,
        lexile_band: null,
        word_count: passageText.split(/\s+/).length,
        source: source,
        grade: source.includes('g7') ? 7 : 8,
        state: 'NY',
        created_at: new Date().toISOString()
      }
      passages.push(passage)

      // Extract questions
      const questionSection = section.slice(questionStart)
      const questionBlocks = questionSection.split(/\n\s*(\d{1,2})\s+/)

      for (let j = 1; j < questionBlocks.length; j += 2) {
        const qNum = parseInt(questionBlocks[j])
        const qContent = questionBlocks[j + 1]
        if (!qContent || qContent.length < 20) continue

        const stemMatch = qContent.match(/^([^\?]+\?)/)
        if (!stemMatch) continue
        const stem = cleanText(stemMatch[1])

        const choices: string[] = []
        const choicePattern = /\n\s*([A-D])\s+([^\n]+)/g
        let choiceMatch
        while ((choiceMatch = choicePattern.exec(qContent)) !== null) {
          choices.push(`${choiceMatch[1]}. ${choiceMatch[2].trim()}`)
          if (choices.length >= 4) break
        }

        if (choices.length === 4 && stem.length > 15) {
          items.push({
            id: randomUUID(),
            subject: 'reading',
            topic: inferTopic(stem, 'reading'),
            subtopic: null,
            difficulty: 3,
            cognitive_level: 2,
            source_style: 'iowa_like',
            stem: stem,
            choices: choices,
            answer_key: 'A',
            rationale: 'From NY State released items',
            tags: ['ny_state', `grade_${passage.grade}`, 'ela'],
            status: 'needs_review',
            passage_id: passage.id,
            source: source,
            question_number: qNum,
            created_at: new Date().toISOString()
          })
        }
      }
    }
  }

  return { passages, items }
}

/**
 * Parse NY State Math format
 */
function parseNYStateMath(text: string, source: string): ExtractionResult {
  const passages: Passage[] = []
  const items: Item[] = []

  const questionBlocks = text.split(/\n\s*(\d{1,2})\s+(?=[A-Z])/)

  for (let i = 1; i < questionBlocks.length; i += 2) {
    const qNum = parseInt(questionBlocks[i])
    const qContent = questionBlocks[i + 1]
    if (!qContent || qContent.length < 20) continue
    if (!/\n\s*[A-D]\s+/.test(qContent)) continue

    const choiceStart = qContent.search(/\n\s*A\s+/)
    if (choiceStart < 10) continue

    let stem = cleanText(qContent.slice(0, choiceStart))
    if (stem.length < 15 || /^[A-Z]\s*=/.test(stem)) continue

    const choices: string[] = []
    const choiceSection = qContent.slice(choiceStart)
    const choicePattern = /\n?\s*([A-D])\s+([^\n]+)/g
    let choiceMatch
    while ((choiceMatch = choicePattern.exec(choiceSection)) !== null) {
      choices.push(`${choiceMatch[1]}. ${choiceMatch[2].trim()}`)
      if (choices.length >= 4) break
    }

    if (choices.length === 4) {
      items.push({
        id: randomUUID(),
        subject: 'math',
        topic: inferTopic(stem, 'math'),
        subtopic: null,
        difficulty: 3,
        cognitive_level: 2,
        source_style: 'iowa_like',
        stem: stem,
        choices: choices,
        answer_key: 'A',
        rationale: 'From NY State released items',
        tags: ['ny_state', source.includes('g7') ? 'grade_7' : 'grade_8', 'math'],
        status: 'needs_review',
        passage_id: null,
        source: source,
        question_number: qNum,
        created_at: new Date().toISOString()
      })
    }
  }

  return { passages, items }
}

/**
 * Generic parser for other formats
 */
function parseGeneric(text: string, source: string, subject: 'math' | 'reading'): ExtractionResult {
  const passages: Passage[] = []
  const items: Item[] = []

  // Try to find numbered questions with choices
  const questionPattern = /(\d{1,2})[.\)]\s*([^\n]+(?:\n(?![A-D][.\)])[^\n]*)*)\n\s*([A-D])[.\)]\s*([^\n]+)\n\s*([A-D])[.\)]\s*([^\n]+)\n\s*([A-D])[.\)]\s*([^\n]+)\n\s*([A-D])[.\)]\s*([^\n]+)/g

  let match
  while ((match = questionPattern.exec(text)) !== null) {
    const qNum = parseInt(match[1])
    const stem = cleanText(match[2])

    if (stem.length < 15) continue

    const choices = [
      `${match[3]}. ${match[4].trim()}`,
      `${match[5]}. ${match[6].trim()}`,
      `${match[7]}. ${match[8].trim()}`,
      `${match[9]}. ${match[10].trim()}`
    ]

    items.push({
      id: randomUUID(),
      subject: subject,
      topic: inferTopic(stem, subject),
      subtopic: null,
      difficulty: 3,
      cognitive_level: 2,
      source_style: 'iowa_like',
      stem: stem,
      choices: choices,
      answer_key: 'A',
      rationale: 'Extracted from released items',
      tags: [path.basename(source, '.pdf')],
      status: 'needs_review',
      passage_id: null,
      source: source,
      question_number: qNum,
      created_at: new Date().toISOString()
    })
  }

  return { passages, items }
}

/**
 * Select parser based on file path
 */
function selectParser(filePath: string): (text: string, source: string) => ExtractionResult {
  const fileName = path.basename(filePath).toLowerCase()
  const dirName = path.dirname(filePath).toLowerCase()

  // Texas STAAR
  if (dirName.includes('texas') || fileName.includes('staar')) {
    if (fileName.includes('math') || fileName.includes('algebra')) {
      return parseTexasSTAARMath
    }
    return parseTexasSTAARReading
  }

  // NY State
  if (dirName.includes('ny_state') || fileName.includes('nys') || fileName.includes('released-items')) {
    if (fileName.includes('math') || dirName.includes('math')) {
      return parseNYStateMath
    }
    return parseNYStateELA
  }

  // Default - determine subject from filename
  const isMath = fileName.includes('math') || dirName.includes('math')
  return (text, source) => parseGeneric(text, source, isMath ? 'math' : 'reading')
}

/**
 * Process all PDFs
 */
async function processDirectory(dir: string): Promise<ExtractionResult> {
  const allPassages: Passage[] = []
  const allItems: Item[] = []

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      const subResult = await processDirectory(fullPath)
      allPassages.push(...subResult.passages)
      allItems.push(...subResult.items)
    } else if (entry.name.toLowerCase().endsWith('.pdf')) {
      console.log(`Processing: ${fullPath}`)

      try {
        const text = await extractPDFText(fullPath)

        if (!text || text.length < 100) {
          console.log(`  Skipped: No text extracted`)
          continue
        }

        // Save raw text
        const rawTextPath = path.join(RAW_TEXT_DIR, entry.name.replace('.pdf', '.txt'))
        fs.writeFileSync(rawTextPath, text)

        const parser = selectParser(fullPath)
        const result = parser(text, fullPath)

        allPassages.push(...result.passages)
        allItems.push(...result.items)

        console.log(`  Found ${result.passages.length} passages, ${result.items.length} items`)
      } catch (error) {
        console.error(`  Error: ${error}`)
      }
    }
  }

  return { passages: allPassages, items: allItems }
}

/**
 * Main
 */
async function main() {
  console.log('Starting enhanced extraction...\n')

  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  if (!fs.existsSync(RAW_TEXT_DIR)) fs.mkdirSync(RAW_TEXT_DIR, { recursive: true })

  const result = await processDirectory(REAL_PASSAGES_DIR)

  // Write output
  fs.writeFileSync(path.join(OUTPUT_DIR, 'passages.json'), JSON.stringify(result.passages, null, 2))
  fs.writeFileSync(path.join(OUTPUT_DIR, 'items.json'), JSON.stringify(result.items, null, 2))

  // Summary
  console.log('\n========================================')
  console.log('Extraction Complete!')
  console.log('========================================')
  console.log(`Passages: ${result.passages.length}`)
  console.log(`Items: ${result.items.length}`)
  console.log(`  - Reading: ${result.items.filter(i => i.subject === 'reading').length}`)
  console.log(`  - Math: ${result.items.filter(i => i.subject === 'math').length}`)

  // By state
  const byState = new Map<string, number>()
  for (const p of result.passages) {
    byState.set(p.state, (byState.get(p.state) || 0) + 1)
  }
  console.log(`\nPassages by state:`)
  for (const [state, count] of byState) {
    console.log(`  ${state}: ${count}`)
  }
}

main().catch(console.error)
