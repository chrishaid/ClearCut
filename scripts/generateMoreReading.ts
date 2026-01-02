/**
 * Generate additional high-quality reading passages and items
 * to balance the math-heavy item bank.
 *
 * Target: ~300 new reading items (from ~100 to ~400)
 *
 * Usage:
 *   npx tsx scripts/generateMoreReading.ts
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
  subject: 'reading'
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
  created_at: string
}

// Informational passages covering various topics relevant to middle schoolers
const informationalPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'informational',
    title: 'The Great Pacific Garbage Patch',
    lexile_band: '1020L',
    text: `In the middle of the Pacific Ocean, far from any coastline, lies an environmental disaster that most people will never see. The Great Pacific Garbage Patch is a massive collection of marine debris—mostly plastic—that has accumulated in the North Pacific Subtropical Gyre, a system of rotating ocean currents.

Despite its name, the garbage patch is not a solid island of trash that you could walk across. Instead, it consists of millions of tiny plastic fragments suspended throughout the water column, creating a kind of "plastic soup." These microplastics are often smaller than a grain of rice, making them nearly impossible to see from a boat or even from satellite images.

The patch formed because of the way ocean currents work. The North Pacific Gyre acts like a giant slow-moving whirlpool, drawing in debris from coastlines across Asia and North America. Plastic items that enter the ocean—from fishing nets to bottle caps to grocery bags—eventually make their way to this central area, where they break down into smaller and smaller pieces but never fully decompose.

Scientists estimate that the Great Pacific Garbage Patch covers an area roughly twice the size of Texas, though its exact boundaries shift constantly with winds and currents. The amount of plastic in the patch has been growing exponentially since the 1970s, when plastic production began to surge worldwide.

The environmental impact is severe. Marine animals mistake plastic fragments for food, leading to starvation and death. Sea turtles eat plastic bags that resemble jellyfish, while seabirds feed colorful plastic pieces to their chicks. Microplastics have been found in the stomachs of fish that humans regularly consume, raising concerns about plastic entering our own food chain.

Several organizations are working on solutions. The Ocean Cleanup, founded by Dutch inventor Boyan Slat, has developed floating barriers that use ocean currents to collect plastic debris. However, most experts agree that the real solution lies in preventing plastic from entering the ocean in the first place. This requires changes in how we produce, use, and dispose of plastic products.`
  },
  {
    genre: 'informational',
    title: 'How Vaccines Train Your Immune System',
    lexile_band: '1050L',
    text: `Your immune system is like an army that protects your body from invaders. When harmful bacteria or viruses enter your body, specialized cells recognize these threats and mount a defense. But here's the remarkable part: your immune system has a memory. Once it defeats a particular invader, it remembers how to fight it, often for years or even a lifetime.

Vaccines take advantage of this immune memory in an ingenious way. Instead of waiting for you to get sick, vaccines introduce a harmless version of a pathogen—the disease-causing organism—to your immune system. This might be a weakened form of the virus, a killed version, or just a piece of it, like a protein from its outer shell.

When your immune system encounters this harmless impostor, it doesn't know the difference. It mounts a full response, creating antibodies specifically designed to neutralize that particular threat. More importantly, it creates memory cells that remain in your body, ready to spring into action if the real pathogen ever appears.

The process of developing immunity through vaccination typically takes a few weeks. During this time, your body is building its defenses. Some vaccines require multiple doses, given weeks or months apart, to build stronger and longer-lasting immunity. This is why you might receive booster shots for certain diseases.

The concept of vaccination dates back to 1796, when English doctor Edward Jenner noticed that milkmaids who had caught cowpox seemed protected from the much deadlier smallpox. He tested his theory by deliberately exposing a young boy to cowpox, then later to smallpox. The boy didn't get sick. Jenner had discovered that exposure to a related, milder disease could provide immunity to a more dangerous one.

Today, vaccines have eliminated smallpox entirely and have dramatically reduced cases of polio, measles, and many other diseases. Modern vaccine technology continues to advance, with new approaches like mRNA vaccines showing promise for treating not just infectious diseases but potentially cancer as well.`
  },
  {
    genre: 'informational',
    title: 'The Psychology of Color',
    lexile_band: '980L',
    text: `Walk into any fast-food restaurant, and you'll likely see a lot of red and yellow. Step into a hospital, and you'll find yourself surrounded by blues and greens. These color choices aren't random—they're based on decades of research into how colors affect human psychology and behavior.

Red is perhaps the most powerful color in terms of psychological impact. It increases heart rate and creates a sense of urgency. That's why sale signs are almost always red, and why fast-food chains use it to encourage quick eating and faster customer turnover. Red also stimulates appetite, making it a popular choice for food packaging and restaurant décor.

Blue, in contrast, has a calming effect. It lowers heart rate and blood pressure, which is why it's commonly used in healthcare settings. Blue also conveys trust and reliability, making it the favorite color of banks and technology companies. Studies show that people are more productive in blue rooms, which is why many offices incorporate this color.

Yellow captures attention faster than any other color—it's the first color the human eye notices. This makes it ideal for warning signs and taxi cabs. However, too much yellow can cause anxiety, which is why it's usually used as an accent rather than a dominant color.

Green represents nature and growth, creating feelings of balance and harmony. It's the easiest color for the eyes to process, reducing eye strain. This is why actors wait in "green rooms" before performances and why many schools paint classrooms in soft green tones.

Marketers and designers use this psychological research to influence our decisions in ways we rarely notice. The color of a product's packaging can affect whether we perceive it as luxurious or affordable, healthy or indulgent, traditional or modern. Understanding the psychology of color helps explain why we're drawn to certain products and spaces—and how businesses use this knowledge to shape our choices.`
  },
  {
    genre: 'informational',
    title: 'The Rise of Artificial Intelligence',
    lexile_band: '1030L',
    text: `In 1997, a computer called Deep Blue defeated world chess champion Garry Kasparov. It was the first time a machine had beaten a reigning world champion in chess, and many saw it as a turning point in the relationship between humans and computers. Yet Deep Blue, for all its chess mastery, couldn't hold a simple conversation or recognize a cat in a photograph.

Today's artificial intelligence systems can do both—and much more. They can translate languages, drive cars, diagnose diseases, and create original artwork. The rapid advancement of AI in recent years has sparked both excitement and concern about its impact on society.

Modern AI works differently from the rule-based systems of the past. Instead of being programmed with specific instructions for every situation, today's AI systems learn from data. A technique called machine learning allows computers to find patterns in massive datasets and use those patterns to make predictions or decisions. Deep learning, a subset of machine learning, uses artificial neural networks loosely inspired by the human brain.

The results have been remarkable. AI systems can now recognize faces more accurately than humans, predict weather patterns with unprecedented precision, and detect cancer in medical images that doctors might miss. Virtual assistants like Siri and Alexa can understand natural speech and respond appropriately.

However, AI also raises important questions. Who is responsible when an AI system makes a mistake? How do we ensure AI doesn't perpetuate biases present in its training data? What happens to jobs that AI can perform more efficiently than humans?

These questions don't have easy answers. As AI becomes more capable and widespread, society will need to develop new frameworks for understanding and regulating this powerful technology. The decisions we make now about how to develop and deploy AI will shape the world for generations to come.`
  },
  {
    genre: 'informational',
    title: 'The Secret Life of Honeybees',
    lexile_band: '960L',
    text: `A honeybee colony is one of nature's most sophisticated societies. Inside a single hive, tens of thousands of bees work together with a level of coordination that scientists are still working to fully understand. Each bee has a specific role, and the survival of the colony depends on every member doing its job.

At the center of the colony is the queen, the only bee capable of laying fertilized eggs. A healthy queen can lay up to 2,000 eggs per day during peak season. Despite her title, the queen doesn't actually rule the hive—her primary function is reproduction. She's fed and groomed by worker bees and rarely makes decisions about hive activities.

Worker bees, all female, make up the vast majority of the colony. Remarkably, a worker bee's job changes as she ages. Young workers start as nurse bees, caring for larvae and the queen. As they mature, they progress through roles including building honeycomb, processing nectar, guarding the hive entrance, and finally, foraging for pollen and nectar. This progression ensures that the colony always has bees performing every essential task.

Communication in the hive is sophisticated. When a forager discovers a good food source, she returns to the hive and performs a "waggle dance." The direction she moves indicates the direction of the food relative to the sun, while the duration of her waggling indicates the distance. Other bees watch and then fly directly to the location—a remarkable feat of symbolic communication.

Male bees, called drones, have only one purpose: to mate with queens from other colonies. They don't gather food, produce honey, or help with hive maintenance. After mating season, drones are typically expelled from the hive to conserve resources for winter.

Honeybees face numerous threats today, including pesticides, habitat loss, and diseases. Their decline is concerning not just for honey production but for agriculture—bees pollinate about one-third of the food we eat.`
  },
  {
    genre: 'informational',
    title: 'The Engineering Marvel of the Panama Canal',
    lexile_band: '1040L',
    text: `Before the Panama Canal opened in 1914, ships traveling between New York and San Francisco had to sail around the entire South American continent—a journey of about 13,000 miles. Today, they can cut through the narrow Isthmus of Panama, reducing the trip to just 5,000 miles. The canal is more than a shortcut; it's one of the greatest engineering achievements in human history.

The idea of a canal across Panama dates back to the 1500s, when Spanish explorers first recognized the isthmus as the narrowest point between the Atlantic and Pacific Oceans. However, the technology to build such a canal didn't exist until the late 1800s. The French made the first attempt in 1881, led by Ferdinand de Lesseps, the engineer who had successfully built the Suez Canal. But Panama presented far greater challenges.

The jungle terrain was brutal. Workers faced landslides, flooding, and equipment that constantly broke down in the tropical humidity. Worse, diseases like malaria and yellow fever killed thousands. The French effort collapsed in 1889, having lost an estimated 20,000 workers to disease and accidents.

The United States took over the project in 1904, armed with new knowledge about disease prevention. American doctors, particularly William Gorgas, launched massive campaigns to eliminate the mosquitoes that carried malaria and yellow fever. Workers drained swamps, installed screens, and sprayed oil on standing water. These efforts dramatically reduced disease rates and made completion possible.

The canal's design was ingenious. Rather than digging down to sea level—which would have been nearly impossible—engineers created a system of locks that raise and lower ships 85 feet as they pass through. Ships enter a lock chamber, which fills with water to lift them up, then empty to lower them back down on the other side.

Today, the Panama Canal handles about 14,000 ships per year, carrying 5% of world trade. A recent expansion project, completed in 2016, doubled the canal's capacity, allowing the massive container ships of modern commerce to pass through.`
  },
  {
    genre: 'informational',
    title: 'The Science of Memory',
    lexile_band: '1010L',
    text: `Why can you remember your first day of school but not what you had for lunch last Tuesday? The answer lies in how your brain processes and stores different types of memories. Understanding memory isn't just academically interesting—it can help you study more effectively and retain information longer.

Your brain doesn't store memories like files on a computer. Instead, memories are patterns of connections between neurons. When you experience something, neurons fire together, and the connections between them strengthen. The more often these neurons fire together, the stronger the memory becomes. This is the basis of the saying "neurons that fire together, wire together."

Scientists distinguish between several types of memory. Working memory is like a mental scratch pad, holding information for just a few seconds while you use it—like remembering a phone number long enough to dial it. Short-term memory can last minutes to hours. Long-term memory, when formed, can last a lifetime.

The transfer from short-term to long-term memory—called consolidation—doesn't happen automatically. It requires attention and repetition. This is why cramming the night before a test is less effective than studying a little bit each day over several weeks. Spaced repetition, reviewing information at increasing intervals, is one of the most effective study techniques known to science.

Sleep plays a crucial role in memory formation. During sleep, your brain replays the day's experiences, strengthening important memories and discarding irrelevant information. Studies show that students who sleep well after studying remember more than those who stay up late reviewing. Even a short nap can improve memory retention.

Emotion also affects memory powerfully. Events that trigger strong emotions—whether positive or negative—are remembered more vividly and durably than neutral events. This is why you might remember exactly where you were during a significant historical event but forget ordinary days entirely. Your brain has evolved to prioritize memories that might be important for survival.`
  },
  {
    genre: 'informational',
    title: 'Extreme Weather and Climate Change',
    lexile_band: '1000L',
    text: `In recent years, headlines about extreme weather have become increasingly common. Record-breaking heat waves, devastating hurricanes, unprecedented wildfires, and severe flooding seem to occur with growing frequency. Scientists are working to understand the connection between these events and the broader changes occurring in Earth's climate.

The basic science is well established. Human activities, primarily burning fossil fuels, have increased the concentration of carbon dioxide and other greenhouse gases in the atmosphere. These gases trap heat that would otherwise escape into space, causing Earth's average temperature to rise. Since 1880, global average temperature has increased by about 1.1 degrees Celsius (2 degrees Fahrenheit).

This seemingly small change has significant effects on weather patterns. A warmer atmosphere holds more moisture, which means more water is available for precipitation. When storms do occur, they often produce more intense rainfall. This helps explain why flooding events have become more severe in many regions.

Heat waves are perhaps the most direct consequence of rising temperatures. What was once a rare, extreme temperature is becoming more common. Cities that might have experienced dangerous heat every few decades are now seeing it every few years. Urban areas are particularly vulnerable due to the "heat island effect"—concrete and asphalt absorb and retain heat, making cities several degrees warmer than surrounding areas.

Hurricane intensity is also linked to warming. Hurricanes draw their energy from warm ocean water, so warmer seas can fuel more powerful storms. While the total number of hurricanes may not be increasing, the proportion of strong hurricanes (Category 4 and 5) appears to be growing.

Scientists use sophisticated computer models to study these connections. Attribution science, a relatively new field, can now estimate how much more likely a specific extreme weather event was made by climate change. This research helps communities plan for the future and underscores the importance of reducing greenhouse gas emissions.`
  },
  {
    genre: 'informational',
    title: 'The History of the Internet',
    lexile_band: '990L',
    text: `It's hard to imagine life without the internet, yet this technology that connects billions of people worldwide is less than 50 years old. The story of how the internet developed reveals a fascinating journey from a military research project to the global network we use today.

The internet's origins trace back to the Cold War. In the 1960s, the U.S. Department of Defense wanted a computer network that could survive a nuclear attack. Traditional networks had central hubs—if the hub was destroyed, the whole network failed. Researchers at ARPA (Advanced Research Projects Agency) developed a new approach: a decentralized network where data could take multiple paths to reach its destination.

ARPANET, launched in 1969, initially connected just four universities. The first message sent over the network was supposed to be "LOGIN," but the system crashed after just two letters, making "LO" the first word ever transmitted over what would become the internet. Despite this inauspicious start, the network grew steadily throughout the 1970s.

A crucial development came in 1983 when ARPANET adopted TCP/IP, the communication protocol that still underlies the internet today. This standardized how computers talked to each other, allowing different networks to connect and share data. The term "internet"—short for "interconnected networks"—came into use around this time.

The World Wide Web, invented by British scientist Tim Berners-Lee in 1989, transformed the internet from a tool for researchers into a medium for everyone. The web made it easy to create and link documents using a simple system of addresses (URLs) and formatting (HTML). When the first popular web browser, Mosaic, launched in 1993, internet use exploded.

Today, over 5 billion people use the internet—more than 60% of the world's population. From its origins as a military research project, the internet has become essential infrastructure for communication, commerce, education, and entertainment.`
  },
  {
    genre: 'informational',
    title: 'The Mysteries of Black Holes',
    lexile_band: '1060L',
    text: `Black holes are among the most mysterious objects in the universe. They're regions of space where gravity is so strong that nothing—not even light—can escape. Despite being invisible by definition, black holes have captivated scientists and the public alike, and recent discoveries have only deepened their mystique.

A black hole forms when a massive star dies. Throughout its life, a star maintains a balance between the outward pressure of nuclear fusion and the inward pull of gravity. When the star runs out of fuel, this balance collapses. For sufficiently massive stars, nothing can stop the collapse. Matter compresses into an infinitely dense point called a singularity, surrounded by an event horizon—the boundary beyond which escape is impossible.

The event horizon is not a physical surface but rather a point of no return. An astronaut falling into a black hole would cross the event horizon without noticing anything unusual at that moment. However, to an outside observer, the astronaut would appear to slow down, grow dim, and eventually freeze at the horizon due to the extreme warping of space and time.

Scientists classify black holes by mass. Stellar black holes, formed from collapsed stars, typically contain 10 to 24 times the mass of our sun. Supermassive black holes, found at the centers of galaxies, can contain millions or billions of solar masses. How supermassive black holes form remains an open question—they seem too large to have grown simply by absorbing nearby matter over cosmic time.

In 2019, astronomers released the first-ever image of a black hole—or rather, the glowing ring of superheated gas surrounding one. The image showed the supermassive black hole at the center of galaxy M87, located 55 million light-years away. Creating this image required linking radio telescopes around the world to form an Earth-sized virtual telescope.

Black holes continue to challenge our understanding of physics, particularly at their centers where the known laws of physics break down.`
  },
  // Add more informational passages
  {
    genre: 'informational',
    title: 'The Art and Science of Fermentation',
    lexile_band: '970L',
    text: `Long before humans understood bacteria or chemistry, they were practicing fermentation. This ancient process, which transforms simple ingredients into complex foods, gave us bread, cheese, yogurt, pickles, and countless other staples. Today, scientists are discovering that fermented foods may be crucial for human health.

Fermentation occurs when microorganisms—usually bacteria or yeast—break down sugars in the absence of oxygen. The byproducts of this process give fermented foods their distinctive flavors and textures. When yeast ferments the sugars in grape juice, it produces alcohol and carbon dioxide, creating wine. When bacteria ferment the lactose in milk, they produce lactic acid, turning milk into yogurt.

The history of fermentation is the history of human civilization. Archaeological evidence suggests that humans have been fermenting foods for at least 13,000 years. Ancient Egyptians brewed beer. Chinese cultures developed fermented soy products. Every traditional cuisine has its fermented foods, from Korean kimchi to German sauerkraut to Ethiopian injera bread.

Beyond flavor, fermentation serves practical purposes. Before refrigeration, fermentation was one of the few ways to preserve food. The acids and alcohols produced during fermentation prevent harmful bacteria from growing, keeping food safe to eat for months or even years. Fermentation also makes some nutrients more available and creates new ones, particularly B vitamins.

Recently, scientists have become interested in fermented foods for another reason: gut health. Your digestive system contains trillions of bacteria, collectively called the gut microbiome. Research suggests that this microbiome affects not just digestion but also immunity, mental health, and many other aspects of well-being. Fermented foods contain beneficial bacteria that may support a healthy microbiome.

This scientific interest has sparked a fermentation revival. Home fermentation has become popular, with people making their own kombucha, kefir, and fermented vegetables. Meanwhile, food scientists are developing new fermented products and studying traditional ones to understand their health benefits.`
  },
  {
    genre: 'informational',
    title: 'How Birds Navigate Thousands of Miles',
    lexile_band: '1020L',
    text: `Every autumn, billions of birds embark on journeys that would challenge the most sophisticated GPS systems. Arctic terns travel from pole to pole, a round trip of about 44,000 miles. Bar-tailed godwits fly non-stop from Alaska to New Zealand, covering 7,000 miles in nine days without food, water, or rest. How do these small creatures navigate such incredible distances?

Scientists have discovered that birds use multiple navigation systems, often simultaneously. The most important is the ability to sense Earth's magnetic field. Birds have specialized cells containing magnetite, a magnetic mineral, which act like tiny compasses. Research shows that birds can detect not just the direction of magnetic north but also the strength and angle of the magnetic field, giving them a kind of magnetic map.

The sun serves as another crucial navigation tool. Birds can determine direction by tracking the sun's movement across the sky. Remarkably, they can compensate for the sun's changing position throughout the day, maintaining accurate navigation from morning to evening. Some species can even navigate on cloudy days by detecting polarized light patterns invisible to human eyes.

At night, migratory birds switch to stellar navigation. Young birds appear to learn the pattern of stars around the North Star (or Southern Cross in the Southern Hemisphere) and use these constellations as a fixed reference point. Experiments in planetariums have shown that birds can be confused by altering the star patterns, confirming this celestial navigation ability.

Beyond these primary systems, birds also use landmarks, wind patterns, and even smell. Homing pigeons, for example, can recognize the unique odor signature of their home loft from miles away. Some seabirds can smell land from far out at sea.

What's most remarkable is how these systems work together. A bird might use the magnetic field for general direction, the sun or stars for more precise bearings, and landmarks for the final approach to its destination. This redundancy ensures navigation accuracy even when conditions make one system unreliable.`
  }
]

// Literary passages - fictional stories
const literaryPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'literary',
    title: 'The Photograph',
    lexile_band: '920L',
    text: `Maya found the photograph wedged between the pages of her grandmother's recipe book. It was yellowed and creased, showing a young woman who looked startlingly like Maya herself—the same dark eyes, the same stubborn set to the jaw.

"Grandma, who is this?" Maya asked, holding up the photograph.

Her grandmother set down her mixing bowl and wiped her hands on her apron. For a long moment, she said nothing, just looked at the photograph with an expression Maya couldn't read.

"That's my mother," she finally said. "Your great-grandmother Rosa. I haven't seen that picture in forty years."

Maya studied the photograph more closely. Rosa stood in front of a small wooden house, her hand resting on a bicycle. She wore a simple dress, but she held herself with an unmistakable dignity. There was something fierce in her expression, as if she were daring the photographer to find her inadequate.

"She was seventeen there," Grandma continued, her voice taking on a distant quality. "Just a year older than you are now. That was right before she left for the city."

"Why did she leave?" Maya asked.

"Because staying would have meant accepting a life she didn't want. Everyone in her village expected her to marry young, to spend her life cooking and cleaning and raising children. Rosa wanted more."

Grandma took the photograph from Maya's hands and held it gently, as if it might crumble at her touch.

"She walked thirty miles to the nearest train station. She had no money, no connections, nothing but her determination. People said she was foolish, that she would fail. But she didn't fail. She worked her way through night school, became a teacher, and eventually started the school where I learned to read."

Maya looked at the photograph with new understanding. This wasn't just a picture of a stranger from the past. This was a reminder that courage ran in her family like a river, passing from generation to generation.`
  },
  {
    genre: 'literary',
    title: 'The Bridge',
    lexile_band: '950L',
    text: `The old rope bridge swayed in the wind, stretching across the gorge like a fraying promise. Jason stood at its edge, gripping the wooden post until his knuckles went white.

"It's perfectly safe," called Chen from the other side, her voice barely carrying over the rush of the river below. "I've crossed it a hundred times."

But Jason couldn't move. Far below, the water churned white around black rocks, and the bridge's wooden planks looked impossibly thin, impossibly old. He'd been fine during the entire hike—the steep trails, the narrow ledges—but something about this bridge paralyzed him.

"I can't," he called back, his voice cracking on the words.

Chen's expression softened. She walked back across the bridge as casually as if it were a sidewalk and stopped an arm's length from Jason.

"What's really going on?" she asked quietly.

For a long moment, Jason said nothing. Then the words came out in a rush. "My dad used to take me hiking when I was little. He always said we'd cross the big suspension bridge at Eagle Falls together when I was old enough. But then..." He couldn't finish.

Chen nodded slowly. "And he didn't get the chance."

"Cancer," Jason said flatly. "Three years ago."

They stood in silence, the wind tugging at their clothes. Then Chen reached out and took his hand.

"You don't have to cross," she said. "But if you want to, I'll be right beside you. One step at a time."

Jason looked at the bridge, then at Chen, then at the vast sky beyond. His father had always said that courage wasn't about not being afraid—it was about walking forward anyway. He took a deep breath.

"One step at a time," he repeated.

Together, hand in hand, they began to cross.`
  },
  {
    genre: 'literary',
    title: 'The Garden',
    lexile_band: '900L',
    text: `When the new family moved in next door, Amara watched from her window with suspicion. The house had been empty for two years, and she'd grown used to its silence, its overgrown garden a perfect buffer between her home and the world.

Now a girl her age was in that garden, pulling weeds with fierce determination. The girl had pale skin that burned pink in the sun and hair the color of dried wheat. She looked nothing like Amara, nothing like anyone in this neighborhood.

Amara's mother appeared beside her. "Why don't you go introduce yourself?"

"I don't want to," Amara said automatically.

"Amara." Her mother's voice carried a familiar note of gentle warning. "Remember when we moved here? Remember how lonely you felt until Mrs. Thompson invited us over for cookies?"

Amara remembered. She remembered feeling like an outsider, convinced that no one would ever understand her. She hadn't wanted to go to Mrs. Thompson's house either.

Reluctantly, she walked outside and approached the fence. The girl looked up, pushing sweaty hair from her forehead.

"I'm Lily," she said before Amara could speak. "We just moved from Iowa. I don't know anybody here. Also, I have no idea what I'm doing with these plants. Are these weeds or flowers?"

Despite herself, Amara felt her lips twitch. The girl was pulling up her mother's carefully planted herbs.

"Those are mint plants," Amara said. "My mom grows the same ones."

Lily looked horrified. "Oh no. I've already pulled up like thirty of them."

"My mom can give you new ones. She says they grow like weeds anyway."

Lily's face broke into a relieved smile. "Really? That would be amazing. Do you want to come help me figure out what not to destroy? I have lemonade."

Amara hesitated for just a moment. Then she climbed over the fence.`
  },
  {
    genre: 'literary',
    title: 'The Storm',
    lexile_band: '940L',
    text: `The weather alert had said severe thunderstorms, but nothing had prepared them for the reality. Lightning cracked across the sky like electric veins, and rain hammered the windows so hard that Marcus could barely hear his mother's voice.

"The basement," she shouted. "Now!"

Marcus grabbed his emergency bag—the one his scout leader had made him pack—and followed his mother and sister down the stairs. The basement was cold and smelled of old paint, but it was solid concrete, the safest place in the house.

His sister Emily clutched her stuffed rabbit, eyes wide. She was only seven, and every crash of thunder made her flinch. Marcus remembered being that afraid once, back when storms were monsters he didn't understand.

"Hey, Em," he said, sitting beside her. "Want me to teach you the thunder trick?"

She nodded, rabbit pressed against her chest.

"Okay, when you see lightning, you count the seconds until you hear thunder. Every five seconds means the storm is one mile away. Let's try."

Lightning flashed through the small basement window. Marcus counted out loud with Emily. "One Mississippi, two Mississippi, three Mississippi—"

Thunder cracked. Emily jumped but then looked at Marcus with wonder.

"Three seconds. Does that mean it's really close?"

"Less than a mile. But watch what happens."

They counted through the next flash. Five seconds this time. Then seven. Emily started to smile.

"It's moving away!"

"Exactly. Storms seem scary because they're loud and bright, but they're just weather. They always pass."

His mother caught his eye from across the basement and smiled—that particular smile that meant she was proud of him. Marcus felt warmth spread through his chest despite the cold room.

When they finally emerged an hour later, the air smelled fresh and clean, and a rainbow arched across the clearing sky.`
  },
  {
    genre: 'literary',
    title: 'The Letter',
    lexile_band: '960L',
    text: `Sofia had carried the letter in her backpack for three weeks, unopened. Every day she told herself she would read it after school. Every day she found some excuse not to.

The envelope was cream-colored, her name written in her father's careful handwriting. He'd given it to her at the airport, pressing it into her hands with instructions: "Read this when you feel ready."

That had been a month ago, when he'd dropped her off to live with her aunt while he deployed overseas for a year. A whole year without seeing him. The thought still made her chest tight.

She sat on her bed now, turning the envelope over in her hands. Her aunt had said that her father called today, but Sofia had been at soccer practice. She'd tried calling back, but the connection overseas was unreliable. Now it was night there, and he'd be asleep.

The letter felt heavier than paper should feel.

Finally, she slid her finger under the flap.

"Dear Sofia," her father had written. "If you're reading this, it means you were brave enough to open it. That doesn't surprise me—you've always been braver than you know.

"I want you to understand something. Leaving you isn't something I wanted to do. It's something I needed to do. Serving my country means being away sometimes, but it doesn't mean I love you any less. Distance doesn't change what we are to each other.

"I know this year will be hard. There will be days when you miss me so much it hurts. But I also know you're strong enough to handle it. You come from a long line of strong women—your grandmother waited for your grandfather during two deployments. Your mother handled everything with grace when I was away.

"You have that same strength in you, even if you can't feel it yet.

"I'll be counting the days until I see you again. Love, Dad."

Sofia read the letter three more times, tears running down her cheeks. Then she carefully folded it and placed it under her pillow—close enough to touch whenever she needed it.`
  },
  {
    genre: 'literary',
    title: 'The Competition',
    lexile_band: '930L',
    text: `Darius had practiced his speech so many times that the words had lost all meaning. The national debate championship was in two hours, and his brain felt like overcooked pasta.

"You're going to wear a hole in that carpet," observed his teammate Priya, not looking up from her notes.

"I can't remember my opening line," Darius said, still pacing. "It's just gone. Vanished."

Priya finally looked at him, her expression thoughtful. "What's the first speech you ever gave?"

"What? I don't know, something in fifth grade—"

"About what?"

Darius stopped pacing. "About why we should have a longer recess. I made charts and everything."

"Did you practice that one until your brain turned to pasta?"

"No. I just really wanted longer recess."

Priya smiled. "Exactly. You weren't thinking about performing. You were thinking about what you wanted to say and why it mattered."

Darius sank into a chair. She was right. Somewhere along the way, this had stopped being about the topic—universal basic income—and started being about not looking stupid in front of three hundred people.

"When did you stop caring about winning and start caring about not losing?" Priya asked.

The question hit Darius like cold water. That was exactly what had happened. He'd been so focused on not making mistakes that he'd forgotten why he'd joined the debate team in the first place: because he loved the thrill of building an argument, of changing minds with words.

"Thanks," he said.

"For what?"

"For reminding me that this is supposed to be fun."

Two hours later, standing at the podium, Darius didn't think about his opening line. He thought about a world where everyone had enough to live on, about the faces in the audience that might be convinced. He thought about why this mattered.

The words came naturally after that.`
  },
  {
    genre: 'literary',
    title: 'The New Student',
    lexile_band: '910L',
    text: `On her first day at Lincoln Middle School, Zara accidentally walked into the boys' bathroom.

She didn't realize it until a sixth grader started screaming, which brought a teacher running, which meant that by lunch, everyone knew her as "the bathroom girl." Not exactly the first impression she'd hoped for.

"Mind if I sit here?" someone asked.

Zara looked up from her untouched lunch. A boy with a kind face and paint-stained fingers gestured at the empty seat across from her.

"I'm not contagious," she muttered.

"Good, because I just got over a cold and I'm not ready for another one." He sat down and opened his lunch bag. "I'm Marcus. I heard about this morning."

Zara felt her cheeks burn. "Great."

"Don't worry. Last year, I sneezed so hard during a spelling bee that I accidentally said a bad word into the microphone. It was broadcast to the whole school."

Despite herself, Zara laughed. "You're making that up."

"I wish I was. The word was 'situation.' I was so nervous, and then I felt the sneeze coming, and..." He shook his head. "My parents still bring it up at family dinners."

"That's terrible."

"It was! But now it's just a funny story. Yours will be too, eventually." He took a bite of his sandwich. "The trick is to do something memorable that isn't embarrassing. Then people forget the first thing."

"Like what?"

Marcus thought for a moment. "What are you good at?"

"I don't know. Drawing, I guess."

His face lit up. "The art show is next month. Mrs. Chen is always looking for new entries. If you win a prize, nobody will remember which bathroom you walked into."

For the first time that day, Zara felt hope kindle in her chest. Maybe this school wouldn't be so bad after all.`
  },
  {
    genre: 'literary',
    title: 'The Inheritance',
    lexile_band: '980L',
    text: `The house looked exactly as Kenji remembered it, except smaller. Everything from childhood looks smaller when you return as a teenager, he supposed. But walking through his grandfather's house for the last time felt like wandering through a museum of memories.

His mother moved through the rooms efficiently, boxing things for donation or trash. But Kenji lingered, touching objects that held invisible weight: the armchair where Grandfather had taught him shogi, the window where they'd watched thunderstorms, the kitchen where Grandfather had made terrible pancakes every Saturday morning.

"Kenji," his mother called. "I found something for you."

He followed her voice to Grandfather's study, a room he'd rarely been allowed to enter as a child. His mother held a wooden box, its surface worn smooth by years of handling.

"He wanted you to have this," she said.

Inside the box was a collection of letters, a faded photograph, and a small silk pouch. Kenji opened the pouch and found his grandfather's old watch—the one with the cracked face that had stopped working decades ago.

"It doesn't even tell time anymore," Kenji said, confused.

His mother smiled. "Read the letters."

The letters were in Japanese, written in Grandfather's precise hand. They told a story Kenji had never heard: how Grandfather had carried this watch through the war, how it had stopped the day he met Grandmother, how he'd kept it ever since as a reminder that some moments are worth stopping time for.

The last letter was addressed to Kenji directly.

"Time only moves forward," Grandfather had written, "but memory lets us return to the moments that matter. This watch stopped on the happiest day of my life. I hope you find a moment worth stopping for too."

Kenji closed his hand around the watch. It was heavy with more than metal—heavy with story, with love, with the weight of being trusted with someone's most precious possession.`
  }
]

// Question templates for different types
function generateQuestions(passage: Passage): Item[] {
  const items: Item[] = []
  const now = new Date().toISOString()
  const isInformational = passage.genre === 'informational'

  // Main Idea question
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
    choices: generateMainIdeaChoices(passage),
    answer_key: 'A',
    rationale: 'The correct answer captures the central idea or theme that connects all parts of the passage.',
    tags: ['synthetic', 'main_idea'],
    status: 'active',
    passage_id: passage.id,
    created_at: now
  })

  // Inference question
  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: 'inference',
    subtopic: null,
    difficulty: 3,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: isInformational
      ? 'Based on the information in the passage, what can the reader conclude?'
      : 'What can the reader infer about the main character?',
    choices: generateInferenceChoices(passage),
    answer_key: 'A',
    rationale: 'The correct answer is supported by evidence in the passage but requires the reader to make a logical inference.',
    tags: ['synthetic', 'inference'],
    status: 'active',
    passage_id: passage.id,
    created_at: now
  })

  // Vocabulary question
  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: 'vocab_context',
    subtopic: null,
    difficulty: 2,
    cognitive_level: 2,
    source_style: 'iowa_like',
    stem: generateVocabStem(passage),
    choices: generateVocabChoices(passage),
    answer_key: 'A',
    rationale: 'The correct answer reflects the meaning of the word as used in the context of the passage.',
    tags: ['synthetic', 'vocab_context'],
    status: 'active',
    passage_id: passage.id,
    created_at: now
  })

  // Author's purpose / Text structure question
  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: 'author_craft',
    subtopic: null,
    difficulty: 3,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: isInformational
      ? "What is the author's main purpose in writing this passage?"
      : 'Why does the author include the detail about the setting?',
    choices: generateCraftChoices(passage),
    answer_key: 'A',
    rationale: "The correct answer reflects the author's intent and purpose in constructing the passage.",
    tags: ['synthetic', 'author_craft'],
    status: 'active',
    passage_id: passage.id,
    created_at: now
  })

  // Supporting details question
  items.push({
    id: randomUUID(),
    subject: 'reading',
    topic: 'supporting_details',
    subtopic: null,
    difficulty: 2,
    cognitive_level: 1,
    source_style: 'terranova_like',
    stem: isInformational
      ? 'According to the passage, which of the following is true?'
      : 'Which detail from the story supports the idea that the character changed?',
    choices: generateDetailChoices(passage),
    answer_key: 'A',
    rationale: 'The correct answer is directly stated or supported by specific details in the passage.',
    tags: ['synthetic', 'supporting_details'],
    status: 'active',
    passage_id: passage.id,
    created_at: now
  })

  return items
}

// Helper functions to generate contextual choices
function generateMainIdeaChoices(passage: Passage): string[] {
  const titleWords = passage.title.toLowerCase()

  if (passage.genre === 'informational') {
    if (titleWords.includes('garbage') || titleWords.includes('plastic')) {
      return [
        'A. The Great Pacific Garbage Patch is a growing environmental problem caused by ocean currents collecting plastic debris.',
        'B. Ocean currents move in circular patterns around the Pacific Ocean.',
        'C. Plastic production increased dramatically in the 1970s.',
        'D. Marine animals are dying at an alarming rate in all oceans.'
      ]
    } else if (titleWords.includes('vaccine') || titleWords.includes('immune')) {
      return [
        'A. Vaccines protect against disease by training the immune system to recognize pathogens without causing illness.',
        'B. Edward Jenner was the first person to study diseases.',
        'C. The immune system contains many different types of cells.',
        'D. Cowpox and smallpox are caused by similar viruses.'
      ]
    } else if (titleWords.includes('color')) {
      return [
        'A. Colors have psychological effects that businesses use to influence our decisions and feelings.',
        'B. Red is the most popular color for restaurant decorations.',
        'C. Scientists study color preferences in laboratory settings.',
        'D. Different cultures have different favorite colors.'
      ]
    } else if (titleWords.includes('artificial') || titleWords.includes('intelligence') || titleWords.includes('ai')) {
      return [
        'A. Artificial intelligence has advanced rapidly and raises important questions about its impact on society.',
        'B. Deep Blue was a famous computer that played chess.',
        'C. Computers can now recognize faces in photographs.',
        'D. Machine learning was invented in the 1990s.'
      ]
    } else if (titleWords.includes('bee') || titleWords.includes('honeybee')) {
      return [
        'A. Honeybee colonies are highly organized societies where each bee has specific roles that change throughout its life.',
        'B. Queen bees are the largest bees in a colony.',
        'C. Bees produce honey by processing nectar from flowers.',
        'D. Worker bees can live for several months during winter.'
      ]
    } else if (titleWords.includes('canal') || titleWords.includes('panama')) {
      return [
        'A. The Panama Canal is an engineering marvel that required overcoming immense challenges to connect two oceans.',
        'B. Ships can travel faster through the Panama Canal than around South America.',
        'C. The French were the first to attempt building a canal across Panama.',
        'D. The canal uses a system of locks to raise and lower ships.'
      ]
    } else if (titleWords.includes('memory')) {
      return [
        'A. Memory formation is a complex process that can be improved through effective study strategies.',
        'B. Neurons are specialized cells found only in the brain.',
        'C. Short-term memory lasts for a few minutes.',
        'D. Sleep is important for physical health.'
      ]
    } else if (titleWords.includes('weather') || titleWords.includes('climate')) {
      return [
        'A. Climate change is causing more frequent and intense extreme weather events.',
        'B. Hurricanes are the most dangerous type of storm.',
        'C. Global temperatures have increased slightly over the past century.',
        'D. Scientists use computer models to predict weather.'
      ]
    } else if (titleWords.includes('internet')) {
      return [
        'A. The internet evolved from a military research project into an essential global communication network.',
        'B. ARPANET connected four universities in 1969.',
        'C. Tim Berners-Lee invented the World Wide Web.',
        'D. More than half the world population uses the internet.'
      ]
    } else if (titleWords.includes('black hole')) {
      return [
        'A. Black holes are mysterious objects that challenge our understanding of physics.',
        'B. Nothing can escape from a black hole, including light.',
        'C. Black holes form when massive stars die.',
        'D. Scientists recently photographed a black hole for the first time.'
      ]
    } else if (titleWords.includes('ferment')) {
      return [
        'A. Fermentation is an ancient process that transforms food and may provide important health benefits.',
        'B. Yeast produces alcohol when it breaks down sugar.',
        'C. Many cultures have traditional fermented foods.',
        'D. The gut microbiome affects human health.'
      ]
    } else if (titleWords.includes('bird') || titleWords.includes('navigate')) {
      return [
        'A. Birds use multiple sophisticated navigation systems to complete their remarkable migrations.',
        'B. Arctic terns travel farther than any other bird species.',
        'C. Birds can sense Earth\'s magnetic field.',
        'D. Some birds navigate using the stars at night.'
      ]
    }
  } else {
    // Literary passages
    if (titleWords.includes('photograph')) {
      return [
        'A. Family history can inspire courage and determination in younger generations.',
        'B. Old photographs should be preserved carefully.',
        'C. Grandmothers often have interesting stories to tell.',
        'D. Moving to a new city is always difficult.'
      ]
    } else if (titleWords.includes('bridge')) {
      return [
        'A. Facing fears is easier when we have support from others.',
        'B. Hiking can be dangerous without proper equipment.',
        'C. Rope bridges should be inspected regularly for safety.',
        'D. Grief affects people in different ways.'
      ]
    } else if (titleWords.includes('garden')) {
      return [
        'A. First impressions can change when we give others a chance.',
        'B. Gardening requires knowledge of different plant species.',
        'C. Moving to a new neighborhood is often lonely.',
        'D. Neighbors should always introduce themselves.'
      ]
    } else if (titleWords.includes('storm')) {
      return [
        'A. Knowledge and compassion can help transform fear into understanding.',
        'B. Basements are the safest place during thunderstorms.',
        'C. Older siblings should protect younger ones.',
        'D. Weather alerts should always be taken seriously.'
      ]
    } else if (titleWords.includes('letter')) {
      return [
        'A. Written words can provide comfort and connection across distance.',
        'B. Military families face unique challenges.',
        'C. Letters should be opened promptly.',
        'D. Moving to live with relatives is always difficult.'
      ]
    } else if (titleWords.includes('competition') || titleWords.includes('debate')) {
      return [
        'A. Success comes from focusing on purpose rather than fear of failure.',
        'B. Debate competitions require extensive practice.',
        'C. Teamwork is essential in competitive events.',
        'D. Public speaking is difficult for most people.'
      ]
    } else if (titleWords.includes('new student')) {
      return [
        'A. Embarrassing moments can become opportunities for new friendships.',
        'B. Middle school is challenging for everyone.',
        'C. Art shows provide opportunities for recognition.',
        'D. First days at new schools are always awkward.'
      ]
    } else if (titleWords.includes('inheritance')) {
      return [
        'A. Objects can carry meaning beyond their practical value when connected to loved ones.',
        'B. Watches make meaningful gifts.',
        'C. Cleaning out a relative\'s house is sad work.',
        'D. Letters should be written to family members.'
      ]
    }
  }

  // Default fallback
  return [
    'A. The passage presents important information about its main topic and its significance.',
    'B. The topic discussed has been studied for many years.',
    'C. There are different perspectives on the subject.',
    'D. More research is needed to fully understand this topic.'
  ]
}

function generateInferenceChoices(passage: Passage): string[] {
  if (passage.genre === 'informational') {
    return [
      'A. The topic will continue to be important in the future.',
      'B. Most people are already familiar with this subject.',
      'C. Scientists have reached complete agreement on this issue.',
      'D. This topic only affects certain geographic regions.'
    ]
  } else {
    return [
      "A. The main character has grown or changed by the end of the story.",
      "B. The character will continue to face the same problems.",
      "C. The events of the story had little impact on the character.",
      "D. The character regrets the decisions they made."
    ]
  }
}

function generateVocabStem(passage: Passage): string {
  const vocabWords: Record<string, string> = {
    'garbage': 'accumulated',
    'vaccine': 'ingenious',
    'color': 'psychological',
    'artificial': 'remarkable',
    'bee': 'sophisticated',
    'canal': 'ingenious',
    'memory': 'consolidation',
    'weather': 'unprecedented',
    'internet': 'crucial',
    'black hole': 'captivated',
    'ferment': 'distinctive',
    'bird': 'sophisticated',
    'photograph': 'determination',
    'bridge': 'paralyzed',
    'garden': 'suspicion',
    'storm': 'solid',
    'letter': 'reluctantly',
    'competition': 'determination',
    'student': 'contagious',
    'inheritance': 'precious'
  }

  for (const [key, word] of Object.entries(vocabWords)) {
    if (passage.title.toLowerCase().includes(key)) {
      return `As used in the passage, the word "${word}" most nearly means`
    }
  }

  return 'As used in the passage, the word "significant" most nearly means'
}

function generateVocabChoices(passage: Passage): string[] {
  const titleLower = passage.title.toLowerCase()

  if (titleLower.includes('garbage') || titleLower.includes('accumulated')) {
    return [
      'A. collected over time',
      'B. scattered randomly',
      'C. carefully organized',
      'D. quickly removed'
    ]
  } else if (titleLower.includes('vaccine') || titleLower.includes('ingenious')) {
    return [
      'A. clever and inventive',
      'B. simple and basic',
      'C. old and traditional',
      'D. expensive and rare'
    ]
  } else if (titleLower.includes('sophisticated')) {
    return [
      'A. complex and advanced',
      'B. simple and basic',
      'C. old-fashioned',
      'D. unpredictable'
    ]
  } else if (titleLower.includes('photograph')) {
    return [
      'A. strong resolve to achieve a goal',
      'B. uncertainty about the future',
      'C. anger at unfair treatment',
      'D. sadness about the past'
    ]
  } else if (titleLower.includes('bridge')) {
    return [
      'A. unable to move due to fear',
      'B. physically injured',
      'C. deeply confused',
      'D. extremely tired'
    ]
  }

  return [
    'A. important and meaningful',
    'B. small and minor',
    'C. confusing and unclear',
    'D. temporary and brief'
  ]
}

function generateCraftChoices(passage: Passage): string[] {
  if (passage.genre === 'informational') {
    return [
      'A. to inform readers about an important topic',
      'B. to persuade readers to take specific action',
      'C. to entertain readers with an interesting story',
      'D. to express personal opinions about current events'
    ]
  } else {
    return [
      'A. to create a specific mood and help readers understand the characters',
      'B. to provide scientific accuracy about the location',
      'C. to show that the author visited this place personally',
      'D. to compare this setting to other familiar places'
    ]
  }
}

function generateDetailChoices(passage: Passage): string[] {
  if (passage.genre === 'informational') {
    return [
      'A. The passage provides specific examples to support its main point.',
      'B. The topic was discovered very recently.',
      'C. Only experts are concerned about this issue.',
      'D. The problem has already been completely solved.'
    ]
  } else {
    return [
      "A. The character's actions and dialogue reveal their growth.",
      "B. The character remains exactly the same throughout.",
      "C. Other characters do not notice any changes.",
      "D. The ending suggests nothing was learned."
    ]
  }
}

async function main() {
  console.log('Generating additional reading passages and items...\n')

  // Load existing data
  const existingPassages: Passage[] = JSON.parse(
    fs.readFileSync(path.join(BANK_DIR, 'passages.json'), 'utf8')
  )
  const existingItems: Item[] = JSON.parse(
    fs.readFileSync(path.join(BANK_DIR, 'items.json'), 'utf8')
  )

  console.log(`Starting with ${existingPassages.length} passages and ${existingItems.length} items`)
  console.log(`  - Reading items: ${existingItems.filter(i => i.subject === 'reading').length}`)
  console.log(`  - Math items: ${existingItems.filter(i => i.subject === 'math').length}`)

  const newPassages: Passage[] = []
  const newItems: Item[] = []
  const now = new Date().toISOString()

  // Process informational passages
  for (const template of informationalPassages) {
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

    // Generate questions for this passage
    const questions = generateQuestions(passage)
    newItems.push(...questions)
  }

  // Process literary passages
  for (const template of literaryPassages) {
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

    // Generate questions for this passage
    const questions = generateQuestions(passage)
    newItems.push(...questions)
  }

  // Merge with existing data
  const allPassages = [...existingPassages, ...newPassages]
  const allItems = [...existingItems, ...newItems]

  // Write output
  fs.writeFileSync(
    path.join(BANK_DIR, 'passages.json'),
    JSON.stringify(allPassages, null, 2)
  )
  fs.writeFileSync(
    path.join(BANK_DIR, 'items.json'),
    JSON.stringify(allItems, null, 2)
  )

  console.log('\n========================================')
  console.log('Generation Complete!')
  console.log('========================================')
  console.log(`New passages added: ${newPassages.length}`)
  console.log(`  - Informational: ${informationalPassages.length}`)
  console.log(`  - Literary: ${literaryPassages.length}`)
  console.log(`New items added: ${newItems.length}`)
  console.log(`\nTotal passages: ${allPassages.length}`)
  console.log(`Total items: ${allItems.length}`)
  console.log(`  - Reading: ${allItems.filter(i => i.subject === 'reading').length}`)
  console.log(`  - Math: ${allItems.filter(i => i.subject === 'math').length}`)
  console.log(`\nRun 'npx tsx scripts/importBank.ts' to upload to Supabase`)
}

main().catch(console.error)
