import fs from 'node:fs'
import { extractText } from 'unpdf'

async function main() {
  const filePath = process.argv[2] || '/Users/christopher.haid/Dev-Projects/clearcut/content/real_passages/ny_state/2024-released-items-ela-g8.pdf'
  console.log(`Reading: ${filePath}`)

  const buffer = fs.readFileSync(filePath)
  const data = new Uint8Array(buffer)
  const result = await extractText(data)

  console.log('Type of result.text:', typeof result.text)
  console.log('Is Array:', Array.isArray(result.text))
  console.log('Keys in result:', Object.keys(result))

  let text = ''
  if (Array.isArray(result.text)) {
    text = result.text.join('\n')
  } else if (typeof result.text === 'string') {
    text = result.text
  }

  // Write first 10000 chars to see structure
  const output = text.substring(0, 10000)
  console.log('\n=== EXTRACTED TEXT (first 10000 chars) ===\n')
  console.log(output)
  console.log('\n=== END ===')
  console.log('\nTotal length:', text.length)
}

main().catch(console.error)
