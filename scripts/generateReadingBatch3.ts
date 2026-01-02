/**
 * Generate final batch of reading passages to reach 50% balance
 * Target: ~225 more reading items (45 passages × 5 questions each)
 *
 * Usage:
 *   npx tsx scripts/generateReadingBatch3.ts
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
  week_phase: string
  created_at: string
}

// ============================================================================
// INFORMATIONAL PASSAGES - More Science Topics
// ============================================================================

const sciencePassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'informational',
    title: 'The Structure of DNA',
    lexile_band: '1000L',
    text: `Deep inside every cell in your body lies a remarkable molecule: DNA. This twisted ladder of chemicals contains the instructions for building and running a living organism. Understanding DNA has transformed biology and medicine.

DNA stands for deoxyribonucleic acid. Its structure resembles a twisted ladder, called a double helix. The sides of the ladder are made of alternating sugar and phosphate molecules. The rungs are pairs of chemical bases: adenine (A) pairs with thymine (T), and guanine (G) pairs with cytosine (C).

This base pairing is crucial. The sequence of bases along a DNA strand encodes genetic information, much like letters encode words. Genes are segments of DNA that contain instructions for making proteins—the molecules that do most of the work in cells.

Human DNA contains about 3 billion base pairs, organized into 46 chromosomes. If you could stretch out all the DNA from a single cell, it would be about 6 feet long. Yet it fits inside a cell nucleus smaller than the period at the end of this sentence.

DNA replication allows cells to divide while passing genetic information to daughter cells. The double helix unzips, and each strand serves as a template for building a new partner strand. The base-pairing rules ensure that each new DNA molecule is identical to the original.

Mutations—changes in DNA sequence—occur naturally and through environmental factors. Most mutations are harmless, but some cause disease. Others provide variation that drives evolution. Understanding DNA has enabled genetic testing, gene therapy, and other medical advances that continue to transform healthcare.`
  },
  {
    genre: 'informational',
    title: 'How Glaciers Shape the Land',
    lexile_band: '960L',
    text: `Glaciers are rivers of ice that move slowly across the land, reshaping everything in their path. Though they seem permanent, glaciers are dynamic forces that have carved many of Earth's most spectacular landscapes.

Glaciers form in places where more snow falls each winter than melts in summer. As snow accumulates over decades and centuries, it compresses into dense ice. When the ice becomes thick enough, gravity causes it to flow—slowly, but with tremendous force.

As glaciers move, they erode the land beneath them. Rocks frozen into the ice act like sandpaper, grinding down bedrock. This process creates distinctive landforms: U-shaped valleys, cirques (bowl-shaped depressions where glaciers begin), and arêtes (sharp ridges between glaciers).

Glaciers also deposit material. As ice melts, it drops rocks, sand, and clay it has carried, sometimes for hundreds of miles. Terminal moraines are ridges of debris left at a glacier's farthest extent. Long Island and Cape Cod are giant terminal moraines from the last ice age.

During ice ages, glaciers covered much of North America, Europe, and Asia. The most recent ice age ended about 11,700 years ago, but its effects are everywhere. The Great Lakes were carved by glaciers. The rich soil of the Midwest was deposited by melting ice.

Today, mountain glaciers and ice sheets continue to shape landscapes. However, climate change is causing glaciers worldwide to retreat. Scientists study glaciers to understand past climates and predict future changes. Ice cores drilled from glaciers contain air bubbles that reveal atmospheric conditions from hundreds of thousands of years ago.`
  },
  {
    genre: 'informational',
    title: 'The Chemistry of Cooking',
    lexile_band: '950L',
    text: `Every time you cook a meal, you're performing chemistry experiments. The transformations that turn raw ingredients into delicious food involve complex chemical reactions that scientists have studied for centuries.

The Maillard reaction is perhaps the most important reaction in cooking. When proteins and sugars are heated together, they undergo a cascade of chemical changes that produce hundreds of new flavor compounds. This reaction creates the brown crust on bread, the sear on steak, and the roasted flavor of coffee. Without it, food would taste flat and bland.

Caramelization is a related but distinct process. When sugars are heated above certain temperatures, they break down and recombine into new molecules. This creates the complex flavors of caramel, the crust on crème brûlée, and the deep color of caramelized onions.

Proteins change dramatically when heated. Raw egg whites are clear and runny; cooked egg whites are white and solid. This transformation occurs because heat causes protein molecules to unfold and tangle together, creating new textures. The same principle applies to meat: cooking changes proteins in ways that affect tenderness, juiciness, and flavor.

Acids and bases also play important roles. Acidic marinades can tenderize meat by breaking down proteins. Baking soda (a base) helps cookies spread and brown. The balance between acids and bases affects everything from texture to taste.

Understanding cooking chemistry helps chefs troubleshoot problems and create new dishes. Why did the sauce break? Why won't the bread rise? Why does this combination of ingredients taste better than that one? The answers often lie in the fascinating chemistry happening in the pan.`
  },
  {
    genre: 'informational',
    title: 'Bioluminescence: Living Light',
    lexile_band: '980L',
    text: `Deep in the ocean, far from any sunlight, the water glows. Creatures flash and flicker in the darkness, producing their own light through a remarkable process called bioluminescence. This living light is one of nature's most beautiful and mysterious phenomena.

Bioluminescence occurs when organisms produce light through chemical reactions. Most involve a molecule called luciferin reacting with oxygen in the presence of an enzyme called luciferase. The reaction releases energy as light rather than heat—what scientists call "cold light."

The deep ocean is bioluminescence's realm. About 90% of deep-sea creatures can produce light. Anglerfish dangle glowing lures to attract prey. Vampire squid emit clouds of glowing mucus to confuse predators. Flashlight fish have pockets of glowing bacteria beneath their eyes.

Bioluminescence serves many purposes. Some creatures use it to attract mates. Others use it as camouflage—by matching the dim light from above, they become invisible from below. Some species produce sudden flashes to startle predators. Others release glowing fluids to distract attackers while they escape.

Bioluminescence exists on land too, though it's rarer. Fireflies are the most familiar example, using light signals to find mates. Some fungi glow to attract insects that spread their spores. Certain worms and beetles also produce light.

Scientists are finding practical applications for bioluminescence. Genes that produce light can be attached to other genes, allowing researchers to watch biological processes in real time. Glowing proteins have revolutionized medical research, enabling scientists to track cells, study diseases, and develop new treatments.`
  },
  {
    genre: 'informational',
    title: 'The Carbon Cycle',
    lexile_band: '970L',
    text: `Carbon is essential to all known life, and it's constantly moving through Earth's systems. This movement—from atmosphere to organisms to oceans to rocks and back again—is called the carbon cycle. Understanding this cycle is crucial for addressing climate change.

Carbon enters the atmosphere primarily as carbon dioxide (CO2). Plants absorb CO2 during photosynthesis, incorporating carbon into their tissues. Animals eat plants, gaining carbon that becomes part of their bodies. When organisms breathe, digest food, or decompose after death, carbon returns to the atmosphere.

The ocean is a massive carbon reservoir. Surface waters absorb CO2 from the atmosphere. Marine organisms use this carbon to build shells and skeletons. When these creatures die, some sink to the ocean floor, storing carbon in sediments. Over millions of years, these sediments can become limestone and other rocks.

Fossil fuels represent ancient carbon. Millions of years ago, dead organisms were buried and transformed by heat and pressure into coal, oil, and natural gas. This carbon was effectively removed from the cycle—until humans began burning these fuels.

Human activities have significantly altered the carbon cycle. Burning fossil fuels releases carbon that was stored for millions of years. Deforestation reduces the plants that absorb CO2. These changes have increased atmospheric CO2 from about 280 parts per million before the Industrial Revolution to over 420 parts per million today.

Higher CO2 levels trap more heat in the atmosphere, causing global warming. Addressing climate change requires understanding the carbon cycle and finding ways to reduce emissions and increase carbon storage.`
  },
  {
    genre: 'informational',
    title: 'The Human Eye and Vision',
    lexile_band: '940L',
    text: `Your eyes are remarkable optical instruments. They focus light, detect color, adapt to darkness, and send signals to your brain—all so seamlessly that you rarely think about the complex processes making vision possible.

Light enters the eye through the cornea, a clear dome at the front. Behind it, the iris—the colored part of your eye—controls how much light enters. The pupil, the dark circle at the center, is actually an opening that dilates in dim light and constricts in bright light.

The lens sits behind the iris and focuses light onto the retina at the back of the eye. Unlike a camera lens, the eye's lens can change shape. Muscles around the lens squeeze it rounder to focus on nearby objects or let it flatten for distant objects. This automatic focusing is called accommodation.

The retina contains two types of light-detecting cells. Rods are extremely sensitive and work in dim light, but they don't detect color. Cones require more light but let us see color. Most people have three types of cones, sensitive to red, green, or blue light. Our perception of millions of colors comes from different combinations of cone signals.

The fovea, a small pit at the center of the retina, contains the highest concentration of cones. This is why you see fine detail best when looking directly at something. Peripheral vision relies more on rods, which is why you can detect movement in the corner of your eye but not see details clearly.

The optic nerve carries signals from the retina to the brain, where the visual cortex processes them into the images we perceive. What you "see" is actually your brain's interpretation of electrical signals—a remarkable feat of neural processing.`
  },
  {
    genre: 'informational',
    title: 'Metamorphosis: Transformation in the Animal Kingdom',
    lexile_band: '950L',
    text: `A caterpillar enters a cocoon and emerges as a butterfly. A tadpole loses its tail and grows legs to become a frog. These dramatic transformations, called metamorphosis, are among nature's most remarkable processes.

Metamorphosis comes from Greek words meaning "change of form." It describes how some animals undergo significant physical changes as they mature. This is different from the gradual growth most animals experience—metamorphosis involves fundamental restructuring of the body.

Insects show two types of metamorphosis. Complete metamorphosis involves four stages: egg, larva, pupa, and adult. Butterflies, beetles, and flies follow this pattern. The larval stage (caterpillar or maggot) looks nothing like the adult. During the pupal stage, the body is essentially rebuilt from scratch.

Incomplete metamorphosis involves three stages: egg, nymph, and adult. Grasshoppers, crickets, and dragonflies develop this way. Nymphs resemble small adults without wings. They molt repeatedly, growing larger and more adult-like each time.

Amphibians undergo their own remarkable transformation. Tadpoles are aquatic creatures with tails and gills. As they metamorphose into frogs or salamanders, they develop lungs, grow legs, and often absorb their tails. This transition from water to land mirrors the evolutionary history of vertebrates.

Hormones control metamorphosis. In insects, juvenile hormone keeps larvae in their immature form. When its levels drop, molting hormones trigger transformation. In amphibians, thyroid hormones drive the changes. Scientists can manipulate these hormones to study how metamorphosis works and what genes are involved.

Metamorphosis allows animals to occupy different ecological niches at different life stages, reducing competition between young and adults for resources.`
  },
]

// ============================================================================
// INFORMATIONAL PASSAGES - More History & Geography
// ============================================================================

const historyGeoPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'informational',
    title: 'The Transcontinental Railroad',
    lexile_band: '980L',
    text: `On May 10, 1869, a golden spike was driven into a railroad tie at Promontory Summit, Utah. This ceremony completed the first transcontinental railroad, connecting the Atlantic and Pacific coasts and forever changing the United States.

Before the railroad, traveling from coast to coast took months. Pioneers in covered wagons faced a six-month journey across prairies, mountains, and deserts. Ships sailing around South America took even longer. The railroad reduced this to about a week.

Construction was a massive undertaking. The Central Pacific Railroad built eastward from Sacramento, California. The Union Pacific built westward from Omaha, Nebraska. Each company raced to lay more track than the other, as they were paid by the mile.

The work was dangerous and grueling. Central Pacific employed thousands of Chinese immigrants who blasted tunnels through Sierra Nevada granite and laid track in brutal conditions. Union Pacific workers—many of them Irish immigrants and Civil War veterans—faced harsh winters and conflicts with Native American tribes whose lands they were crossing.

The railroad transformed the American West. Cities like Denver and Salt Lake City grew as railroad hubs. Cattle ranching became profitable because beef could be shipped to eastern markets. Homesteaders poured into the Great Plains. Native American communities were devastated as their lands were settled and bison herds were destroyed.

The transcontinental railroad also changed how Americans thought about their nation. Before, the United States was a collection of regions separated by vast distances. After, it was truly a continental nation, connected by iron rails that carried people, goods, and ideas from coast to coast.`
  },
  {
    genre: 'informational',
    title: 'The Amazon Rainforest',
    lexile_band: '960L',
    text: `Covering over 2 million square miles, the Amazon rainforest is Earth's largest tropical rainforest. This vast green expanse produces about 20% of the world's oxygen and is home to roughly 10% of all species on Earth.

The Amazon spans nine countries in South America, with the majority in Brazil. The forest's ecosystem is powered by the Amazon River, the world's largest river by volume. Every second, it discharges about 209,000 cubic meters of water into the Atlantic Ocean—more than the next seven largest rivers combined.

The rainforest's biodiversity is staggering. Scientists have identified over 80,000 plant species, 1,300 bird species, 3,000 fish species, and 430 mammal species—with many more yet to be discovered. In a single hectare of Amazon forest, researchers have found more tree species than exist in all of North America.

The forest creates its own weather. Trees release water vapor through transpiration, which rises, cools, and falls as rain. Up to half of the Amazon's rainfall is recycled this way. This "flying river" of atmospheric moisture also affects weather patterns across South America.

The Amazon faces serious threats. Deforestation for cattle ranching, soy farming, and logging destroys roughly 10,000 square kilometers annually. Forest fires, once rare in this wet environment, are becoming more common. Climate change and deforestation threaten to push the ecosystem past a tipping point where it could become savanna.

Indigenous peoples have lived sustainably in the Amazon for thousands of years. Their knowledge of forest plants and ecosystems is invaluable. Protecting both the forest and indigenous rights has become a global priority.`
  },
  {
    genre: 'informational',
    title: 'The Harlem Renaissance',
    lexile_band: '990L',
    text: `In the 1920s and 1930s, the New York neighborhood of Harlem became the center of an extraordinary flowering of African American art, literature, and music. This cultural explosion, known as the Harlem Renaissance, transformed American culture and created works that remain influential today.

The Renaissance had roots in the Great Migration. As African Americans moved from the rural South to northern cities, they brought their traditions while also encountering new ideas and opportunities. Harlem, with its concentration of Black residents, businesses, and institutions, became a natural gathering place for artists and intellectuals.

Literature flourished. Langston Hughes wrote poetry that celebrated Black life and drew on jazz rhythms. Zora Neale Hurston collected Southern folklore and wrote novels exploring Black women's experiences. Claude McKay, Countee Cullen, and Jean Toomer produced work that combined racial pride with artistic innovation.

Music was equally vital. Jazz and blues clubs lined Harlem's streets, featuring legends like Duke Ellington and Louis Armstrong. The Cotton Club and Savoy Ballroom became famous worldwide. These sounds would shape American popular music for decades.

Visual artists like Aaron Douglas created distinctive work blending African imagery with modern techniques. Augusta Savage sculpted powerful portraits. The movement extended to theater, philosophy, and political thought.

The Harlem Renaissance challenged racist stereotypes by demonstrating African American artistic excellence. It asserted that Black culture was a vital part of American identity. Though the Great Depression ended the movement's peak years, its influence continued. Today, scholars recognize the Harlem Renaissance as one of the most important periods in American cultural history.`
  },
  {
    genre: 'informational',
    title: 'The Ring of Fire',
    lexile_band: '950L',
    text: `Circling the Pacific Ocean is a 25,000-mile horseshoe-shaped zone of intense volcanic and seismic activity. This region, called the Ring of Fire, contains 75% of the world's active volcanoes and experiences about 90% of its earthquakes.

The Ring of Fire exists because of plate tectonics. The Pacific Plate and several smaller plates are sliding beneath the continental plates that surround them. This process, called subduction, creates conditions for both earthquakes and volcanism.

Subduction zones produce the world's largest earthquakes. When the descending plate sticks, stress builds up. When it suddenly releases, massive earthquakes result. The 2011 Japan earthquake (magnitude 9.1) and the 2004 Indian Ocean earthquake (magnitude 9.1) both occurred in subduction zones, generating devastating tsunamis.

Volcanoes form as the subducting plate descends. At depth, heat and pressure cause the plate and overlying rock to melt, creating magma. This magma rises to form volcanic chains. Mount Fuji in Japan, Mount Rainier in Washington, and the volcanoes of the Andes all owe their existence to subduction.

The Ring of Fire passes through many heavily populated areas. Japan, the Philippines, Indonesia, and the west coasts of North and South America all lie within this zone. Tokyo, Manila, Seattle, and Lima are among the major cities at risk from earthquakes and volcanic eruptions.

Understanding the Ring of Fire helps scientists predict and prepare for disasters. Seismologists monitor fault movements. Volcanologists track volcanic activity. Early warning systems can provide crucial minutes to evacuate before tsunamis arrive. Living with geological hazards is a reality for hundreds of millions of people along the Ring of Fire.`
  },
  {
    genre: 'informational',
    title: 'The Women\'s Suffrage Movement',
    lexile_band: '980L',
    text: `For over seventy years, American women fought for the right to vote. The women's suffrage movement, which culminated in the 19th Amendment in 1920, required generations of activism and sacrifice before achieving its goal.

The movement's formal beginning came at the Seneca Falls Convention in 1848. There, Elizabeth Cady Stanton and Lucretia Mott organized a gathering that produced the Declaration of Sentiments, modeled on the Declaration of Independence: "We hold these truths to be self-evident: that all men and women are created equal."

Early suffragists faced ridicule and hostility. Many people believed women were too emotional to vote responsibly. Others worried that voting would distract women from their duties as wives and mothers. Suffragists had to change hearts and minds while working within a political system that excluded them.

The movement used various strategies. Some focused on winning voting rights state by state. Wyoming, Colorado, and Utah granted women's suffrage before the federal amendment. Others pushed for a constitutional amendment. Some activists, like Alice Paul, organized dramatic protests. Suffragists picketed the White House, went on hunger strikes in jail, and endured forced feeding.

The movement was not always unified. Disagreements arose over tactics, priorities, and who should be included. Some suffragists supported voting rights for white women while accepting the disenfranchisement of Black voters. Black suffragists like Ida B. Wells-Barnett fought for universal suffrage while facing racism within the movement.

The 19th Amendment's ratification on August 18, 1920, was a landmark victory. Yet the fight for voting rights continued, as many states found ways to prevent Black women and other minorities from exercising their new right.`
  },
]

// ============================================================================
// MORE LITERARY PASSAGES
// ============================================================================

const literaryPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'literary',
    title: 'The Last Summer',
    lexile_band: '920L',
    text: `The "For Sale" sign appeared on Marcus's lawn on the first day of June. By July, his best friend Jackson would be gone—moved to Oregon for his mom's new job. An entire continent away.

"We have six weeks," Jackson said. "Let's make them count."

They made a list: every place they'd always meant to go, every adventure they'd put off for "someday." The old quarry they'd never explored. The peak they'd never climbed. The legendary diner with twenty flavors of pie.

Week one, they hiked to Eagle Rock and carved their initials in the stone. Week two, they finally beat the arcade's unbeatable high score. Week three, they went fishing at midnight, catching nothing but mosquito bites.

But as the weeks passed, the adventures felt hollow. Marcus couldn't stop thinking about September, when Jackson's room would be empty and there'd be no one to text at midnight about random ideas.

On their last night, they sat on Marcus's roof watching stars.

"This sucks," Jackson said.

"Yeah."

"But also..." He paused. "I'm kind of excited. Is that wrong?"

Marcus considered this. His first instinct was hurt—was Jackson happy to leave? But looking at his friend's face, he understood something different. Jackson was terrified of the new school, the new city, everything unknown. But he was also curious about who he might become.

"It's not wrong," Marcus said finally. "Just promise me something."

"What?"

"Don't change so much that I don't recognize you when I visit."

Jackson laughed—a real laugh, not a sad one. "Same goes for you."

They watched the stars until dawn, not talking much, just sharing the silence of a friendship that would have to learn new shapes.`
  },
  {
    genre: 'literary',
    title: 'The Scholarship Essay',
    lexile_band: '930L',
    text: `The cursor blinked on an empty page. Maya had twenty-four hours to explain, in 500 words, why she deserved a full scholarship to her dream school.

She'd tried a dozen approaches. The dramatic story about overcoming poverty. The inspirational tale of being the first in her family to apply to college. The impressive list of achievements and activities.

All of them felt fake.

Her mother appeared with tea. "How's it going?"

"Terrible. I sound like everyone else who needs money and works hard. That's a thousand people applying for ten spots."

Her mother sat on the bed. "When you were small, you used to name the ants in the kitchen. You'd make up stories about their tiny lives—who was married to whom, who had adventures."

"Mom, I can't write about ants."

"That's not my point." Her mother smiled. "My point is that you've always seen stories where others see nothing. That's not common. That's not everyone."

Maya stared at the screen. She thought about the ants, the elaborate worlds she'd invented. She thought about the comics she drew, the characters she created, the way stories had always been her way of understanding a world that often didn't make sense.

She started typing.

"I am not remarkable because of what I've survived or achieved. I am remarkable because of how I see. When I walk through my neighborhood, I see stories—in the tired eyes of the man at the bus stop, in the teenager pretending not to care, in the kid chasing pigeons who will grow up to chase different dreams. I want to study literature because stories are how humans make sense of chaos. And I have spent my whole life learning to find them."

When she finished, the essay was exactly 500 words.

It was also, for the first time, true.`
  },
  {
    genre: 'literary',
    title: 'The Team Captain',
    lexile_band: '910L',
    text: `Jordan had been team captain for three games when everything fell apart. First, their star scorer broke her ankle. Then three players got suspended for a graffiti prank. Now, with four games left in the season, they had barely enough players to field a team.

"We should forfeit," said Aisha during practice. "There's no point."

"The season's over anyway," added Dominique.

Jordan looked at the depleted roster. Six players. No bench. No hope—at least, that's what the math said.

But Jordan thought about something their grandmother always said: "You can't control what happens. You can only control how you respond."

"Here's what I think," Jordan said slowly. "We're going to lose these games. Probably badly. But we can decide what kind of team we are. Are we the team that gives up? Or the team that plays hard even when winning isn't possible?"

Silence.

Then Maria, who barely spoke, said: "I didn't join the team to win. I joined because I wanted to play. I still want to play."

They played their next game against the league's best team. Final score: 7-0. But Jordan noticed something in the fourth quarter: the other team was tired. Their own team was still running hard.

The game after that: 4-2. Still a loss, but closer.

The third game: 3-3 tie.

The final game, against a team with the same record: 2-1 victory.

They didn't make the playoffs. Their season record was nothing special. But in the locker room after that last game, Jordan understood something about leadership that no trophy could have taught them.

Sometimes winning isn't about the score. Sometimes it's about showing up anyway.`
  },
  {
    genre: 'literary',
    title: 'The Invention',
    lexile_band: '920L',
    text: `Priya's invention was supposed to change the world. Or at least win first place at the science fair. Instead, it sat on her workbench, refusing to work.

The device was simple in theory: a solar-powered water purifier using locally available materials. She'd designed it after learning that millions of people lacked access to clean water. The science was sound. The parts were cheap. It should have worked.

But theory and practice were different things.

"Maybe try a different filter material," suggested her father.

She'd tried twelve.

"Check your seals."

Perfect.

"Start over?"

She'd started over twice.

The night before the fair, Priya sat alone with her failed prototype. She'd imagined presenting a working device. Instead, she'd present a failure. Everyone would see that she couldn't deliver on her big ideas.

Her lab notebook lay open beside her. Fifty pages of failed experiments, dead ends, and mistakes. Documentation of everything that didn't work.

She started flipping through it. Each failure had taught her something. The first filter clogged because the mesh was too fine. The second leaked because the adhesive dissolved. Each dead end had pointed toward a different path.

A thought occurred to her: what if she presented the notebook?

The next day, she stood before the judges with her non-working prototype and her thick notebook.

"This device doesn't work," she began. "Not yet. But here's everything I learned while trying. Here's what I'll try next. And here's why I believe the eventual solution is worth the failures."

She didn't win first place. But she won a special commendation for "Exceptional Scientific Process." And more importantly, three other students approached her afterward, wanting to help solve the problem.

Sometimes, showing your failures honestly is more valuable than hiding them behind a perfect facade.`
  },
  {
    genre: 'literary',
    title: 'The Audition',
    lexile_band: '900L',
    text: `The dance studio mirrors showed everything: every mistake, every wobble, every moment of hesitation. Jada watched her reflection and saw only flaws.

Auditions for the summer intensive were in two hours. Two hundred dancers competing for twenty spots. Jada had been preparing for months, but suddenly none of it felt like enough.

Her mother found her sitting on the studio floor.

"I can't do it," Jada said. "I'm not good enough."

Her mother sat beside her. "What makes you say that?"

"Did you see the other dancers warming up? They're better than me. More flexible. More graceful. More... everything."

"And yet you've spent three years training. You earned your spot at this audition."

"I got lucky."

Her mother was quiet for a moment. Then she said, "When I was your age, I was offered an opportunity to study abroad. I turned it down because I was afraid I wasn't smart enough. I've regretted it my entire life."

Jada looked at her mother. She'd never heard this story.

"I don't want you to do that," her mother continued. "I don't want you to wonder 'what if.' Go in there and give your best. If your best isn't enough today, that's information—not failure. But if you don't try, you'll never know what was possible."

Two hours later, Jada stood in the audition room, one of two hundred dancers in identical black leotards. The music started. For a moment, fear froze her.

Then she remembered her mother's words: information, not failure.

She danced.

Three weeks later, the acceptance letter arrived. She'd gotten one of the twenty spots.

But even if she hadn't, she realized, she would have been okay. Because she'd learned something more important than any technique: the courage to try.`
  },
  {
    genre: 'literary',
    title: 'The Forgiveness',
    lexile_band: '930L',
    text: `It had been three months since Mateo's father moved out, and Mateo still hadn't answered any of his texts.

There were fifty-seven of them now. "I miss you." "I'm sorry." "Please talk to me." Mateo read them all and never replied.

"He deserves it," Mateo told his therapist.

"Maybe. But how does punishing him make you feel?"

The honest answer was: terrible. But admitting that felt like losing.

His mother never criticized his father, which somehow made it worse. She just said, "That's between you and him. Your feelings are valid either way."

The breaking point came at a basketball game. Mateo scored a winning shot—the first game-winner of his life—and immediately looked for his father in the stands. He wasn't there, of course. He hadn't been invited.

The victory felt hollow.

That night, Mateo finally typed a response: Can we talk?

They met at the park where Mateo had learned to ride a bike. His father looked older, thinner, uncertain.

"I'm so sorry," his father began.

"I know. You said that fifty-seven times."

"Is that how many texts I—" His father caught himself. "You counted?"

"I read them all." Mateo stared at the swings. "I was afraid that if I answered, it would mean I was okay with what happened. And I'm not okay with it."

"You shouldn't be. I made a terrible choice."

"But I'm also tired of being angry. It's like... carrying something heavy everywhere. I'm exhausted."

His father nodded, tears in his eyes.

"I don't know if I can forgive you yet," Mateo said. "But I want to try. Not for you. For me."

They sat in silence for a while. It wasn't forgiveness—not yet. But it was a beginning.`
  },
  {
    genre: 'literary',
    title: 'The Storm',
    lexile_band: '920L',
    text: `The hurricane hit on a Thursday. By Friday, the water was up to the porch. By Saturday, Rosa and her grandmother were climbing onto the roof.

"The boats will come," Abuela said. But her voice trembled.

The boats came eventually—but not until Sunday afternoon, by which point the house was half underwater. Rosa watched her childhood float by: the photo albums, the books, the stuffed animals she'd kept even though she was fifteen now.

At the shelter, everything was chaos. Cots crowded the gymnasium. People shouted into phones. Children cried. Rosa found a corner and sat with Abuela, trying to be invisible.

A volunteer appeared with water bottles. "Is there anything you need?"

"Our house," Rosa said, surprising herself with her bitterness.

The volunteer—she couldn't have been much older than Rosa—didn't flinch. "I know. I lost mine in the last storm. Two years ago."

Rosa looked at her differently. "How did you..."

"Survive?" The volunteer sat beside her. "At first, I thought I couldn't. Everything I knew was gone. But slowly, I realized I wasn't just what I lost. I was also what I did next."

"Is that why you volunteer here?"

"Partly. Also because when I was in your place, someone sat with me and said what I'm saying to you. Kindness gets passed forward."

Over the following weeks, Rosa learned what the volunteer meant. The house would take months to rebuild. Insurance would cover some costs, not all. Some things—the photos, the memories—were gone forever.

But other things emerged. Neighbors she barely knew showed up to help. Strangers donated clothes and food. And Rosa found herself volunteering too, passing forward what had been given to her.

Loss had stripped away everything non-essential. What remained was connection.`
  },
  {
    genre: 'literary',
    title: 'The Presentation',
    lexile_band: '910L',
    text: `Twenty minutes before the biggest presentation of his life, Tyler's voice stopped working.

He could speak—technically. But only in a whisper, as if someone had turned down his volume. The regional debate tournament. Six months of preparation. And now this.

"Laryngitis," the tournament doctor confirmed. "Bad timing. You should rest your voice."

His coach found him in the hallway. "We can withdraw. No one would blame you."

Tyler thought about all the work: the research, the practice rounds, the early mornings and late nights. His team was counting on him. But without a voice, what could he do?

Then something his drama teacher had said came back to him: "Communication is only partly verbal. Ninety percent is body language and intention."

"I want to try," he whispered.

In the presentation room, he stood before the judges and the audience. He took out a notepad and wrote: I have laryngitis. I'll be presenting non-verbally with written support. Is this acceptable?

The judges conferred. One said, "We've never had this situation. But the rules don't prohibit it. Proceed."

Tyler had memorized his entire presentation. Now he performed it—using gestures, expressions, and rapid writing on a flip chart. When he made a joke, he acted it out until the audience laughed. When he made a serious point, he let the silence speak.

It wasn't his planned presentation. It was better—more creative, more memorable, more human.

He didn't win first place. But he won a special recognition for "Outstanding Adaptation Under Adversity." And the video of his non-verbal debate went viral in the forensics community.

Sometimes the obstacle becomes the path. Sometimes losing your voice helps you find it.`
  },
  {
    genre: 'literary',
    title: 'The Pen Pal',
    lexile_band: '900L',
    text: `The assignment seemed outdated: find a pen pal in another country and exchange letters for a semester. Paper letters. No texting allowed.

Eva was paired with a girl named Yuki in Japan. Their first letters were awkward—descriptions of daily life, lists of hobbies, the kind of small talk you make with strangers.

But something shifted in the third letter. Yuki wrote about feeling lonely, about her parents' expectations, about not fitting in at school. She wrote: I don't know why I'm telling you this. I guess because you're far away and I'll never see you.

Eva responded honestly for the first time too. She wrote about her parents' divorce, about feeling like she had to be perfect so no one would worry about her. She wrote: I've never told anyone this. But you can't tell anyone I know, so it feels safe.

Their letters grew longer. They waited eagerly for the mail, which suddenly seemed magical—physical objects that had traveled 6,000 miles, touched by hands on the other side of the world.

When the semester ended, they exchanged email addresses, but somehow email wasn't the same. There was something about the slowness of letters—the thoughtfulness required, the anticipation of waiting—that made their communication deeper.

A year later, Yuki's family visited California. Eva went to meet her at the airport, nervous that reality wouldn't match their letters.

When Yuki appeared, they stood frozen for a moment. Then Yuki smiled—the same smile from the photos she'd sent—and Eva realized something important: some friendships don't depend on proximity. Some connections exist outside of time and space.

They hugged like old friends. Because, in all the ways that mattered, they were.`
  },
  {
    genre: 'literary',
    title: 'The Inheritance',
    lexile_band: '920L',
    text: `The lawyer's letter said Marcus had inherited a restaurant. Not money—a restaurant. From a grandfather he'd never met.

"Your grandfather and I had a... disagreement," his mother said, choosing her words carefully. "Before you were born. I haven't spoken to him since."

"What kind of disagreement?"

But his mother wouldn't say more.

The restaurant was in a small town three hours away. Marcus drove there the weekend after graduation, expecting to sell the property and leave. Instead, he found an aging diner with twelve tables, a loyal collection of elderly regulars, and a cook named Rosa who'd worked there for thirty years.

"You look like him," Rosa said. "Same serious face. He talked about you all the time."

"He never met me."

"He sent letters. To your mother. She never responded, but he never stopped writing." Rosa handed him a shoebox. "He kept copies. He wanted you to have them someday."

Marcus read the letters in the diner's back booth. Birthdays, holidays, ordinary Tuesdays. His grandfather had written about the weather, the customers, the recipe for the diner's famous apple pie. He'd written about regret for whatever had driven away his daughter. He'd written about the grandson he'd never meet but loved anyway.

The final letter was dated two weeks before his grandfather died.

"I'm leaving you this place because it's all I have to give. Maybe you'll sell it. That's your right. But I hope you'll visit first. I hope you'll understand that this diner was where I learned to love strangers, to feed the hungry, to create community. That's what I'd want to pass on. Not money. Values."

Marcus looked around the diner—at Rosa, at the regulars, at the worn counter that held decades of stories.

He didn't sell it.`
  },
  {
    genre: 'literary',
    title: 'The Diagnosis',
    lexile_band: '930L',
    text: `When the doctor said "type 1 diabetes," Amir heard the words but didn't understand them. He was sixteen. He was healthy. How could he have a disease he'd have forever?

The first few weeks were overwhelming. Blood sugar checks. Insulin injections. Counting carbohydrates. Learning a new vocabulary of highs and lows, units and ratios. He felt like a science experiment that had gone wrong.

His friends didn't know what to say. "That sucks," they offered helplessly. His teammates watched him check his blood sugar before practice, their curiosity obvious and awkward.

"You're not broken," his mother said, finding him crying in his room one night. "You're figuring out how to live differently."

"I don't want to be different."

"No one does. But here's what I've learned: everyone is dealing with something invisible. Yours just has a name and a treatment plan."

Slowly, management became routine. He learned to calculate doses without thinking. He figured out which foods kept his blood sugar stable. He even started talking about it—first with one close friend, then more openly.

At the end of the school year, a freshman approached him nervously. "I heard you have diabetes. I just got diagnosed. I'm really scared."

Amir remembered exactly how that fear felt.

"It gets easier," he said. "The first month is the worst. After that, it becomes... just a thing you do. Like brushing your teeth, but more annoying."

The freshman laughed weakly.

"I'll teach you some tricks," Amir offered. "And if you ever feel alone, text me. I know how isolating this can be."

It wasn't the role he'd imagined for himself. But it was meaningful—turning his struggle into someone else's support.`
  },
]

// ============================================================================
// Additional passages to reach the goal
// ============================================================================

const moreInformationalPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'informational',
    title: 'The Psychology of First Impressions',
    lexile_band: '970L',
    text: `It takes less than a second to form a first impression of someone. In that brief moment, your brain makes judgments about trustworthiness, competence, and likability. Understanding this process can help you navigate social situations more effectively.

First impressions are largely based on physical appearance and nonverbal cues. Studies show that people make judgments about trustworthiness in as little as 100 milliseconds—faster than conscious thought can occur. These snap judgments, while often inaccurate, powerfully influence how we treat others and how they treat us.

Facial features play a major role. Faces that appear "baby-faced"—with large eyes, round cheeks, and smaller noses—are typically perceived as more trustworthy but less competent. Angular features convey competence but less warmth. These associations aren't rational; they're hardwired into our brains through evolution.

Body language contributes significantly. An upright posture signals confidence. Eye contact suggests trustworthiness. A genuine smile—one that crinkles the eyes—creates positive feelings. A weak handshake or crossed arms can create negative impressions before a word is spoken.

The "halo effect" means that one positive trait can influence perception of unrelated traits. Someone judged as attractive is often assumed to be smarter, kinder, and more competent—even though beauty says nothing about these qualities. This bias affects hiring decisions, court verdicts, and countless daily interactions.

First impressions can be changed, but it requires consistent evidence over time. The brain resists updating initial judgments, a phenomenon psychologists call "confirmation bias." Once formed, a negative impression acts as a filter, making us more likely to notice information that confirms our initial judgment.`
  },
  {
    genre: 'informational',
    title: 'How Bridges Work',
    lexile_band: '950L',
    text: `Bridges seem simple—structures that help us cross obstacles—but they represent some of humanity's greatest engineering achievements. Each bridge design solves the fundamental problem of supporting weight across empty space in a different way.

All bridges must handle two types of forces: compression (pushing together) and tension (pulling apart). Different bridge designs distribute these forces differently, making each type suited to particular situations.

Beam bridges are the simplest type. A horizontal beam rests on supports at each end. The beam experiences compression on top and tension on the bottom. Beam bridges work well for short spans but become impractical for longer distances because the required beam thickness increases dramatically.

Arch bridges have been used since ancient Rome. The curved shape directs forces outward and downward into the ground. Stone arches work because stone handles compression extremely well. Modern arch bridges use steel, which handles both compression and tension, allowing greater flexibility in design.

Suspension bridges span the longest distances. Massive cables hang from tall towers, and the bridge deck hangs from these cables. The cables, which are in tension, transfer the bridge's weight to the towers, which handle compression. The Golden Gate Bridge and Brooklyn Bridge are famous suspension bridges.

Cable-stayed bridges look similar to suspension bridges but work differently. Cables connect directly from the towers to the deck, rather than hanging from a main cable. This design uses less cable and allows for more architectural variety.

Engineers select bridge types based on span length, available materials, soil conditions, and budget. The science of bridge building has evolved over millennia, but the fundamental challenge remains the same: defying gravity to connect what was separated.`
  },
  {
    genre: 'informational',
    title: 'The Migration of Monarch Butterflies',
    lexile_band: '940L',
    text: `Every fall, millions of monarch butterflies embark on one of nature's most remarkable journeys. These delicate insects, weighing less than a gram, travel up to 3,000 miles from Canada and the United States to forests in central Mexico. How they accomplish this feat remains one of science's great mysteries.

Monarchs east of the Rocky Mountains begin their migration in late summer, triggered by shortening days and cooling temperatures. They travel south in massive groups, sometimes covering 50 miles in a single day. Unlike birds, which can navigate by learning from elders, monarchs make this journey on instinct alone—the butterflies that return north are several generations removed from those that left.

The destination is remarkably precise. Despite never having been there before, monarchs from across eastern North America converge on a few small mountain areas in Mexico. Here, at elevations of about 10,000 feet, they cluster by the millions in oyamel fir trees, conserving energy through the cool mountain winter.

Scientists believe monarchs navigate using multiple cues. They seem to have an internal compass that detects Earth's magnetic field. They also use the sun's position, with a time-compensated sense that adjusts for the sun's movement throughout the day. The combination allows for accurate navigation over thousands of miles.

The journey is perilous. Storms, predators, cars, and lack of food all claim lives. Climate change threatens the Mexican forests where monarchs spend winter. Disappearing milkweed—the only plant monarch caterpillars can eat—reduces populations before the migration even begins.

Conservation efforts focus on planting milkweed, protecting overwintering sites, and reducing pesticide use. The monarch migration is a natural wonder that, without human intervention, might not survive the century.`
  },
  {
    genre: 'informational',
    title: 'The Science of Taste',
    lexile_band: '930L',
    text: `When you eat your favorite food, you're experiencing something far more complex than you might realize. Taste, or gustation, involves chemical detection, neural processing, and psychological associations that together create the experience of flavor.

The tongue contains about 10,000 taste buds, each housing 50-100 taste receptor cells. These cells detect five basic tastes: sweet, salty, sour, bitter, and umami (savory). Contrary to the old "taste map" myth, all parts of the tongue can detect all tastes, though sensitivity varies slightly.

But taste alone is only part of flavor. Your sense of smell contributes about 80% of what you perceive as flavor. Molecules from food travel up the back of your throat to smell receptors, creating "retronasal" olfaction. This explains why food tastes bland when you have a cold—your smell is impaired.

Texture also matters enormously. Crunch, creaminess, chewiness, and temperature all contribute to food enjoyment. Foods that are the same chemically can taste different because of texture differences. This is why flat soda doesn't satisfy like bubbly soda, even though the sugar content is identical.

Your brain processes all these signals together, influenced by expectations, memories, and emotions. Food eaten in pleasant settings tastes better. Foods associated with childhood memories often remain favorites. Even the color of food affects perception—studies show that people rate wine as better-tasting when they can see its "proper" color.

Food manufacturers understand taste science intimately. They engineer products to hit the "bliss point" of sweetness, saltiness, and fat that maximizes appeal. Understanding how taste works can help you make more conscious choices about what you eat.`
  },
  {
    genre: 'informational',
    title: 'The Development of Writing Systems',
    lexile_band: '980L',
    text: `Writing is so fundamental to civilization that we rarely consider how revolutionary its invention was. The ability to record language visually—to communicate across time and space without speaking—transformed human society in ways that continue to shape our world.

Writing emerged independently in several locations. Sumerian cuneiform appeared in Mesopotamia around 3400 BCE, initially as a record-keeping system for temple economies. Egyptian hieroglyphics developed around the same time. Chinese writing emerged around 1200 BCE. Mesoamerican scripts developed independently in the Americas.

Early writing systems used pictographs—simplified pictures representing objects or ideas. A drawing of the sun meant "sun." Over time, these evolved into more abstract symbols that could represent sounds rather than just meanings, making writing more flexible and efficient.

Alphabets represent a major innovation: using a small set of symbols to represent individual sounds. The first true alphabet, with symbols for both consonants and vowels, was Greek, adapted from Phoenician script around 800 BCE. This alphabet eventually became the basis for Latin script, which you're reading now.

Writing systems reflect cultural values and needs. Chinese characters, which represent meanings rather than sounds, allow speakers of different Chinese dialects to read the same texts. Arabic script, written right to left, evolved beautiful calligraphic traditions. Each writing system encodes assumptions about language and thought.

The invention of writing enabled law codes, literature, scientific knowledge, and historical records. It allowed information to accumulate across generations, accelerating human progress. The printing press and, later, digital technology further revolutionized how writing spreads, but the fundamental invention—making language visible and permanent—remains one of humanity's greatest achievements.`
  },
  {
    genre: 'informational',
    title: 'The Global Water Crisis',
    lexile_band: '960L',
    text: `Although water covers 71% of Earth's surface, only 3% is freshwater, and most of that is locked in glaciers and ice caps. The small fraction available for human use is increasingly stressed as populations grow and climates change. Understanding the global water crisis is essential for addressing one of the 21st century's greatest challenges.

Water scarcity affects billions of people. The United Nations estimates that 2 billion people lack safely managed drinking water at home. Women and girls in developing countries often spend hours daily collecting water, limiting their opportunities for education and work.

Agriculture accounts for about 70% of freshwater use globally. Irrigation transformed arid lands into farmland, feeding billions, but it has also depleted aquifers and dried up rivers. The Aral Sea, once one of the world's largest lakes, has largely disappeared due to irrigation diversions.

Climate change intensifies water challenges. Changing precipitation patterns make some regions wetter and others drier. Snowpack, which stores winter precipitation for summer use, is declining in many mountain regions. More frequent droughts and floods disrupt water supplies.

Solutions exist but require investment and political will. Water-efficient irrigation technologies can reduce agricultural use. Wastewater treatment allows water reuse. Desalination produces freshwater from seawater, though at high energy cost. Perhaps most importantly, reducing water waste in wealthy countries could free resources for those in need.

The water crisis is both a humanitarian and security issue. Competition for water has sparked conflicts throughout history and will likely increase as resources tighten. Addressing water challenges requires international cooperation, technological innovation, and recognition that access to clean water is a fundamental human right.`
  },
]

const moreLiteraryPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'literary',
    title: 'The Photograph',
    lexile_band: '910L',
    text: `The photograph was the only thing Kira had of her birth mother: a woman with dark hair and Kira's own slightly crooked smile, holding a baby in front of a house she'd never been able to find.

Her adoptive parents had given it to her years ago, along with a story about a young woman who had loved her but couldn't keep her. "She wanted you to have a good life," they said. That had been enough for a while.

But at sixteen, Kira needed more. She started searching: ancestry websites, social media, adoption reunion registries. The photo was her only clue.

After months, she found a match: a woman in Nevada who had given up a baby eighteen years ago. The timing was right. The location was possible.

They arranged a video call. Kira's hands shook so badly she could barely click the button.

The face that appeared looked like her own—but older, tired, uncertain.

"I never stopped thinking about you," the woman said immediately. "I want you to know that."

"Then why?" The question that had haunted Kira for years.

"I was nineteen. Alone. Scared. I couldn't give you what you deserved. Giving you up was the hardest thing I've ever done—but it was also an act of love."

They talked for two hours. Kira learned about grandparents she'd never met, an uncle who played guitar, a family history of stubborn determination and unexpected laughter.

At the end, the woman asked, "Are you happy? Did your parents give you a good life?"

Kira thought about her mom and dad—the parents who'd raised her, cheered for her, loved her unconditionally.

"Yes," she said. "They did."

"Then I made the right choice."

They agreed to stay in touch. Kira had expanded her family, not replaced it.`
  },
  {
    genre: 'literary',
    title: 'The Essay',
    lexile_band: '920L',
    text: `The assignment was simple: write about someone who changed your life. Everyone else chose parents, teachers, coaches. Malik chose his grandmother's mail carrier.

"That's... unusual," said Ms. Patterson.

"Can I explain?"

Ms. Patterson nodded.

"When I was twelve, my grandmother had a stroke. She couldn't leave her apartment. Couldn't cook or clean. Could barely talk. My mom took care of her, but Mom worked two jobs, so I spent a lot of time there alone with her."

The class had gone quiet.

"The mail carrier's name was Daniel. Every day, he brought her mail and knocked on the door. At first, he just handed me the mail. But then he started asking how she was doing. He brought her get-well cards. He remembered her birthday. Once, when she was having a bad day, he sat with her for twenty minutes during his lunch break."

"Why did that matter so much?" Ms. Patterson asked gently.

"Because he didn't have to. He had a job to do. She was just another stop on his route. But he chose to see her as a person, not an address. He taught me that kindness doesn't require a relationship or an obligation. It just requires noticing that someone needs you."

Malik looked at his classmates, suddenly embarrassed by his own sincerity.

"After she died, I found out he'd been checking on her since before her stroke. For years, just being friendly. He didn't know it mattered. But it did."

He sat down. The room was silent.

Then a girl in the back raised her hand. "Can I change my essay topic?"

Several others nodded.

Sometimes the people who change us aren't the obvious ones.`
  },
  {
    genre: 'literary',
    title: 'The Language',
    lexile_band: '930L',
    text: `When her grandmother stopped speaking English, Sofia assumed it was the dementia taking her words. But the doctors said something different: her grandmother's native language—the one she'd spoken as a child in Mexico—was returning as her English faded.

"It happens," the doctor explained. "The oldest memories are often the last to go."

But Sofia didn't speak Spanish. Not really. Just fragments picked up from relatives and TV shows. Her grandmother had raised her in English, wanting her to succeed in America.

Now, in her grandmother's final months, Sofia couldn't understand half of what she said.

She bought language apps. She watched telenovelas with subtitles. She pestered her aunt for vocabulary words. Every day, she practiced on the drive to the nursing home.

Progress was slow. Her grandmother spoke in idioms and dialects that no app could teach. But gradually, words emerged from the confusion. Mija. Te quiero. Corazón.

One evening, Sofia was conjugating verbs at her grandmother's bedside when the old woman reached out and grabbed her hand.

"Estoy orgullosa de ti," her grandmother said clearly—a rare complete sentence.

Sofia froze. "What does that mean?"

Her aunt, who'd been reading in the corner, looked up with tears in her eyes. "It means 'I'm proud of you.'"

Her grandmother squeezed her hand and smiled—a smile from before the confusion, before the disease. A smile that transcended language entirely.

Sofia kept studying after her grandmother died. She became fluent eventually—not just in words, but in the culture and history those words carried. A piece of her grandmother lived on in every Spanish sentence she spoke.

Some inheritances aren't in wills. They're in languages.`
  },
  {
    genre: 'literary',
    title: 'The Shelter',
    lexile_band: '900L',
    text: `No one planned to spend Christmas Eve in a school gymnasium, but the blizzard had other ideas. Two feet of snow, power lines down, roads impassable. The emergency shelter held about forty people who'd been stranded in various ways: travelers, employees who couldn't get home, a few homeless families the city had brought in.

Maya was there with her mother, stuck halfway to her grandmother's house. At first, she just felt angry. Christmas was supposed to be traditions and presents and her grandmother's famous cookies—not Red Cross cots and strangers.

But as the hours passed, something shifted.

A family from Guatemala set up a small nativity scene they'd been bringing as a gift. An elderly man pulled out a harmonica. Someone found paper and crayons for the kids. Strangers shared snacks they'd brought for the road.

By evening, the gymnasium had transformed. Makeshift decorations hung from basketball hoops. People were teaching each other songs in different languages. Someone had organized a gift exchange using whatever random objects people had with them.

Maya received a paperback book from a college student headed home from finals. She gave away her emergency granola bars to a little girl who loved chocolate chips.

When midnight came, forty voices sang "Silent Night" together—not perfectly, not in the same key, but together.

Maya's mother put an arm around her. "Not the Christmas we planned."

"No," Maya agreed. Then she surprised herself. "But maybe... not worse? Just different."

The next morning, plows finally cleared the roads. People exchanged phone numbers, hugged, promised to remember. Most of them would never see each other again.

But Maya never forgot that Christmas. Because she'd learned something important: community isn't where you are. It's what you create.`
  },
]

// ============================================================================
// Question generation (same as before)
// ============================================================================

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
    tags: ['synthetic', 'main_idea', 'batch3'],
    status: 'active',
    passage_id: passage.id,
    week_phase: 'fundamental',
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
    tags: ['synthetic', 'inference', 'batch3'],
    status: 'active',
    passage_id: passage.id,
    week_phase: 'balanced',
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
    stem: `As used in the passage, the word "${getVocabWord(passage)}" most nearly means`,
    choices: generateVocabChoices(passage),
    answer_key: 'A',
    rationale: 'The correct answer reflects the meaning of the word as used in the context of the passage.',
    tags: ['synthetic', 'vocab_context', 'batch3'],
    status: 'active',
    passage_id: passage.id,
    week_phase: 'fundamental',
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
      : 'Why does the author include specific details about the setting?',
    choices: generateCraftChoices(passage),
    answer_key: 'A',
    rationale: "The correct answer reflects the author's intent and purpose in constructing the passage.",
    tags: ['synthetic', 'author_craft', 'batch3'],
    status: 'active',
    passage_id: passage.id,
    week_phase: 'balanced',
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
    tags: ['synthetic', 'supporting_details', 'batch3'],
    status: 'active',
    passage_id: passage.id,
    week_phase: 'fundamental',
    created_at: now
  })

  return items
}

function getVocabWord(passage: Passage): string {
  const words = passage.text.match(/\b\w{7,12}\b/g) || ['important']
  return words[Math.floor(words.length / 3)] || 'significant'
}

function generateMainIdeaChoices(passage: Passage): string[] {
  if (passage.genre === 'informational') {
    return [
      `A. The passage explains an important aspect of ${passage.title.toLowerCase().split(' ').slice(0, 3).join(' ')}.`,
      `B. The passage only provides background information.`,
      `C. The passage focuses on debating different viewpoints.`,
      `D. The passage argues against the importance of the topic.`
    ]
  } else {
    return [
      `A. The story illustrates how challenges can lead to growth and understanding.`,
      `B. The story is mainly focused on describing the setting.`,
      `C. The story suggests that change is impossible.`,
      `D. The story emphasizes that characters should never take risks.`
    ]
  }
}

function generateInferenceChoices(passage: Passage): string[] {
  if (passage.genre === 'informational') {
    return [
      'A. The topic discussed continues to be studied and developed.',
      'B. Scientists have abandoned research in this area.',
      'C. The information is only relevant to experts.',
      'D. No further progress is possible in this field.'
    ]
  } else {
    return [
      'A. The character has developed new understanding through their experiences.',
      'B. The character learned nothing from the events.',
      'C. The character will avoid similar situations in the future.',
      'D. The other characters were more affected than the main character.'
    ]
  }
}

function generateVocabChoices(passage: Passage): string[] {
  return [
    'A. having significance or importance',
    'B. being small or trivial',
    'C. causing problems or confusion',
    'D. lacking any clear purpose'
  ]
}

function generateCraftChoices(passage: Passage): string[] {
  if (passage.genre === 'informational') {
    return [
      'A. to inform readers about the topic and its significance',
      'B. to convince readers to take immediate action',
      'C. to entertain readers with fictional scenarios',
      'D. to confuse readers with technical jargon'
    ]
  } else {
    return [
      'A. to help readers understand the characters and their emotional journeys',
      'B. to distract readers from the main plot',
      'C. to demonstrate the author\'s knowledge of geography',
      'D. to suggest that setting is more important than character'
    ]
  }
}

function generateDetailChoices(passage: Passage): string[] {
  if (passage.genre === 'informational') {
    return [
      'A. The passage includes specific evidence to support its main points.',
      'B. The passage contains no factual information.',
      'C. All information in the passage is disputed by experts.',
      'D. The passage contradicts established scientific understanding.'
    ]
  } else {
    return [
      "A. The character's behavior and choices demonstrate personal growth.",
      'B. The character remains completely unchanged from beginning to end.',
      'C. Other characters prevent any development from occurring.',
      'D. The story provides no evidence of character change.'
    ]
  }
}

// ============================================================================
// Main function
// ============================================================================

async function main() {
  console.log('Generating batch 3 of reading passages to reach 50%...\n')

  // Load existing data
  const existingPassages: Passage[] = JSON.parse(
    fs.readFileSync(path.join(BANK_DIR, 'passages.json'), 'utf8')
  )
  const existingItems: Item[] = JSON.parse(
    fs.readFileSync(path.join(BANK_DIR, 'items.json'), 'utf8')
  )

  const mathItems = existingItems.filter(i => i.subject === 'math').length
  const currentReadingItems = existingItems.filter(i => i.subject === 'reading').length

  console.log(`Starting with ${existingPassages.length} passages and ${existingItems.length} items`)
  console.log(`  - Reading items: ${currentReadingItems}`)
  console.log(`  - Math items: ${mathItems}`)
  console.log(`  - Need ${mathItems - currentReadingItems} more reading items to reach 50%`)

  const newPassages: Passage[] = []
  const newItems: Item[] = []
  const now = new Date().toISOString()

  // Combine all passage sources
  const allNewPassageTemplates = [
    ...sciencePassages,
    ...historyGeoPassages,
    ...literaryPassages,
    ...moreInformationalPassages,
    ...moreLiteraryPassages
  ]

  console.log(`\nProcessing ${allNewPassageTemplates.length} new passages...`)

  for (const template of allNewPassageTemplates) {
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

  const finalReadingCount = allItems.filter(i => i.subject === 'reading').length
  const finalMathCount = allItems.filter(i => i.subject === 'math').length
  const readingPercent = ((finalReadingCount / allItems.length) * 100).toFixed(1)

  console.log('\n========================================')
  console.log('Generation Complete!')
  console.log('========================================')
  console.log(`New passages added: ${newPassages.length}`)
  console.log(`New items added: ${newItems.length}`)
  console.log(`\nTotal passages: ${allPassages.length}`)
  console.log(`Total items: ${allItems.length}`)
  console.log(`  - Reading: ${finalReadingCount} (${readingPercent}%)`)
  console.log(`  - Math: ${finalMathCount} (${(100 - parseFloat(readingPercent)).toFixed(1)}%)`)
  console.log(`\nRun 'npx tsx scripts/importBank.ts' to upload to Supabase`)
}

main().catch(console.error)
