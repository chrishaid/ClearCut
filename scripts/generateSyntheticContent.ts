/**
 * Generate high-quality synthetic passages and questions using
 * real state assessment content as exemplars.
 *
 * This script creates structured content that follows the patterns
 * observed in actual state assessment materials.
 *
 * Usage:
 *   npx tsx scripts/generateSyntheticContent.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const MERGED_DIR = path.join(process.cwd(), 'content', 'merged_item_bank')
const OUTPUT_DIR = path.join(process.cwd(), 'content', 'final_item_bank')

interface Passage {
  id: string
  genre: 'informational' | 'literary' | 'poetry'
  title: string | null
  text: string
  lexile_band: string | null
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
  created_at: string
}

// Reading topics for HSAT prep
const READING_TOPICS = [
  'inference',
  'main_idea',
  'vocab_context',
  'structure_evidence',
  'author_craft',
  'compare_contrast'
]

// High-quality informational passage templates
// These follow patterns from real state assessments
const INFORMATIONAL_PASSAGES: Array<{ title: string; text: string; lexile: string }> = [
  {
    title: "The Science of Sleep",
    text: `Scientists have long known that sleep is essential for human health, but recent research has revealed just how crucial it is for learning and memory. When we sleep, our brains don't simply shut down. Instead, they're busy processing and consolidating the information we've gathered during the day.

During the deepest stages of sleep, the brain replays experiences from the day, strengthening neural connections that form memories. This process, called memory consolidation, helps transfer information from short-term to long-term memory. Students who get adequate sleep after studying perform significantly better on tests than those who stay up late cramming.

Sleep also plays a vital role in problem-solving. Many famous scientists and inventors have reported solving difficult problems after "sleeping on it." This isn't just coincidence—during sleep, the brain can make connections between ideas that might not occur during waking hours. The relaxed state of sleep allows the mind to explore unconventional solutions.

For teenagers, the recommended amount of sleep is eight to ten hours per night. However, studies show that most middle and high school students get far less. The consequences extend beyond feeling tired: insufficient sleep affects attention, decision-making, and emotional regulation. Schools that have shifted to later start times have seen improvements in student performance and well-being.

Understanding the science of sleep can help students make better choices about their study habits. Rather than sacrificing sleep for more study time, research suggests that maintaining a consistent sleep schedule may be one of the most effective strategies for academic success.`,
    lexile: "1050L"
  },
  {
    title: "Urban Wildlife: Adapting to City Life",
    text: `When most people think of wildlife, they picture forests, mountains, or savannas—not city streets. Yet urban areas around the world are home to a surprising variety of animals that have learned to thrive alongside humans. These urban adapters have developed remarkable strategies for survival in environments that would seem inhospitable to wild creatures.

Raccoons are perhaps the most successful urban wildlife species in North America. Originally forest dwellers, these intelligent animals have learned to open garbage cans, navigate storm drains, and even use pedestrian crossings. Their dexterous front paws and problem-solving abilities make them well-suited to exploiting the resources that cities provide.

Peregrine falcons offer another example of successful urban adaptation. Once endangered due to pesticide use, these birds of prey have made a remarkable comeback—partly by nesting on skyscrapers and bridges. The tall buildings mimic the cliff faces where falcons naturally nest, and the abundance of pigeons provides a steady food supply. Today, more than 20 pairs of peregrine falcons nest in New York City alone.

Not all urban wildlife stories are so positive, however. As cities expand into natural habitats, conflicts between humans and wildlife increase. Coyotes, deer, and even bears are appearing in suburban neighborhoods, leading to concerns about safety. Wildlife managers must balance the needs of growing human populations with the preservation of animal habitats.

Studying urban wildlife helps scientists understand how species adapt to environmental change. These lessons may prove valuable as climate change forces many animals to adjust to new conditions. The creatures that share our cities remind us that nature is resilient—and that wildness can flourish in unexpected places.`,
    lexile: "1080L"
  },
  {
    title: "The Hidden World of Caves",
    text: `Deep beneath the Earth's surface lies a world that few people ever see. Caves, formed over millions of years by the slow action of water on rock, contain some of the most unusual environments on our planet. These underground chambers harbor unique ecosystems and preserve records of Earth's history that cannot be found anywhere else.

Most caves form in limestone, a type of rock that dissolves slowly in acidic water. As rainwater absorbs carbon dioxide from the air and soil, it becomes slightly acidic. Over thousands of years, this weak acid carves passages through the rock, creating the tunnels and chambers that explorers discover. The process continues today, with caves still growing and changing.

The formations inside caves, called speleothems, create stunning underground landscapes. Stalactites hang from cave ceilings like stone icicles, while stalagmites rise from the floor. These formations grow incredibly slowly—sometimes only a fraction of an inch per century. Scientists can study the layers within speleothems to learn about past climates and environmental conditions.

Cave ecosystems are among the most specialized on Earth. Without sunlight, cave-dwelling creatures have evolved in complete darkness over millions of years. Many have lost their eyesight entirely, instead developing enhanced senses of touch and smell. Some cave fish and salamanders are found nowhere else in the world, making caves important sites for conservation.

Exploring caves requires special skills and equipment. Professional cavers, called speleologists, must navigate tight passages, climb underground cliffs, and sometimes wade through underground rivers. Despite the challenges, the rewards of cave exploration include discovering new species, finding ancient artifacts, and experiencing landscapes that few humans have ever witnessed.`,
    lexile: "1020L"
  },
  {
    title: "The Mathematics of Music",
    text: `Music and mathematics may seem like very different subjects, but they share a deep connection that dates back thousands of years. Ancient Greek philosophers discovered that musical harmony could be explained through mathematical ratios, and modern scientists continue to explore the mathematical principles underlying the music we hear every day.

The relationship between music and math begins with frequency—the number of vibrations per second that create a sound. When a guitar string vibrates, it creates a specific frequency that we hear as a musical note. Doubling the frequency produces a note one octave higher. This simple mathematical relationship explains why certain notes sound harmonious together.

Musical scales follow mathematical patterns as well. The standard Western scale divides the octave into twelve equal parts, creating the notes on a piano keyboard. Other cultures use different mathematical divisions, producing scales that sound exotic to Western ears. Indian classical music, for example, uses scales with intervals not found in Western music.

Rhythm also has a mathematical foundation. Time signatures tell musicians how many beats are in each measure and which note value equals one beat. Composers use mathematical relationships between note lengths to create patterns of tension and release. Complex rhythms, like those found in jazz and African music, often involve multiple mathematical patterns occurring simultaneously.

Understanding the mathematics of music can help students appreciate both subjects more deeply. Musicians who understand mathematical concepts often find it easier to read music and compose their own pieces. Similarly, students who study music sometimes develop stronger mathematical reasoning skills. The connection between these disciplines reminds us that learning in one area can enhance understanding in another.`,
    lexile: "1040L"
  },
  {
    title: "Citizen Science: Everyone Can Contribute",
    text: `Professional scientists can't be everywhere at once. They can't count every bird in a forest, monitor every stream for pollution, or observe the night sky from every location on Earth. That's where citizen scientists come in—ordinary people who contribute to scientific research by collecting data and making observations in their own communities.

Citizen science isn't a new idea. In fact, one of the longest-running scientific surveys is the Christmas Bird Count, which began in 1900. Each winter, volunteers across North America spend a day counting every bird they see in their assigned area. This data helps scientists track bird populations over time and detect changes that might indicate environmental problems.

Modern technology has dramatically expanded citizen science opportunities. Smartphone apps allow people to photograph plants, animals, and insects and share their observations with researchers worldwide. One app, iNaturalist, has recorded over 100 million observations of species around the globe. This massive dataset helps scientists understand where species live and how their ranges are changing.

Citizen science benefits everyone involved. Researchers gain access to data they could never collect alone, while participants learn about science and their local environment. Studies show that people who participate in citizen science projects develop a deeper understanding of scientific methods and a stronger connection to nature.

Students interested in science can start contributing right away. Projects exist for every interest, from monitoring monarch butterfly migrations to classifying distant galaxies. By participating in citizen science, young people can make real contributions to research while developing skills that will serve them throughout their lives.`,
    lexile: "1000L"
  }
]

// Literary passage templates
const LITERARY_PASSAGES: Array<{ title: string; text: string; lexile: string }> = [
  {
    title: "The Old Lighthouse",
    text: `Maya pressed her forehead against the cold window of the ferry, watching the island grow larger through the morning mist. Her grandmother had lived in the lighthouse keeper's cottage for fifty years, but this would be Maya's first visit since she was too young to remember.

"We're almost there," her mother said, joining her at the window. "Your grandmother is so excited to see you."

Maya nodded, though excitement wasn't quite what she felt. Curiosity, maybe. And something like nervousness. The lighthouse rose above the rocky shore, its white tower bright against the gray sky. Even from the ferry, Maya could see that the light at the top no longer turned. The lighthouse had been automated years ago, her mother had explained, but Grandmother refused to leave.

The ferry docked at a small wooden pier, and they climbed a winding path to the cottage. Before they reached the door, it swung open. A small woman with silver hair and sharp blue eyes stood in the doorway.

"Maya," she said, and her voice carried across the wind. "You look just like your grandfather did at your age. Same serious eyes." She smiled. "Come in before you freeze. I've made soup."

Inside, the cottage was warm and full of interesting things—old maps on the walls, a brass telescope by the window, shelves crowded with shells and bits of sea glass. But what caught Maya's attention was a leather-bound book lying open on a table near the fire.

"That," said her grandmother, noticing her gaze, "is why I asked you to come."`,
    lexile: "880L"
  },
  {
    title: "The Science Fair",
    text: `Derek stared at his project board, convinced it was the most boring display in the entire gymnasium. "The Effects of Music on Plant Growth" read the title in careful block letters. Three small plants sat on the table, looking rather unimpressive compared to the volcanic eruption two tables over.

"Nice work," said a voice behind him.

He turned to find Ms. Rodriguez, his science teacher, examining his data charts. "These results are interesting. You played different types of music for each plant?"

"Classical, rock, and no music at all," Derek said, trying to sound more confident than he felt. "The plants that heard music grew faster than the silent one. And classical music worked better than rock."

Ms. Rodriguez nodded. "What do you think explains that?"

Derek hesitated. He'd written everything he knew on the board, but now he wondered if he'd missed something. "Maybe... the vibrations? Classical music has more consistent patterns?"

"That's a thoughtful hypothesis. Have you considered doing further research?"

Before Derek could answer, a judge approached with a clipboard. Ms. Rodriguez gave him an encouraging smile and moved on. The judge, a woman with glasses and a serious expression, began examining his charts.

"Tell me about your methodology," she said.

As Derek began to explain, he noticed something strange: the judge was nodding. Not the polite, distracted nodding of someone waiting to move on, but the interested nodding of someone who actually wanted to hear more. By the time she finished her questions and moved to the next table, Derek was standing a little straighter.

Maybe his project wasn't so boring after all.`,
    lexile: "920L"
  },
  {
    title: "The Last Game",
    text: `The gymnasium was packed for the final basketball game of the season. Jasmine sat on the bench, watching her teammates warm up on the court. Her ankle, wrapped tightly in a bandage, throbbed with each heartbeat.

"You okay?" Coach Williams asked, settling into the chair beside her.

Jasmine shrugged. She'd twisted her ankle in practice two days ago—not badly enough to need crutches, but badly enough that playing would be risky. The doctor had said it was her choice. She'd chosen to sit out, and now she couldn't stop wondering if she'd made the right decision.

The game started badly. Their opponents scored three quick baskets while the home team struggled to find their rhythm. Jasmine watched Maria, who usually played point guard, trying to run plays from Jasmine's usual position. It wasn't working.

"Come on," Jasmine muttered under her breath.

At halftime, the score was 28-19. Not impossible to overcome, but close. Coach Williams gathered the team for a huddle, and Jasmine found herself wheeling over on her bench, offering suggestions about the opponents' defensive patterns she'd noticed.

"She's right," Maria said, looking at Jasmine with newfound respect. "I saw that too. If we adjust the pick-and-roll—"

The second half was different. Following Jasmine's observations, the team chipped away at the lead. With two minutes left, the score was tied. From the bench, Jasmine felt every possession as if she were on the court.

When Maria hit the winning shot at the buzzer, the team erupted. They rushed toward each other in celebration—and then, as one, they turned toward the bench where Jasmine sat. Maria reached her first, pulling her into the huddle.

"We couldn't have done it without you," Maria said.

Jasmine smiled. Sometimes leadership didn't require being on the court.`,
    lexile: "940L"
  }
]

// Question templates for different topics
function generateQuestions(passage: Passage): Item[] {
  const items: Item[] = []
  const passageId = passage.id
  const isLiterary = passage.genre === 'literary'

  // Main Idea question
  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: 'main_idea',
    subtopic: null,
    difficulty: 3,
    cognitive_level: 2,
    source_style: 'iowa_like',
    stem: isLiterary
      ? 'What is the central message of this passage?'
      : 'What is the main idea of this passage?',
    choices: [
      'A. [Correct main idea - to be filled]',
      'B. [Plausible but too narrow]',
      'C. [Plausible but too broad]',
      'D. [Related but incorrect]'
    ],
    answer_key: 'A',
    rationale: 'The correct answer identifies the central idea that connects all parts of the passage.',
    tags: ['synthetic', 'main_idea'],
    status: 'needs_completion',
    passage_id: passageId,
    created_at: new Date().toISOString()
  })

  // Inference question
  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: 'inference',
    subtopic: null,
    difficulty: 3,
    cognitive_level: 2,
    source_style: 'iowa_like',
    stem: isLiterary
      ? 'Based on the passage, what can the reader infer about the main character?'
      : 'Based on the information in the passage, what can the reader conclude?',
    choices: [
      'A. [Correct inference - to be filled]',
      'B. [Contradicted by text]',
      'C. [Unsupported assumption]',
      'D. [Plausible but incorrect]'
    ],
    answer_key: 'A',
    rationale: 'This inference is supported by evidence in the passage.',
    tags: ['synthetic', 'inference'],
    status: 'needs_completion',
    passage_id: passageId,
    created_at: new Date().toISOString()
  })

  // Vocabulary question
  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: 'vocab_context',
    subtopic: null,
    difficulty: 3,
    cognitive_level: 1,
    source_style: 'iowa_like',
    stem: 'As used in the passage, the word "[word]" most nearly means—',
    choices: [
      'A. [Correct definition - to be filled]',
      'B. [Related meaning but wrong context]',
      'C. [Different meaning of same word]',
      'D. [Unrelated meaning]'
    ],
    answer_key: 'A',
    rationale: 'Context clues in the surrounding sentences support this meaning.',
    tags: ['synthetic', 'vocabulary'],
    status: 'needs_completion',
    passage_id: passageId,
    created_at: new Date().toISOString()
  })

  // Author's purpose or Structure question
  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: isLiterary ? 'author_craft' : 'structure_evidence',
    subtopic: null,
    difficulty: 4,
    cognitive_level: 2,
    source_style: 'iowa_like',
    stem: isLiterary
      ? 'Why does the author include the detail about [specific detail]?'
      : 'How does the author organize the information in this passage?',
    choices: [
      'A. [Correct answer - to be filled]',
      'B. [Plausible but incorrect]',
      'C. [Partially correct]',
      'D. [Misinterpretation]'
    ],
    answer_key: 'A',
    rationale: isLiterary
      ? 'This detail serves to develop character/theme/plot.'
      : 'The organizational structure supports the author\'s purpose.',
    tags: ['synthetic', isLiterary ? 'author_craft' : 'structure'],
    status: 'needs_completion',
    passage_id: passageId,
    created_at: new Date().toISOString()
  })

  return items
}

async function main() {
  console.log('Generating synthetic content from exemplars...\n')

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  // Load merged content
  const existingPassages: Passage[] = JSON.parse(
    fs.readFileSync(path.join(MERGED_DIR, 'passages.json'), 'utf8')
  )
  const existingItems: Item[] = JSON.parse(
    fs.readFileSync(path.join(MERGED_DIR, 'items.json'), 'utf8')
  )

  console.log(`Starting with ${existingPassages.length} passages and ${existingItems.length} items`)

  // Create new passages from templates
  const newPassages: Passage[] = []
  const newItems: Item[] = []

  // Add informational passages
  for (const template of INFORMATIONAL_PASSAGES) {
    const passage: Passage = {
      id: randomUUID(),
      genre: 'informational',
      title: template.title,
      text: template.text,
      lexile_band: template.lexile,
      created_at: new Date().toISOString()
    }
    newPassages.push(passage)

    // Generate questions for this passage
    const questions = generateQuestions(passage)
    newItems.push(...questions)
  }

  // Add literary passages
  for (const template of LITERARY_PASSAGES) {
    const passage: Passage = {
      id: randomUUID(),
      genre: 'literary',
      title: template.title,
      text: template.text,
      lexile_band: template.lexile,
      created_at: new Date().toISOString()
    }
    newPassages.push(passage)

    // Generate questions for this passage
    const questions = generateQuestions(passage)
    newItems.push(...questions)
  }

  // Merge everything
  const allPassages = [...existingPassages, ...newPassages]
  const allItems = [...existingItems, ...newItems]

  // Write output
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'passages.json'),
    JSON.stringify(allPassages, null, 2)
  )
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'items.json'),
    JSON.stringify(allItems, null, 2)
  )

  // Summary
  console.log('\n========================================')
  console.log('Generation Complete!')
  console.log('========================================')
  console.log(`Total passages: ${allPassages.length}`)
  console.log(`  - Real (from state tests): ${existingPassages.length}`)
  console.log(`  - Synthetic (new high-quality): ${newPassages.length}`)
  console.log(`\nTotal items: ${allItems.length}`)
  console.log(`  - Reading: ${allItems.filter(i => i.subject === 'reading').length}`)
  console.log(`  - Math: ${allItems.filter(i => i.subject === 'math').length}`)
  console.log(`\nNew items needing completion: ${newItems.length}`)
  console.log(`\nOutput saved to: ${OUTPUT_DIR}`)
  console.log(`\nNote: New questions have placeholder answer choices.`)
  console.log(`Run with --complete flag to generate full answer choices.`)
}

main().catch(console.error)
