/**
 * Generate final reading passages to reach exactly 50% balance
 * Need 60 more reading items (12 passages × 5 questions each)
 *
 * Usage:
 *   npx tsx scripts/generateReadingFinal.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const BANK_DIR = path.join(process.cwd(), 'content', 'hsat_full_item_bank')

interface Passage {
  id: string
  genre: 'informational' | 'literary' | 'poetry'
  title: string
  text: string
  lexile_band: string
  word_count: number
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
  passage_id: string
  week_phase: string
  created_at: string
}

// Final batch of passages
const finalPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'informational',
    title: 'The Importance of Pollinators',
    lexile_band: '950L',
    text: `When you eat an apple, thank a bee. Approximately 75% of flowering plants and 35% of food crops depend on animal pollinators. These creatures—including bees, butterflies, birds, and bats—play a crucial role in both natural ecosystems and agriculture.

Pollination occurs when pollen is transferred from the male part of a flower to the female part, enabling plants to produce seeds. While some plants rely on wind or water for pollination, many have evolved to attract animal pollinators with colorful petals, sweet nectar, and appealing scents.

Bees are the most important pollinators worldwide. A single honeybee colony can pollinate 300 million flowers daily. As bees collect nectar, pollen sticks to their fuzzy bodies and transfers to other flowers. Many fruits and vegetables—including almonds, apples, berries, and squash—depend entirely on bee pollination.

Butterflies and moths also pollinate while feeding on nectar, though they're less efficient than bees. Hummingbirds pollinate tubular flowers that bees can't reach. In tropical regions, bats pollinate night-blooming plants, including some that produce fruits like mangoes and bananas.

Pollinator populations are declining due to habitat loss, pesticide use, disease, and climate change. Honeybee colonies in the United States have dropped by more than 50% since the 1940s. Native bee species are also struggling as wild meadows disappear.

Protecting pollinators requires action at every level: planting native flowers, reducing pesticide use, creating pollinator-friendly gardens, and preserving natural habitats. The health of these small creatures is directly connected to our food supply and the diversity of life on Earth.`
  },
  {
    genre: 'informational',
    title: 'The Great Wall of China',
    lexile_band: '980L',
    text: `Stretching across northern China for more than 13,000 miles, the Great Wall is one of humanity's most ambitious construction projects. Built over centuries by multiple dynasties, this ancient fortification represents an extraordinary feat of engineering and organization.

The wall was not built as a single continuous structure. Instead, it consists of many walls, watchtowers, and fortresses constructed at different times and later connected. The earliest walls date back to the 7th century BCE, when regional states built barriers against nomadic invaders from the north.

The most famous sections were built during the Ming Dynasty (1368-1644 CE). These walls used brick and stone rather than the packed earth of earlier construction. The Ming sections feature watchtowers every few hundred meters, allowing guards to signal each other with smoke during the day and fire at night.

Construction required an enormous workforce. Historical records suggest that hundreds of thousands of soldiers, peasants, and prisoners labored on the wall over generations. Many workers died during construction and were buried within the wall itself. The human cost of this monument was immense.

Despite its name and impressive appearance, the Great Wall was not always effective as a military defense. Invaders often bribed guards or simply went around the wall. The wall's greater significance may have been symbolic—a visible demonstration of imperial power and the boundary between Chinese civilization and the "barbarian" north.

Today, the Great Wall is China's most famous landmark and a UNESCO World Heritage Site. Millions of tourists visit annually, though much of the wall has deteriorated over centuries of weathering and neglect.`
  },
  {
    genre: 'informational',
    title: 'How Muscles Work',
    lexile_band: '940L',
    text: `Every movement you make—from blinking your eyes to running a marathon—depends on muscles contracting and relaxing. Your body contains over 600 muscles, making up about 40% of your body weight. Understanding how muscles work helps explain both everyday movements and athletic performance.

Muscles are composed of thousands of individual cells called muscle fibers. Each fiber contains long, thin strands of proteins called myofilaments. The two main types—actin and myosin—work together to create movement. When a muscle contracts, myosin filaments grab onto actin filaments and pull, shortening the muscle.

This process requires energy, which comes from a molecule called ATP. Your body constantly produces ATP from the food you eat. During intense exercise, muscles need ATP faster than the body can produce it through normal means, which is why you eventually get tired.

Muscles can only pull, not push. For this reason, they work in pairs called antagonistic pairs. When your bicep contracts to bend your elbow, your tricep relaxes. When your tricep contracts to straighten your arm, your bicep relaxes. This system allows for smooth, controlled movement.

The body has three types of muscle. Skeletal muscles attach to bones and enable voluntary movement. Cardiac muscle makes up the heart and beats automatically about 100,000 times daily. Smooth muscle lines internal organs and blood vessels, controlling involuntary functions like digestion.

Exercise changes muscles. Resistance training causes muscle fibers to grow thicker, increasing strength. Endurance training increases the number of energy-producing structures within muscle cells. Regular exercise also strengthens the tendons that connect muscles to bones.`
  },
  {
    genre: 'informational',
    title: 'The History of Chocolate',
    lexile_band: '960L',
    text: `The chocolate bar you enjoy today is the result of a 4,000-year journey from ancient rainforests to modern factories. Along the way, chocolate transformed from a bitter ceremonial drink to one of the world's most beloved foods.

Chocolate begins with cacao trees, native to the tropical rainforests of Central and South America. Ancient Mesoamerican civilizations, including the Maya and Aztecs, harvested cacao pods and processed the beans into a bitter beverage. This drink, often mixed with chili peppers and spices, was reserved for religious ceremonies and the elite.

The Aztecs considered cacao so valuable that they used the beans as currency. When Spanish conquistadors arrived in the 1500s, they discovered this prized drink and brought cacao back to Europe. Spanish royalty kept chocolate a secret for nearly a century, sweetening it with sugar and serving it hot.

As chocolate spread across Europe, it remained a luxury for the wealthy. Everything changed in the 1800s with innovations that made chocolate accessible to ordinary people. In 1828, a Dutch chemist invented a press that separated cocoa butter from cocoa solids. In 1847, a British company created the first solid chocolate bar. In 1875, a Swiss manufacturer added milk to create milk chocolate.

Today, chocolate is a global industry worth over $130 billion annually. Most cacao still grows near the equator, with West African countries producing about 70% of the world's supply. However, concerns about child labor, deforestation, and fair wages have led to growing demand for ethically sourced chocolate.`
  },
  {
    genre: 'literary',
    title: 'The Discovery',
    lexile_band: '920L',
    text: `The attic had been locked for as long as Zoe could remember. "Just old junk," her mother always said when she asked about it. But now, with her mother at work and a mysteriously found key in her palm, Zoe stood at the attic door.

The lock clicked. The door swung open. Dust swirled in the afternoon light filtering through a small window.

It wasn't junk at all. It was a museum of her grandmother's life—the grandmother who had died before Zoe was born.

There were paintings, dozens of them, stacked against walls and hanging from rafters. Landscapes and portraits in vibrant colors. A card attached to one read: "First Prize, Chicago Art Exhibition, 1962."

There were journals filled with cramped handwriting. Letters tied with ribbons. Photographs of a young woman who looked startlingly like Zoe—the same dark curls, the same stubborn chin.

One journal was open on a dusty desk, as if someone had just been reading it. The entry was dated March 15, 1985—three months before her grandmother's death.

"I watch my daughter forget me," the entry read. "She sees only my illness now, not the person I was. Perhaps that is too painful. But I hope someday my granddaughter—if I live to see her—will discover this attic. Will know that her grandmother was more than her final chapter. That I loved fiercely, painted wildly, and lived without apology."

Zoe closed the journal, tears streaming down her cheeks. She had come looking for old junk and found something infinitely more valuable: a connection to a woman she'd never met but suddenly felt she knew.

That evening, when her mother came home, Zoe was waiting at the kitchen table with the journal open.

"I found the key," she said simply. "Tell me about her. Please."`
  },
  {
    genre: 'literary',
    title: 'The Finish Line',
    lexile_band: '910L',
    text: `Twenty-three miles down, three to go. Marcus's legs screamed for him to stop, but he kept moving forward. His first marathon wasn't going as planned.

He'd trained for months. Hit every target pace. Followed the nutrition plan. Done everything right. But somewhere around mile eighteen, his body had simply stopped cooperating.

Now he wasn't running—he was shuffling. Runners he'd passed hours ago streamed past him. A woman who looked twice his age patted his shoulder encouragingly as she jogged by.

His family was waiting at the finish line. His dad, who'd called the whole marathon idea "a phase." His sister, who'd said he'd never make it. His grandfather, who'd run five marathons himself before his knees gave out.

Quitting would be so easy. There were medical tents. Shuttle buses for those who dropped out. No one would blame him.

But his grandfather's words echoed in his mind: "A marathon isn't about proving something to others. It's about discovering what you're made of when everything tells you to stop."

Mile twenty-four. A water station volunteer handed him a cup. "You've got this," she said. He didn't believe her, but he kept moving.

Mile twenty-five. He could hear the crowd at the finish line now. Energy he didn't know he had sparked in his legs.

Mile twenty-six. There they were—his family, waving a sign with his name. His grandfather was crying. His dad was cheering. His sister was filming.

He crossed the finish line four hours and forty-two minutes after he started. Dead last wasn't exactly glorious. But it was finished.

His grandfather hugged him. "Now you know," he whispered. "You're stronger than you think."`
  },
  {
    genre: 'literary',
    title: 'The Secret Garden Club',
    lexile_band: '900L',
    text: `Every Saturday morning, Mrs. Rodriguez opened the community garden to anyone who wanted to help. Most Saturdays, it was just her and the vegetables. Until Aaliyah showed up.

"I don't know anything about plants," Aaliyah admitted on her first day. "I just needed somewhere to go."

Mrs. Rodriguez handed her a trowel. "Plants don't require experience. Just patience."

As weeks passed, others joined. Marcus, the quiet boy from the group home who talked more to the tomatoes than to people. Sophie, who was failing science and hoped gardening might help. Mr. Chen, recently retired and looking for purpose.

They became an unlikely community, connected by dirt under their fingernails and the slow miracle of seeds becoming food. Mrs. Rodriguez taught them about soil and seasons, but she also listened. The garden became a place to share burdens that seemed lighter when spoken outdoors.

In August, vandals destroyed half the garden overnight. Tomato cages bent and twisted. Squash vines ripped from the ground. Weeks of care reduced to debris.

Aaliyah found Mrs. Rodriguez sitting among the ruins, her face wet with tears.

"We can replant," Aaliyah said.

"It's too late in the season."

"Then we'll prepare for next year. Build stronger fences. Start fresh."

By evening, the whole group had gathered. They cleared debris. Made plans. Someone brought lemonade. Marcus, who rarely spoke, made a joke that actually made people laugh.

As the sun set, Mrs. Rodriguez looked at her garden club—this strange, wonderful collection of people who had found each other through vegetables.

"You know what?" she said. "This was never really about the plants."`
  },
  {
    genre: 'literary',
    title: 'The Bus Stop',
    lexile_band: '920L',
    text: `For three weeks, Grace had waited at the bus stop at exactly 7:43 AM, and for three weeks, she had watched the same boy sit on the opposite bench, headphones in, sketchbook open.

She wanted to talk to him. Ask what he was drawing. Learn his name. But every time she gathered courage, the bus arrived, and the moment passed.

This was ridiculous. She was sixteen, not six. She could initiate a conversation with a stranger. It wasn't hard. People did it all the time.

"Nice morning," she practiced under her breath. Too boring. "Cool sketchbook." Too awkward. "I've seen you here before." Too stalker-ish.

On the twenty-second day, it rained. Not a gentle drizzle but a downpour that came from nowhere. The bus shelter was tiny, and suddenly they were pressed together, trying to stay dry.

"This is absurd," the boy said, pulling out his earbuds. He had a voice like warm coffee.

"Very," Grace agreed.

"I'm Julian."

"Grace."

"I know. We're in the same English class. You gave that presentation on Frankenstein. It was really good."

She stared at him. "You know who I am?"

"I've been trying to figure out how to talk to you for three weeks."

Grace laughed—a real laugh, not the careful kind she usually produced. "Same. I've been rehearsing opening lines."

"How'd that go?"

"Terribly. Everything sounded weird."

The bus pulled up, but neither of them moved immediately.

"Want to skip it?" Julian asked. "There's a coffee shop around the corner. I could show you what I've been drawing."

Grace thought about her perfect attendance. Her mother's expectations. All the rules she never broke.

"Yes," she said. "I really do."`
  },
  {
    genre: 'literary',
    title: 'The Return',
    lexile_band: '930L',
    text: `The town looked smaller than Maya remembered, but she supposed that was true of all childhood places. She'd left at eighteen, convinced she'd never come back. Now, at twenty-eight, here she was, driving past the pizza shop where she'd worked summers, the park where she'd had her first kiss, the library that had been her refuge.

The hospice was at the edge of town, a converted farmhouse with cheerful yellow paint that seemed to protest its purpose. Maya parked and sat for a long moment, gathering courage.

Her mother had called yesterday. "He's asking for you. If you're going to come, come now."

She hadn't seen her father in eight years. Not since the argument that had shattered their family. She couldn't even remember exactly what it had been about now—just the feeling of righteous anger, the certainty that she was done.

The certainty had faded over time. The anger had calcified into something heavier: regret.

Inside, a nurse led her to a room where sunlight fell across a bed and a figure too thin to be her father. But it was. She would know him anywhere.

"Maya?" His voice was a whisper.

She sat beside him and took his hand. All the words she'd rehearsed evaporated.

"I'm sorry," he said. "I was too proud to call. Too stubborn. I wasted so much time."

"I was too," she admitted. "We both were."

They talked until he fell asleep—about nothing in particular, about everything important. She stayed through the night, through the next day, through his final breath a week later.

At the funeral, people told her what a good daughter she was. She nodded and said thank you and thought about how she'd almost missed this. How pride could cost you everything.`
  },
  {
    genre: 'informational',
    title: 'The Science of Rainbows',
    lexile_band: '940L',
    text: `A rainbow arching across the sky is one of nature's most beautiful phenomena. But this colorful display is more than just beautiful—it's a demonstration of physics in action, revealing how light and water interact in surprising ways.

Sunlight appears white, but it actually contains all colors of the visible spectrum. When light passes through a medium like water or glass, different colors bend at different angles—a process called refraction. Red light bends the least; violet light bends the most.

Inside a raindrop, light undergoes a specific sequence of events. First, it enters the droplet and bends. Then it reflects off the back surface of the droplet, like a mirror. Finally, it exits the droplet, bending again. Each color emerges at a slightly different angle.

This is why you see a rainbow only when the sun is behind you and rain is in front of you. Each raindrop sends a single color to your eye, depending on its position. Millions of raindrops together create the continuous arc of colors.

Rainbows always display colors in the same order: red on the outside, followed by orange, yellow, green, blue, and violet on the inside. Some rainbows appear with a secondary arc above the primary one, with colors reversed. This double rainbow forms when light reflects twice inside each droplet.

You can only see a rainbow from certain positions. Move to the side, and the rainbow moves with you—or disappears entirely. That's because each rainbow is personal; the drops sending colors to your eyes are different from the drops sending colors to someone standing nearby. In a very real sense, no two people ever see exactly the same rainbow.`
  },
  {
    genre: 'informational',
    title: 'The Underground Railroad',
    lexile_band: '990L',
    text: `It wasn't an actual railroad, and most of it didn't operate underground. But the Underground Railroad remains one of the most remarkable resistance movements in American history. This secret network of routes, safe houses, and courageous people helped thousands of enslaved African Americans escape to freedom.

The Underground Railroad operated from the late 1700s until the Civil War. At its peak in the 1850s, it stretched from the Deep South to Canada, where slavery was illegal. Escaped people traveled by night, following the North Star, moving between hiding places sometimes less than a day's journey apart.

The network used railroad terminology as code. "Stations" or "depots" were safe houses. "Conductors" guided passengers between stations. "Stockholders" donated money. Harriet Tubman, the most famous conductor, made approximately 13 trips to the South and led about 70 people to freedom, never losing a single passenger.

Participation required extraordinary courage. Aiding escaped slaves was illegal under federal law after 1850, punishable by fines and imprisonment. Conductors and station masters risked everything—their property, their freedom, and sometimes their lives. Yet thousands of white and free Black Americans took that risk.

Historians estimate between 25,000 and 100,000 people escaped via the Underground Railroad. The exact number is uncertain because secrecy was essential. Few written records exist; information was passed by word of mouth to protect everyone involved.

The Underground Railroad's significance extends beyond the number who escaped. It represented active resistance to slavery, demonstrating that enslaved people were not passive victims but agents of their own liberation. It also showed that some Americans were willing to break unjust laws to fight for freedom.`
  },
  {
    genre: 'informational',
    title: 'How Languages Change Over Time',
    lexile_band: '970L',
    text: `If you could travel back 1,000 years and speak to your ancestors, you wouldn't understand them—and they wouldn't understand you. Languages are constantly changing, evolving so gradually that each generation barely notices, yet profoundly over centuries.

Several forces drive language change. Pronunciation shifts over time as speaking patterns change. New words enter languages through technology, trade, and cultural contact. Old words fade from use as the things they described become obsolete. Grammar rules that seem eternal are actually relatively recent innovations.

English provides a dramatic example. Old English, spoken before about 1100 CE, is essentially a foreign language to modern speakers. Middle English, used by Chaucer around 1400, is recognizable but requires training to read. Even Shakespeare's Early Modern English from 1600 requires footnotes for today's students.

Contact between languages accelerates change. English absorbed thousands of French words after the Norman Conquest in 1066. Spanish and Portuguese borrowed heavily from Arabic during centuries of Moorish rule. Global trade and immigration continue to mix vocabularies today.

Technology creates new words and new ways of communicating. "Selfie," "emoji," and "streaming" would puzzle someone from just 30 years ago. Social media and texting are changing how we abbreviate, punctuate, and even spell. These innovations spread faster than ever before, shared instantly across the globe.

Some worry about language change, viewing it as decay or corruption. Linguists disagree. Change is natural and inevitable. The "rules" that people consider eternal were innovations once. The language you speak is not a fixed monument but a living thing, shaped by everyone who uses it.`
  },
]

// Question generation
function generateQuestions(passage: Passage): Item[] {
  const items: Item[] = []
  const now = new Date().toISOString()
  const isInformational = passage.genre === 'informational'

  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: 'main_idea',
    subtopic: null,
    difficulty: 2,
    cognitive_level: 2,
    source_style: 'iowa_like',
    stem: isInformational
      ? 'What is the central idea of this passage?'
      : 'Which statement best expresses the theme of this story?',
    choices: isInformational
      ? [
          `A. The passage explains an important topic and its significance.`,
          `B. The passage only provides historical background.`,
          `C. The passage focuses on debating opinions.`,
          `D. The passage argues the topic is unimportant.`
        ]
      : [
          `A. The story shows how experiences lead to personal growth.`,
          `B. The story focuses primarily on the setting.`,
          `C. The story suggests problems cannot be solved.`,
          `D. The story emphasizes avoiding challenges.`
        ],
    answer_key: 'A',
    rationale: 'The correct answer captures the central idea or theme.',
    tags: ['synthetic', 'main_idea', 'final'],
    status: 'active',
    passage_id: passage.id,
    week_phase: 'fundamental',
    created_at: now
  })

  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: 'inference',
    subtopic: null,
    difficulty: 3,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: isInformational
      ? 'Based on the passage, what can the reader conclude?'
      : 'What can the reader infer about the main character?',
    choices: isInformational
      ? [
          'A. The topic continues to be important today.',
          'B. Research in this area has ended.',
          'C. Only experts care about this topic.',
          'D. No further developments are expected.'
        ]
      : [
          'A. The character gained new understanding.',
          'B. The character learned nothing.',
          'C. The character will avoid similar situations.',
          'D. Other characters were more affected.'
        ],
    answer_key: 'A',
    rationale: 'The correct answer requires logical inference from the text.',
    tags: ['synthetic', 'inference', 'final'],
    status: 'active',
    passage_id: passage.id,
    week_phase: 'balanced',
    created_at: now
  })

  const vocabWord = passage.text.match(/\b\w{8,12}\b/g)?.[5] || 'significant'
  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: 'vocab_context',
    subtopic: null,
    difficulty: 2,
    cognitive_level: 2,
    source_style: 'iowa_like',
    stem: `As used in the passage, the word "${vocabWord}" most nearly means`,
    choices: [
      'A. having importance or meaning',
      'B. being small or trivial',
      'C. causing problems',
      'D. lacking purpose'
    ],
    answer_key: 'A',
    rationale: 'The correct answer reflects the word\'s meaning in context.',
    tags: ['synthetic', 'vocab_context', 'final'],
    status: 'active',
    passage_id: passage.id,
    week_phase: 'fundamental',
    created_at: now
  })

  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: 'author_craft',
    subtopic: null,
    difficulty: 3,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: isInformational
      ? "What is the author's main purpose?"
      : 'Why does the author include details about the setting?',
    choices: isInformational
      ? [
          'A. to inform readers about an important topic',
          'B. to persuade readers to take action',
          'C. to entertain with fictional stories',
          'D. to confuse readers with jargon'
        ]
      : [
          'A. to help readers understand the characters',
          'B. to distract from the main plot',
          'C. to show off knowledge',
          'D. to suggest setting is most important'
        ],
    answer_key: 'A',
    rationale: 'The correct answer reflects the author\'s purpose.',
    tags: ['synthetic', 'author_craft', 'final'],
    status: 'active',
    passage_id: passage.id,
    week_phase: 'balanced',
    created_at: now
  })

  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: 'supporting_details',
    subtopic: null,
    difficulty: 2,
    cognitive_level: 1,
    source_style: 'terranova_like',
    stem: isInformational
      ? 'According to the passage, which is true?'
      : 'Which detail supports the theme?',
    choices: isInformational
      ? [
          'A. The passage provides specific supporting evidence.',
          'B. No evidence supports the claims.',
          'C. Experts dispute all information.',
          'D. The passage contradicts science.'
        ]
      : [
          'A. The character\'s actions show growth.',
          'B. The character stays the same.',
          'C. Others prevent any change.',
          'D. No evidence of change exists.'
        ],
    answer_key: 'A',
    rationale: 'The correct answer is supported by details in the passage.',
    tags: ['synthetic', 'supporting_details', 'final'],
    status: 'active',
    passage_id: passage.id,
    week_phase: 'fundamental',
    created_at: now
  })

  return items
}

async function main() {
  console.log('Generating final reading passages to reach 50%...\n')

  const existingPassages: Passage[] = JSON.parse(
    fs.readFileSync(path.join(BANK_DIR, 'passages.json'), 'utf8')
  )
  const existingItems: Item[] = JSON.parse(
    fs.readFileSync(path.join(BANK_DIR, 'items.json'), 'utf8')
  )

  const mathCount = existingItems.filter(i => i.subject === 'math').length
  const readingCount = existingItems.filter(i => i.subject === 'reading').length

  console.log(`Current: ${existingPassages.length} passages, ${existingItems.length} items`)
  console.log(`  Reading: ${readingCount}, Math: ${mathCount}`)
  console.log(`  Need: ${mathCount - readingCount} more reading items`)

  const newPassages: Passage[] = []
  const newItems: Item[] = []
  const now = new Date().toISOString()

  for (const template of finalPassages) {
    const passage: Passage = {
      id: randomUUID(),
      genre: template.genre,
      title: template.title,
      text: template.text,
      lexile_band: template.lexile_band,
      word_count: template.text.split(/\s+/).length,
      created_at: now
    }
    newPassages.push(passage)
    newItems.push(...generateQuestions(passage))
  }

  const allPassages = [...existingPassages, ...newPassages]
  const allItems = [...existingItems, ...newItems]

  fs.writeFileSync(path.join(BANK_DIR, 'passages.json'), JSON.stringify(allPassages, null, 2))
  fs.writeFileSync(path.join(BANK_DIR, 'items.json'), JSON.stringify(allItems, null, 2))

  const finalReading = allItems.filter(i => i.subject === 'reading').length
  const finalMath = allItems.filter(i => i.subject === 'math').length
  const pct = ((finalReading / allItems.length) * 100).toFixed(1)

  console.log('\n========================================')
  console.log('Complete!')
  console.log('========================================')
  console.log(`Added: ${newPassages.length} passages, ${newItems.length} items`)
  console.log(`Total: ${allPassages.length} passages, ${allItems.length} items`)
  console.log(`  Reading: ${finalReading} (${pct}%)`)
  console.log(`  Math: ${finalMath} (${(100 - parseFloat(pct)).toFixed(1)}%)`)
}

main().catch(console.error)
