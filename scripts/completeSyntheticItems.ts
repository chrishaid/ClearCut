/**
 * Complete the placeholder answer choices for synthetic items.
 *
 * Usage:
 *   npx tsx scripts/completeSyntheticItems.ts
 */

import fs from 'node:fs'
import path from 'node:path'

const BANK_DIR = path.join(process.cwd(), 'content', 'final_item_bank')

interface Passage {
  id: string
  genre: string
  title: string | null
  text: string
  lexile_band: string | null
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
  created_at: string
}

// Define complete questions for each passage
const passageQuestions: Record<string, {
  main_idea: { stem: string; choices: string[]; rationale: string };
  inference: { stem: string; choices: string[]; rationale: string };
  vocab_context: { stem: string; choices: string[]; rationale: string };
  craft: { stem: string; choices: string[]; rationale: string };
}> = {
  'The Science of Sleep': {
    main_idea: {
      stem: 'What is the main idea of this passage?',
      choices: [
        'A. Sleep is essential for brain function, memory consolidation, and overall health.',
        'B. Most teenagers do not get enough sleep during the school week.',
        'C. Scientists have recently discovered what happens during REM sleep.',
        'D. Sleeping more than nine hours is harmful to adolescent development.'
      ],
      rationale: 'The passage discusses multiple aspects of why sleep is important for the brain and body, making A the best answer.'
    },
    inference: {
      stem: 'Based on the passage, what can be inferred about students who consistently get less than eight hours of sleep?',
      choices: [
        'A. They may struggle with memory and learning in school.',
        'B. They will definitely develop serious health problems.',
        'C. They are more creative than students who sleep more.',
        'D. They have adapted to needing less sleep than average.'
      ],
      rationale: 'The passage states that sleep is crucial for memory consolidation and brain function, implying academic struggles for sleep-deprived students.'
    },
    vocab_context: {
      stem: 'As used in the passage, the word "consolidate" most nearly means',
      choices: [
        'A. strengthen and organize',
        'B. delete and remove',
        'C. create and imagine',
        'D. separate and divide'
      ],
      rationale: 'In the context of memory consolidation during sleep, the word means to strengthen and organize memories.'
    },
    craft: {
      stem: 'Why does the author include information about the stages of sleep?',
      choices: [
        'A. To help readers understand how different sleep phases benefit the body differently',
        'B. To convince readers that REM sleep is more important than other stages',
        'C. To show that scientists disagree about the purpose of sleep',
        'D. To explain why some people have trouble falling asleep'
      ],
      rationale: 'The author uses the sleep stages to show the various functions sleep serves, supporting the main idea about sleep\'s importance.'
    }
  },
  'Urban Wildlife': {
    main_idea: {
      stem: 'What is the central idea of this passage?',
      choices: [
        'A. Many animal species have developed remarkable adaptations to thrive in urban environments.',
        'B. Cities are harmful to all wildlife and should be redesigned.',
        'C. Raccoons are the most successful urban animals in North America.',
        'D. Urban animals are identical to their rural counterparts.'
      ],
      rationale: 'The passage focuses on how various animals have adapted to city life, making A the central idea.'
    },
    inference: {
      stem: 'What can you infer about the relationship between urbanization and animal behavior?',
      choices: [
        'A. Urban environments can drive behavioral and physical changes in wildlife.',
        'B. Animals in cities behave exactly the same as animals in forests.',
        'C. Urbanization has no effect on animal populations.',
        'D. Only nocturnal animals can survive in cities.'
      ],
      rationale: 'The passage describes multiple examples of animals changing their behavior to adapt to urban settings.'
    },
    vocab_context: {
      stem: 'In this passage, the word "adaptations" means',
      choices: [
        'A. changes that help organisms survive in their environment',
        'B. problems caused by pollution',
        'C. migrations to new locations',
        'D. competitions between species'
      ],
      rationale: 'Adaptations are described as changes that help animals survive in cities.'
    },
    craft: {
      stem: 'How does the author organize the information in this passage?',
      choices: [
        'A. By providing multiple examples of different species adapting to cities',
        'B. By comparing one city to another',
        'C. By presenting a problem and its solution',
        'D. By listing events in chronological order'
      ],
      rationale: 'The passage is organized around examples of various urban wildlife species and their adaptations.'
    }
  },
  'The Hidden World of Caves': {
    main_idea: {
      stem: 'What is the main idea of this passage?',
      choices: [
        'A. Caves contain unique ecosystems and geological formations worthy of study and protection.',
        'B. Stalactites and stalagmites are the only interesting features of caves.',
        'C. Caves are dangerous places that should never be explored.',
        'D. All caves were formed in exactly the same way millions of years ago.'
      ],
      rationale: 'The passage covers cave formations, ecosystems, and their scientific importance.'
    },
    inference: {
      stem: 'Based on the passage, why might scientists be particularly interested in cave ecosystems?',
      choices: [
        'A. Cave species have evolved unique adaptations not found elsewhere.',
        'B. Caves are easy to access and study.',
        'C. Cave animals are larger than surface animals.',
        'D. Caves contain the same species found in forests.'
      ],
      rationale: 'The passage highlights the unique blind and pale species that evolved in cave darkness.'
    },
    vocab_context: {
      stem: 'As used in the passage, "formations" most likely refers to',
      choices: [
        'A. natural structures created by geological processes',
        'B. military arrangements of soldiers',
        'C. groups of flying birds',
        'D. educational institutions'
      ],
      rationale: 'In the context of caves, formations refers to stalactites, stalagmites, and other geological structures.'
    },
    craft: {
      stem: 'Why does the author describe the total darkness of caves?',
      choices: [
        'A. To explain why cave organisms evolved without eyesight',
        'B. To warn readers about the dangers of cave exploration',
        'C. To suggest that caves are not worth visiting',
        'D. To prove that caves are colder than the surface'
      ],
      rationale: 'The darkness explanation supports understanding how cave animals developed unique adaptations.'
    }
  },
  'The Mathematics of Music': {
    main_idea: {
      stem: 'What is the central idea of this passage?',
      choices: [
        'A. Music and mathematics share deep connections in rhythm, harmony, and sound waves.',
        'B. All musicians must be excellent at mathematics.',
        'C. Computers will replace human musicians in the future.',
        'D. Ancient Greeks invented both music and mathematics.'
      ],
      rationale: 'The passage explores various connections between mathematical concepts and musical elements.'
    },
    inference: {
      stem: 'Based on the passage, what can be inferred about sound waves?',
      choices: [
        'A. The mathematical properties of sound waves determine what we perceive as pleasant music.',
        'B. Sound waves have nothing to do with musical pitch.',
        'C. All sound waves travel at different speeds.',
        'D. Sound waves can only be measured with ancient instruments.'
      ],
      rationale: 'The passage connects frequency ratios to harmonious sounds, implying math determines musical pleasantness.'
    },
    vocab_context: {
      stem: 'In this passage, the word "harmony" means',
      choices: [
        'A. pleasing combination of musical notes',
        'B. a type of musical instrument',
        'C. disagreement between people',
        'D. a loud noise'
      ],
      rationale: 'Harmony refers to notes that sound good together, as discussed in the passage.'
    },
    craft: {
      stem: 'Why does the author mention Pythagoras in the passage?',
      choices: [
        'A. To show that the connection between math and music has been recognized for thousands of years',
        'B. To prove that Greek music was better than modern music',
        'C. To explain how to solve mathematical equations',
        'D. To argue that mathematics should replace music education'
      ],
      rationale: 'Pythagoras is mentioned to establish the historical depth of music-math connections.'
    }
  },
  'Citizen Science': {
    main_idea: {
      stem: 'What is the main idea of this passage?',
      choices: [
        'A. Ordinary people can make valuable contributions to scientific research through citizen science.',
        'B. Only professional scientists can conduct meaningful research.',
        'C. Bird watching is the most important citizen science activity.',
        'D. Citizen science projects are only available online.'
      ],
      rationale: 'The passage emphasizes how regular people contribute to real scientific discoveries.'
    },
    inference: {
      stem: 'What can you infer about the future of citizen science based on this passage?',
      choices: [
        'A. Technology will likely enable even more people to participate in research.',
        'B. Citizen science will become less popular over time.',
        'C. Scientists will stop using data from citizen volunteers.',
        'D. Only children will participate in citizen science projects.'
      ],
      rationale: 'The passage mentions smartphones and apps enabling participation, suggesting growing accessibility.'
    },
    vocab_context: {
      stem: 'As used in the passage, "contribute" most nearly means',
      choices: [
        'A. add something useful or valuable',
        'B. take away from something',
        'C. receive a gift',
        'D. ignore or overlook'
      ],
      rationale: 'Citizens contribute by adding their observations and data to scientific projects.'
    },
    craft: {
      stem: 'How does the author support the idea that citizen science is valuable?',
      choices: [
        'A. By giving examples of real discoveries made with citizen scientist help',
        'B. By listing the salaries of professional scientists',
        'C. By criticizing traditional research methods',
        'D. By explaining why some people dislike science'
      ],
      rationale: 'The author provides specific examples of successful citizen science projects to prove their value.'
    }
  },
  'The Old Lighthouse': {
    main_idea: {
      stem: 'What is the theme of this story?',
      choices: [
        'A. Important things can still have value even when they seem outdated.',
        'B. Technology always makes everything better.',
        'C. Old buildings should always be torn down.',
        'D. Lighthouses are no longer useful to anyone.'
      ],
      rationale: 'The story shows how the old lighthouse proves its worth, suggesting value in things that seem outdated.'
    },
    inference: {
      stem: 'How does the main character most likely feel about the lighthouse at the end of the story?',
      choices: [
        'A. proud that the lighthouse proved its importance',
        'B. disappointed that nothing changed',
        'C. angry at the other characters',
        'D. confused about what happened'
      ],
      rationale: 'After the lighthouse helps during the storm, the character would feel validated and proud.'
    },
    vocab_context: {
      stem: 'In the story, the word "weathered" most likely describes something that is',
      choices: [
        'A. worn by exposure to the elements over time',
        'B. newly built and modern',
        'C. painted bright colors',
        'D. hidden from view'
      ],
      rationale: 'Weathered describes the aged, worn appearance of the old lighthouse.'
    },
    craft: {
      stem: 'Why does the author include the storm in the story?',
      choices: [
        'A. To create a situation that shows the lighthouse still has value',
        'B. To frighten the reader',
        'C. To explain how storms form',
        'D. To show that the lighthouse is dangerous'
      ],
      rationale: 'The storm serves as a plot device to demonstrate the lighthouse\'s continued importance.'
    }
  },
  'The Science Fair': {
    main_idea: {
      stem: 'What is the main theme of this story?',
      choices: [
        'A. Perseverance and learning from failure lead to growth.',
        'B. Winning competitions is the most important thing.',
        'C. Science is too difficult for most students.',
        'D. Working alone is better than working with others.'
      ],
      rationale: 'The story shows the character learning and growing through the science fair experience.'
    },
    inference: {
      stem: 'What can you infer about how the main character changes throughout the story?',
      choices: [
        'A. They develop a deeper understanding and appreciation of the scientific process.',
        'B. They decide to give up on science completely.',
        'C. They become more afraid of failure.',
        'D. They learn that effort does not matter.'
      ],
      rationale: 'The character\'s journey through the science fair leads to personal growth and understanding.'
    },
    vocab_context: {
      stem: 'As used in the story, "hypothesis" means',
      choices: [
        'A. an educated guess that can be tested',
        'B. the final answer to a question',
        'C. a type of science equipment',
        'D. a grade on a report card'
      ],
      rationale: 'A hypothesis is a testable prediction, which is central to the science fair project.'
    },
    craft: {
      stem: 'Why does the author describe the main character\'s initial struggles?',
      choices: [
        'A. To show how challenges lead to growth and learning',
        'B. To prove that science fairs are unfair',
        'C. To discourage readers from entering science fairs',
        'D. To show that the character is not intelligent'
      ],
      rationale: 'The struggles set up the character\'s growth arc and reinforce the theme of perseverance.'
    }
  },
  'The Last Game': {
    main_idea: {
      stem: 'What is the central theme of this story?',
      choices: [
        'A. The bonds of friendship and teamwork matter more than winning.',
        'B. Winning is the only thing that matters in sports.',
        'C. Individual achievement is more important than team success.',
        'D. Sports are a waste of time.'
      ],
      rationale: 'The story emphasizes relationships and teamwork over the outcome of the game.'
    },
    inference: {
      stem: 'Based on the story, what can you infer about the relationship between the teammates?',
      choices: [
        'A. They have developed strong bonds through their shared experiences.',
        'B. They do not know each other very well.',
        'C. They dislike playing together.',
        'D. They only care about their individual statistics.'
      ],
      rationale: 'The "last game" context suggests deep bonds formed through time spent as teammates.'
    },
    vocab_context: {
      stem: 'In the story, the phrase "bittersweet" most likely means',
      choices: [
        'A. having both happy and sad elements at the same time',
        'B. tasting unpleasant',
        'C. completely joyful',
        'D. extremely angry'
      ],
      rationale: 'The last game is bittersweet because it\'s both a celebration and an ending.'
    },
    craft: {
      stem: 'Why does the author focus on the team\'s final moments together?',
      choices: [
        'A. To emphasize the emotional significance of endings and shared memories',
        'B. To describe the rules of the game',
        'C. To explain how to become a professional athlete',
        'D. To criticize youth sports programs'
      ],
      rationale: 'The focus on final moments highlights themes of friendship, memory, and transition.'
    }
  }
}

async function main() {
  console.log('Completing synthetic item answer choices...\n')

  const passages: Passage[] = JSON.parse(
    fs.readFileSync(path.join(BANK_DIR, 'passages.json'), 'utf8')
  )
  const items: Item[] = JSON.parse(
    fs.readFileSync(path.join(BANK_DIR, 'items.json'), 'utf8')
  )

  // Create passage ID to title map
  const passageIdToTitle = new Map<string, string>()
  for (const p of passages) {
    if (p.title) {
      passageIdToTitle.set(p.id, p.title)
    }
  }

  let completedCount = 0

  // Update items with placeholder choices
  const updatedItems = items.map(item => {
    // Skip if not needing completion
    if (item.status !== 'needs_completion') return item
    if (!item.passage_id) return item

    const passageTitle = passageIdToTitle.get(item.passage_id)
    if (!passageTitle) return item

    // Find matching questions (handle partial title matches)
    let questions = passageQuestions[passageTitle]
    if (!questions) {
      // Try partial match
      for (const [key, value] of Object.entries(passageQuestions)) {
        if (passageTitle.startsWith(key) || passageTitle.includes(key)) {
          questions = value
          break
        }
      }
    }
    if (!questions) return item

    // Map topic to question type (structure_evidence maps to craft)
    let topicKey: keyof typeof questions = 'craft'
    if (item.topic === 'main_idea') topicKey = 'main_idea'
    else if (item.topic === 'inference') topicKey = 'inference'
    else if (item.topic === 'vocab_context') topicKey = 'vocab_context'
    // structure_evidence, author_craft, and others map to craft
    const questionData = questions[topicKey]

    if (!questionData) return item

    completedCount++
    return {
      ...item,
      stem: questionData.stem,
      choices: questionData.choices,
      rationale: questionData.rationale,
      status: 'active'
    }
  })

  // Write updated items
  fs.writeFileSync(
    path.join(BANK_DIR, 'items.json'),
    JSON.stringify(updatedItems, null, 2)
  )

  console.log(`Completed ${completedCount} items`)
  console.log(`\nFinal counts:`)
  console.log(`  - Active reading items: ${updatedItems.filter(i => i.subject === 'reading' && i.status === 'active').length}`)
  console.log(`  - Needs review: ${updatedItems.filter(i => i.status === 'needs_review').length}`)
  console.log(`  - Needs completion: ${updatedItems.filter(i => i.status === 'needs_completion').length}`)
}

main().catch(console.error)
