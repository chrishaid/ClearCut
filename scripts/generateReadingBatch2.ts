/**
 * Generate a large batch of reading passages to reach 50% reading/math balance
 * Target: ~525 more reading items (105 passages × 5 questions each)
 *
 * Usage:
 *   npx tsx scripts/generateReadingBatch2.ts
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
// INFORMATIONAL PASSAGES - Science & Nature
// ============================================================================

const sciencePassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'informational',
    title: 'The Water Cycle',
    lexile_band: '940L',
    text: `Water is constantly moving around our planet in an endless cycle. This process, called the water cycle or hydrological cycle, has been operating for billions of years and is essential for all life on Earth.

The cycle begins with evaporation. When the sun heats water in oceans, lakes, and rivers, some of that water turns into water vapor and rises into the atmosphere. Plants also release water vapor through a process called transpiration, adding to the moisture in the air.

As water vapor rises, it cools and condenses into tiny droplets that form clouds. This process is called condensation. You can see condensation happen when water droplets form on the outside of a cold glass on a warm day.

When clouds become heavy with water droplets, precipitation occurs. This can take the form of rain, snow, sleet, or hail, depending on temperature conditions. Some precipitation falls directly into oceans and lakes, while other precipitation falls on land.

Water that falls on land has several possible paths. Some soaks into the ground, becoming groundwater that can remain underground for thousands of years. Some flows over the surface as runoff, eventually reaching streams and rivers that carry it back to the ocean. Some is absorbed by plants and animals.

The water cycle connects all water on Earth. A water molecule in your glass might have once been part of a dinosaur, a glacier, or a cloud over the Amazon rainforest. This constant recycling means Earth has the same amount of water today as it did millions of years ago.`
  },
  {
    genre: 'informational',
    title: 'How Volcanoes Form',
    lexile_band: '980L',
    text: `Deep beneath Earth's surface, temperatures are hot enough to melt rock. This molten rock, called magma, is less dense than the solid rock surrounding it, so it slowly rises toward the surface. When magma finds a path to erupt, a volcano is born.

Most volcanoes form along the edges of tectonic plates, the massive slabs of rock that make up Earth's outer layer. These plates are constantly moving, though so slowly that we rarely notice. Where plates collide or pull apart, conditions are right for volcanic activity.

At subduction zones, one plate slides beneath another. As the lower plate sinks into Earth's interior, it heats up and releases water into the rock above. This water lowers the melting point of the rock, creating magma. The Cascade volcanoes of the Pacific Northwest, including Mount St. Helens, formed this way.

At divergent boundaries, plates pull apart and magma rises to fill the gap. The Mid-Atlantic Ridge, an underwater mountain chain running down the center of the Atlantic Ocean, is an example. Iceland sits on this ridge, which explains its many active volcanoes.

Some volcanoes form far from plate boundaries, over hot spots—areas where especially hot material rises from deep within Earth. The Hawaiian Islands formed as the Pacific Plate moved slowly over a stationary hot spot. Each island is an ancient volcano, with the Big Island being the youngest and most active.

Volcanoes are classified as active, dormant, or extinct based on their eruption history. Active volcanoes have erupted recently or show signs of future activity. Dormant volcanoes haven't erupted in a long time but could awaken. Extinct volcanoes are unlikely to erupt again.`
  },
  {
    genre: 'informational',
    title: 'The Life of a Star',
    lexile_band: '1020L',
    text: `Every star in the night sky is a massive ball of hot gas undergoing nuclear fusion. Stars are born, live for millions or billions of years, and eventually die—sometimes in spectacular explosions. Understanding this life cycle helps astronomers learn about the universe's past and future.

Stars begin their lives in nebulae, vast clouds of gas and dust scattered throughout galaxies. When part of a nebula becomes dense enough, gravity causes it to collapse inward. As the material compresses, it heats up. When the core reaches about 15 million degrees Celsius, nuclear fusion begins—hydrogen atoms fuse into helium, releasing enormous energy. A star is born.

A star's mass determines almost everything about its life. Massive stars burn their fuel quickly and live only a few million years. Smaller stars like our Sun burn more slowly, lasting billions of years. The smallest stars, red dwarfs, can shine for trillions of years.

During most of its life, a star exists in a stable state called the main sequence. The outward pressure from fusion in the core balances the inward pull of gravity. Our Sun has been in this phase for about 4.6 billion years and will continue for another 5 billion.

When a star exhausts its hydrogen fuel, its fate depends on its mass. Sun-like stars swell into red giants, then shed their outer layers, leaving behind a dense core called a white dwarf. Massive stars undergo more dramatic deaths, exploding as supernovae and leaving behind neutron stars or black holes.

The elements created in stars and scattered by their deaths form the raw material for new stars, planets, and eventually life. As astronomer Carl Sagan said, "We are made of star stuff."`
  },
  {
    genre: 'informational',
    title: 'Photosynthesis: Nature\'s Solar Power',
    lexile_band: '960L',
    text: `Every time you eat a meal, you're consuming energy that originally came from the sun. Plants capture this solar energy through photosynthesis, one of the most important chemical reactions on Earth. Without photosynthesis, life as we know it could not exist.

The word photosynthesis comes from Greek words meaning "light" and "putting together." That's exactly what plants do—they use light energy to put together simple molecules into complex sugars. The basic equation is elegant: carbon dioxide plus water plus light energy yields glucose and oxygen.

Photosynthesis takes place primarily in leaves, which are essentially biological solar panels. Leaves contain millions of cells, and within these cells are structures called chloroplasts. Chloroplasts contain chlorophyll, a green pigment that absorbs sunlight. This is why most plants are green—chlorophyll absorbs red and blue light but reflects green.

The process occurs in two main stages. In the light-dependent reactions, chlorophyll absorbs sunlight and uses that energy to split water molecules. This releases oxygen as a byproduct—the oxygen we breathe comes from this reaction. The energy is stored in special molecules that power the second stage.

In the light-independent reactions, often called the Calvin cycle, the stored energy is used to convert carbon dioxide from the air into glucose. This sugar provides energy for the plant's growth and activities. Some glucose is converted into starches for storage or cellulose for structure.

Photosynthesis affects the entire planet. It produces the oxygen in our atmosphere and removes carbon dioxide, a greenhouse gas. It forms the base of nearly every food chain on Earth. Understanding and protecting photosynthesis is crucial for addressing climate change and food security.`
  },
  {
    genre: 'informational',
    title: 'The Human Brain',
    lexile_band: '990L',
    text: `The human brain weighs only about three pounds, yet it is the most complex object we have ever discovered in the universe. With roughly 86 billion neurons making trillions of connections, your brain enables everything you think, feel, remember, and do.

The brain is divided into distinct regions, each with specialized functions. The cerebrum, the largest part, handles conscious thought, learning, and voluntary movement. It's divided into two hemispheres connected by a bridge of nerve fibers. The left hemisphere generally controls the right side of the body and is associated with language and logic, while the right hemisphere controls the left side and is linked to creativity and spatial awareness.

Beneath the cerebrum lies the cerebellum, which coordinates movement and balance. Though much smaller than the cerebrum, the cerebellum contains more than half of all neurons in the brain. At the brain's base, the brainstem controls vital automatic functions like breathing, heart rate, and sleep.

Neurons communicate through electrical impulses and chemical signals called neurotransmitters. When you learn something new, connections between neurons strengthen. This plasticity—the brain's ability to reorganize itself—continues throughout life, though it's strongest in childhood.

The brain consumes about 20 percent of your body's energy despite being only 2 percent of your body weight. It requires a constant supply of oxygen and glucose. Just a few minutes without oxygen can cause permanent damage.

Modern imaging technologies like MRI allow scientists to watch the brain in action. Yet despite decades of research, many mysteries remain. How does the brain generate consciousness? How are memories stored and retrieved? These questions drive ongoing research into the organ that defines who we are.`
  },
  {
    genre: 'informational',
    title: 'Ocean Zones and Marine Life',
    lexile_band: '950L',
    text: `The ocean covers more than 70 percent of Earth's surface, yet much of it remains unexplored. Scientists divide the ocean into distinct zones based on depth, each with unique conditions that support different forms of life.

The sunlight zone, also called the epipelagic zone, extends from the surface to about 200 meters deep. Enough light penetrates here for photosynthesis, making this zone home to most ocean plants and the animals that eat them. Coral reefs, sea turtles, sharks, and most familiar marine creatures live in this zone.

Below the sunlight zone lies the twilight zone, or mesopelagic zone, extending to about 1,000 meters. Only dim blue light reaches here—not enough for photosynthesis. Many twilight zone creatures have large eyes to capture what little light exists. Others produce their own light through bioluminescence.

The midnight zone, or bathypelagic zone, extends from 1,000 to 4,000 meters. No sunlight reaches this depth. The water is near freezing, and pressure is crushing—about 400 times greater than at the surface. Yet life persists. Creatures here often have no eyes, relying on other senses to navigate the darkness.

Below 4,000 meters are the abyssal and hadal zones. The abyssal zone, extending to 6,000 meters, covers most of the ocean floor. The hadal zone includes the deepest ocean trenches, reaching nearly 11,000 meters in the Mariana Trench. Remarkably, even here, scientists have found life.

Food in the deep ocean comes from above—dead organisms and waste drifting down in what scientists call "marine snow." Hydrothermal vents on the ocean floor provide another food source, supporting unique ecosystems that don't depend on sunlight at all.`
  },
  {
    genre: 'informational',
    title: 'The Science of Sound',
    lexile_band: '940L',
    text: `When you hear music, laughter, or thunder, you're detecting vibrations traveling through air. Sound is a form of energy that moves in waves, and understanding these waves helps explain everything from how we hear to why thunder rumbles.

Sound waves are compression waves. When something vibrates—a guitar string, a speaker cone, or vocal cords—it pushes against nearby air molecules. These molecules bump into their neighbors, which bump into their neighbors, creating a chain reaction that travels outward from the source.

Sound waves have several measurable properties. Frequency, measured in Hertz (Hz), determines pitch—how high or low a sound seems. Humans can hear frequencies roughly between 20 Hz and 20,000 Hz. Amplitude determines volume—larger vibrations create louder sounds. Wavelength is the distance between wave peaks.

Sound travels at different speeds through different materials. In air at room temperature, sound travels about 343 meters per second—fast, but much slower than light. This difference explains why you see lightning before hearing thunder. Sound moves faster through liquids and fastest through solids, where molecules are packed closely together.

The Doppler effect explains why a siren sounds higher-pitched as an ambulance approaches and lower as it moves away. When the source moves toward you, sound waves compress, increasing frequency. When it moves away, waves stretch out, lowering frequency.

Our ears are remarkably sophisticated sound detectors. The outer ear funnels sound waves to the eardrum, which vibrates. These vibrations pass through tiny bones to the cochlea, a fluid-filled spiral tube lined with hair cells. Different hair cells respond to different frequencies, sending signals to the brain that we perceive as sound.`
  },
  {
    genre: 'informational',
    title: 'Ecosystems and Food Webs',
    lexile_band: '930L',
    text: `In any environment, living organisms don't exist in isolation. They interact constantly with each other and with their physical surroundings, forming complex systems called ecosystems. Understanding these connections helps us protect the natural world.

An ecosystem includes all living things in an area—plants, animals, fungi, bacteria—along with non-living elements like water, soil, sunlight, and temperature. These components are connected through the flow of energy and cycling of nutrients.

Energy enters most ecosystems through photosynthesis. Plants and other producers convert sunlight into food. This energy then flows through the ecosystem as organisms eat each other. Herbivores eat plants, carnivores eat herbivores, and omnivores eat both. Decomposers break down dead organisms, returning nutrients to the soil.

Simple food chains show direct feeding relationships: grass → rabbit → fox. But real ecosystems are more complicated. A rabbit might eat many plant species, and it might be eaten by foxes, hawks, and snakes. These interconnected chains form food webs.

The concept of trophic levels describes an organism's position in the food web. Producers occupy the first level. Primary consumers (herbivores) occupy the second. Secondary consumers (carnivores that eat herbivores) occupy the third, and so on. Energy is lost at each level—typically 90 percent—which limits how many levels an ecosystem can support.

Keystone species have disproportionate effects on their ecosystems. When sea otters disappeared from the Pacific coast, sea urchin populations exploded and devoured kelp forests. Returning the otters restored balance. Protecting ecosystems often means protecting these key species.`
  },
  {
    genre: 'informational',
    title: 'Electricity: Powering Modern Life',
    lexile_band: '970L',
    text: `Every time you flip a light switch, charge your phone, or watch television, you're using electricity. This invisible force powers nearly every aspect of modern life, yet many people don't understand what it actually is or how it reaches our homes.

Electricity is the flow of electrons, tiny particles found in atoms. When electrons move through a material, they carry energy that can power lights, motors, and electronics. Materials that allow electrons to flow easily—like copper and silver—are called conductors. Materials that resist electron flow—like rubber and plastic—are insulators.

Electric current flows in circuits, complete paths that allow electrons to travel from a power source, through devices, and back to the source. Breaking the circuit stops the flow, which is what happens when you flip a switch to "off." Circuits include power sources (batteries or outlets), conductors (wires), and loads (devices that use electricity).

Voltage, current, and resistance are the three fundamental measurements of electricity. Voltage, measured in volts, is the "pressure" pushing electrons through a circuit. Current, measured in amperes (amps), is the rate of electron flow. Resistance, measured in ohms, describes how much a material opposes current flow.

Most electricity comes from power plants that use various energy sources. Coal, natural gas, and nuclear plants heat water to create steam that spins turbines connected to generators. Hydroelectric dams use falling water to spin turbines. Wind turbines and solar panels are increasingly common renewable alternatives.

The electrical grid—a vast network of power lines, transformers, and substations—delivers electricity from power plants to homes and businesses. This system must constantly balance supply and demand, as electricity is difficult to store in large quantities.`
  },
  {
    genre: 'informational',
    title: 'The Immune System: Your Body\'s Defense Force',
    lexile_band: '980L',
    text: `Every day, your body encounters countless bacteria, viruses, and other potential threats. Yet you rarely get sick because of your immune system, a complex network of cells, tissues, and organs that work together to defend against invaders.

The immune system has multiple layers of defense. The first line includes physical barriers like skin, which blocks most pathogens from entering the body. Mucus in the nose and throat traps particles before they can reach the lungs. Stomach acid kills many microorganisms in food.

If pathogens breach these barriers, the innate immune system responds. This system is present from birth and reacts quickly to any threat. White blood cells called phagocytes engulf and destroy invaders. Inflammation—redness, swelling, and warmth—increases blood flow to infected areas, bringing more immune cells.

The adaptive immune system is more specialized. It learns to recognize specific pathogens and remembers them for future encounters. When a pathogen enters the body, specialized cells called lymphocytes identify it and create antibodies—proteins that mark the pathogen for destruction.

B cells produce antibodies that circulate in the blood, neutralizing pathogens before they can cause infection. T cells directly attack infected cells. Some T and B cells become memory cells that remain in the body for years, providing lasting immunity. This is why you usually get diseases like chickenpox only once.

Fever is often a sign that the immune system is working. Higher body temperatures can slow pathogen reproduction and speed up immune responses. However, very high fevers can be dangerous, which is why doctors sometimes recommend fever-reducing medications.`
  },
]

// ============================================================================
// INFORMATIONAL PASSAGES - History & Social Studies
// ============================================================================

const historyPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'informational',
    title: 'The Industrial Revolution',
    lexile_band: '1010L',
    text: `In the late 1700s, a transformation began in Britain that would reshape human civilization. The Industrial Revolution, as historians call it, replaced hand production with machine manufacturing and changed where and how people lived and worked.

Before industrialization, most people lived in rural areas and worked in agriculture or cottage industries. Families produced goods at home using simple tools. A weaver might make cloth on a hand loom, working at their own pace with materials they processed themselves.

The revolution began with innovations in textile manufacturing. The spinning jenny, water frame, and power loom dramatically increased cloth production. What once took weeks could now be done in hours. These machines required large buildings and power sources, leading to the construction of factories near rivers and, later, coal mines.

Steam power, developed by inventors like James Watt, proved transformative. Steam engines could be built anywhere coal was available, freeing factories from river locations. Steam also powered locomotives and ships, revolutionizing transportation and enabling the rapid movement of goods and people.

The social changes were profound. People migrated from farms to factory towns, creating new urban centers. Factory work was grueling—long hours, dangerous conditions, and low pay were common. Child labor was widespread. These conditions eventually led to labor movements and laws protecting workers.

The Industrial Revolution spread from Britain to Europe, North America, and eventually worldwide. It raised living standards over time and created the consumer economy we know today. But it also brought pollution, urban crowding, and vast inequality. Understanding this era helps us grapple with the consequences of rapid technological change.`
  },
  {
    genre: 'informational',
    title: 'Ancient Egypt: Life Along the Nile',
    lexile_band: '950L',
    text: `For over three thousand years, one of the world's greatest civilizations flourished along the banks of the Nile River. Ancient Egypt developed remarkable achievements in architecture, medicine, writing, and government that continue to fascinate people today.

The Nile was the foundation of Egyptian civilization. Each year, the river flooded, depositing rich soil perfect for farming. In a region surrounded by desert, this narrow strip of fertile land—only a few miles wide—supported millions of people. Egyptians called their country "the black land" after this dark, productive soil.

Egyptian society was organized as a hierarchy. At the top sat the pharaoh, considered both king and god. Below were nobles, priests, and government officials. Skilled workers like scribes and craftsmen held middle positions. Farmers and laborers formed the majority, and slaves occupied the lowest level.

Writing was crucial to Egyptian administration and culture. Hieroglyphics, a system of picture symbols, was used for religious texts and monuments. A simpler script called hieratic served everyday purposes. For centuries, these scripts remained undeciphered until the Rosetta Stone's discovery in 1799 provided the key.

The pyramids stand as Egypt's most famous legacy. These massive tombs were built for pharaohs, who believed they would need their preserved bodies and buried treasures in the afterlife. The Great Pyramid of Giza, built around 2560 BCE, remained the tallest human-made structure for nearly 4,000 years.

Egyptian achievements extended beyond architecture. Doctors performed surgery and set broken bones. Mathematicians developed geometry for land surveying. Artists created paintings and sculptures following distinctive styles that remained consistent across millennia.`
  },
  {
    genre: 'informational',
    title: 'The Civil Rights Movement',
    lexile_band: '990L',
    text: `In the mid-twentieth century, African Americans and their allies launched a sustained campaign to end segregation and secure equal rights. The Civil Rights Movement transformed American society and inspired freedom movements around the world.

Despite the end of slavery in 1865, African Americans faced systemic discrimination. Jim Crow laws in Southern states enforced racial segregation in schools, restaurants, transportation, and public facilities. Poll taxes, literacy tests, and violence prevented Black citizens from voting. Lynching terrorized communities.

The movement gained momentum after World War II. Black veterans who had fought for freedom abroad refused to accept second-class citizenship at home. Legal challenges began dismantling segregation, culminating in the Supreme Court's 1954 Brown v. Board of Education decision, which declared school segregation unconstitutional.

Grassroots activism proved equally important. In 1955, Rosa Parks refused to give up her bus seat in Montgomery, Alabama, sparking a year-long bus boycott. The boycott brought a young minister named Martin Luther King Jr. to national attention. His philosophy of nonviolent resistance, inspired by Mahatma Gandhi, became central to the movement.

Throughout the late 1950s and 1960s, activists organized sit-ins, freedom rides, and voter registration drives. They faced fire hoses, police dogs, and imprisonment. Some, like Medgar Evers and four young girls bombed in a Birmingham church, paid with their lives.

Major legislation followed sustained pressure. The Civil Rights Act of 1964 outlawed discrimination in public accommodations and employment. The Voting Rights Act of 1965 protected voting rights. These laws didn't end racism, but they removed legal barriers and established principles of equality under law.`
  },
  {
    genre: 'informational',
    title: 'The Silk Road: Ancient Trade Networks',
    lexile_band: '970L',
    text: `For over a thousand years, a network of trade routes connected China to the Mediterranean Sea. Known as the Silk Road, these paths carried not only silk but also ideas, religions, technologies, and diseases across continents.

The Silk Road wasn't a single road but a web of routes crossing Central Asia. Traders rarely traveled the entire distance. Instead, goods passed through many hands, each trader covering a portion of the journey. Oasis towns along the way became thriving commercial centers where merchants exchanged goods and information.

Chinese silk was the most famous commodity, prized in Rome for its beauty and rarity. The secrets of silk production were closely guarded for centuries. But trade flowed both ways—horses, glass, precious metals, and spices moved eastward to China. Camels carried most goods across the harsh deserts and mountain passes.

Cultural exchange accompanied commercial trade. Buddhism spread from India to China along these routes. Islamic culture and learning reached Central Asia. Technologies like papermaking, gunpowder, and printing traveled westward, eventually transforming European society.

The Silk Road also carried dangers. Bandits threatened merchants, leading to the development of fortified caravanserais—rest stops where travelers could find safety. Diseases spread along trade routes too. The Black Death reached Europe from Asia in the 1340s, carried by fleas on rats traveling with merchant caravans.

The Silk Road's importance declined after the 1400s as European ships opened ocean routes to Asia. But its legacy endures. The cultural connections forged along these ancient paths shaped civilizations on both ends of the Eurasian landmass.`
  },
  {
    genre: 'informational',
    title: 'Democracy in Ancient Greece',
    lexile_band: '1000L',
    text: `The word democracy comes from Greek words meaning "rule by the people." In ancient Athens, citizens developed a system of self-government that, despite its limitations, influenced democratic ideals for millennia.

Athenian democracy emerged around 500 BCE after a series of reforms. The statesman Cleisthenes reorganized Athenian society and created institutions that gave citizens direct participation in government. This was radical—most ancient societies were ruled by kings or aristocrats.

The Assembly was the central democratic institution. All male citizens could attend, debate, and vote on laws, war and peace, and public spending. Major decisions required a quorum of 6,000 citizens. Sessions were held on a hillside called the Pnyx, where speakers addressed crowds without amplification.

Citizens also served on juries and in administrative positions, often selected by lottery. The Athenians believed random selection was more democratic than elections, which they associated with aristocratic influence. Officials served short terms and were subject to review of their conduct.

However, Athenian democracy was limited by modern standards. Women, enslaved people, and foreign residents could not participate. Perhaps 10 to 20 percent of the population were citizens. The leisure for political participation depended partly on labor by those excluded from citizenship.

Despite these limitations, Athens developed practices that remain relevant: open debate, majority rule, rule of law, and the idea that ordinary people can govern themselves. Philosophers like Plato and Aristotle analyzed and criticized democracy, creating political theory that continues to inform debates about government.`
  },
  {
    genre: 'informational',
    title: 'The Age of Exploration',
    lexile_band: '980L',
    text: `In the 1400s and 1500s, European sailors embarked on voyages that transformed the world. The Age of Exploration opened new trade routes, connected previously isolated societies, and began an era of European colonization that would reshape every continent.

Several factors drove European exploration. Ottoman control of eastern Mediterranean trade routes made Asian goods expensive. European merchants sought alternative routes to access spices, silk, and other valuable commodities. Meanwhile, advances in shipbuilding and navigation made long ocean voyages possible.

Portugal led early exploration. Prince Henry the Navigator sponsored voyages along the African coast, establishing trading posts and mapping unknown waters. In 1488, Bartolomeu Dias rounded the Cape of Good Hope. A decade later, Vasco da Gama reached India by sea, opening direct trade between Europe and Asia.

Spain sponsored Christopher Columbus, who sailed west in 1492 seeking Asia. He found the Americas instead—a "New World" unknown to Europeans. Over the following decades, Spanish conquistadors conquered the Aztec and Inca empires, claiming vast territories and enormous wealth.

The consequences were profound and often devastating. European diseases—smallpox, measles, typhus—killed millions of indigenous Americans who had no immunity. Some estimates suggest 90 percent of the pre-Columbian population died within a century. European colonizers exploited both land and people, establishing systems of forced labor and slavery.

The Columbian Exchange transformed life on both sides of the Atlantic. Crops like potatoes, tomatoes, and corn came to Europe and Africa. Wheat, horses, and cattle went to the Americas. This biological exchange permanently altered agriculture, diets, and ecosystems worldwide.`
  },
  {
    genre: 'informational',
    title: 'The Great Migration',
    lexile_band: '970L',
    text: `Between 1910 and 1970, approximately six million African Americans left the rural South for cities in the North, Midwest, and West. This massive population shift, known as the Great Migration, transformed American society and culture.

Life in the Jim Crow South motivated many to leave. Sharecropping trapped Black farmers in cycles of debt. Segregation limited opportunities. Racial violence threatened lives. When World War I reduced European immigration while Northern factories needed workers, agents traveled South recruiting laborers.

The journey north offered hope but not an escape from racism. African Americans faced housing discrimination, job ceilings, and sometimes violence in their new cities. Neighborhoods like Chicago's South Side, Harlem in New York, and Detroit's Black Bottom became vibrant but overcrowded communities.

The migration reshaped American culture. Jazz, born in New Orleans, reached national audiences through clubs in Chicago and New York. The Harlem Renaissance brought an explosion of African American literature, art, and intellectual life. Black newspapers like the Chicago Defender connected communities across regions.

Political power shifted too. In the South, Black citizens could rarely vote. In Northern cities, their votes mattered. Politicians began courting Black voters. The growing urban Black population would later provide crucial support for the Civil Rights Movement.

The Great Migration fundamentally changed where and how African Americans lived. In 1910, 90 percent lived in the South, mostly in rural areas. By 1970, 80 percent lived in cities, spread across the country. This demographic shift created the diverse, urban Black communities that characterize American cities today.`
  },
]

// ============================================================================
// INFORMATIONAL PASSAGES - Technology & Innovation
// ============================================================================

const techPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'informational',
    title: 'How GPS Works',
    lexile_band: '990L',
    text: `Every time you use a maps app on your phone, you're connecting to a network of satellites orbiting 20,000 kilometers above Earth. The Global Positioning System, or GPS, uses these satellites to determine your precise location anywhere on the planet.

GPS began as a military project in the 1970s. The U.S. Department of Defense wanted a navigation system that would work anywhere on Earth, in any weather, 24 hours a day. After billions of dollars and years of development, the system became fully operational in 1995. Today, GPS is used by billions of people daily.

The system relies on 24 to 32 satellites continuously orbiting Earth. Each satellite carries extremely precise atomic clocks and constantly broadcasts signals containing its position and the exact time. Your GPS receiver picks up signals from multiple satellites and uses them to calculate your location.

The calculation involves measuring time differences. When your receiver detects a satellite signal, it notes the time the signal was sent and compares it to the current time. Since the signal travels at the speed of light, the receiver can calculate how far away that satellite is. With distance measurements from at least four satellites, the receiver can determine your exact position through a process called trilateration.

Accuracy depends on several factors. The military uses an encrypted signal accurate to within centimeters. Civilian GPS is typically accurate to within a few meters. Trees, buildings, and atmospheric conditions can all affect accuracy. Modern systems combine GPS with other technologies to improve precision.

GPS has transformed countless industries. Farmers use it for precision agriculture, airplane pilots for navigation, and scientists for tracking wildlife. Autonomous vehicles depend on GPS for positioning. The technology that began as a military tool has become essential infrastructure for modern life.`
  },
  {
    genre: 'informational',
    title: 'The Story of Smartphones',
    lexile_band: '950L',
    text: `The smartphone in your pocket contains more computing power than the computers that sent astronauts to the Moon. This pocket-sized device combines technologies that were once separate—phone, camera, computer, music player, GPS—into a single tool that has transformed daily life.

The smartphone era began in 2007 when Apple introduced the iPhone. Earlier devices had combined phones with computing features, but the iPhone's touch screen interface and app ecosystem created something fundamentally new. Users could download applications that extended the phone's capabilities in endless ways.

The technology inside smartphones represents decades of innovation. Touch screens use capacitive sensing—your finger's electrical conductivity triggers precise responses. Processors have become incredibly powerful while using minimal power. Lithium-ion batteries store energy densely enough to power these devices for hours. High-resolution cameras rival dedicated equipment.

Connectivity makes smartphones truly powerful. Cellular networks provide internet access almost anywhere. Wi-Fi connects to local networks. Bluetooth links to headphones and other devices. GPS enables navigation and location-based services. Each connection opens new possibilities.

Smartphone apps have created entire industries. Social media platforms reach billions of users. Ride-sharing services transformed transportation. Mobile payments are replacing cash in many countries. Health apps monitor everything from sleep to heart rhythms.

The impact isn't entirely positive. Concerns about screen time, social media's effects on mental health, and digital privacy have grown alongside smartphone adoption. Many people feel unable to disconnect from devices that were meant to be convenient tools. Navigating this relationship between human and machine remains an ongoing challenge.`
  },
  {
    genre: 'informational',
    title: '3D Printing: Manufacturing Revolution',
    lexile_band: '980L',
    text: `Traditional manufacturing typically involves removing material—cutting, drilling, milling until a block becomes a finished product. 3D printing flips this approach, building objects layer by layer from the bottom up. This additive manufacturing process is transforming how we make things.

The technology works like a very precise hot glue gun controlled by a computer. A 3D printer reads a digital design file and deposits material in thin layers, each one fusing to the layer below. Common materials include plastics, metals, ceramics, and even concrete. Some printers can use multiple materials in the same object.

3D printing began in the 1980s as a rapid prototyping tool. Engineers could quickly produce models to test designs before committing to expensive traditional manufacturing. As the technology improved and costs dropped, applications expanded dramatically.

Today, 3D printing produces everything from custom prosthetics to aerospace components. Dental labs print crowns tailored to individual patients. Architects print building models. Automotive companies print replacement parts for classic cars. Artists create sculptures impossible to make any other way.

The technology offers unique advantages. It excels at customization—each printed object can be different at no extra cost. Complex internal structures that would be impossible to machine can be printed easily. Small quantities are economical since there's no expensive tooling to produce.

Looking ahead, 3D printing continues to evolve. Researchers are printing living tissue for medical applications. Construction companies are printing buildings. Some envision 3D printers in homes, producing objects on demand. While this vision remains distant, the technology has already revolutionized specialized manufacturing.`
  },
  {
    genre: 'informational',
    title: 'Renewable Energy Sources',
    lexile_band: '960L',
    text: `Fossil fuels—coal, oil, and natural gas—have powered modern civilization but contribute to climate change. Renewable energy sources offer alternatives that can generate electricity without releasing carbon dioxide. Understanding these technologies helps us envision a sustainable energy future.

Solar power captures energy from sunlight. Photovoltaic cells convert light directly into electricity using semiconductor materials. When sunlight hits the cell, it knocks electrons loose, creating electrical current. Solar panels work even on cloudy days, though they produce less power. Solar's biggest challenge is intermittency—the sun doesn't shine at night.

Wind power uses turbines to capture energy from moving air. Modern wind turbines stand hundreds of feet tall, with blades spanning the length of football fields. When wind turns the blades, they spin a generator to produce electricity. Wind farms, often located offshore or on plains, can generate massive amounts of power.

Hydroelectric power has been used for over a century. Dams create reservoirs of water at height. When released, the water flows through turbines that generate electricity. Hydropower provides reliable, controllable electricity but requires specific geographic conditions and can disrupt river ecosystems.

Geothermal energy taps heat from Earth's interior. In volcanic regions, hot water or steam from underground can drive turbines directly. Elsewhere, heat pumps can use the consistent underground temperature for heating and cooling buildings. Geothermal provides constant power but is limited to certain locations.

Each renewable source has advantages and limitations. The key to a sustainable energy system likely involves combining multiple sources, along with improved storage technologies to handle intermittency. Transitioning from fossil fuels will require continued innovation and investment.`
  },
  {
    genre: 'informational',
    title: 'How Video Games Are Made',
    lexile_band: '940L',
    text: `Behind every video game is a team of creative people working together for months or years. Making a game requires combining art, technology, and storytelling in ways that engage players. Understanding this process reveals the complexity behind the games we play.

Game development typically begins with a concept phase. Designers create documents describing the game's mechanics, story, characters, and overall vision. They might build simple prototypes to test whether ideas are fun. Not every concept moves forward—many are abandoned before development truly begins.

Artists create the visual elements that players see. Character artists design and model heroes, villains, and creatures. Environment artists build the worlds where games take place. Animators make characters move realistically. User interface designers create menus and on-screen information. All of this work must fit together visually.

Programmers write the code that makes everything function. Game engines—the underlying software frameworks—handle graphics, physics, and sound. Programmers write specific code for character behavior, game rules, and interactions. Bug fixing consumes enormous time; games are incredibly complex, and errors can appear anywhere.

Sound designers add another layer of immersion. Music sets emotional tone. Sound effects—footsteps, weapon sounds, environmental noise—make game worlds feel real. Voice actors bring characters to life. All these elements must blend seamlessly.

Testing is crucial. Quality assurance testers play games repeatedly, searching for bugs, balance problems, and anything that isn't fun. Their feedback drives revisions. Major games undergo thousands of hours of testing before release.

Modern major games can cost hundreds of millions of dollars and involve hundreds of developers. Even smaller indie games typically require small teams working for years. Every game you play represents enormous creative effort.`
  },
  {
    genre: 'informational',
    title: 'Robotics in Everyday Life',
    lexile_band: '950L',
    text: `When most people think of robots, they imagine humanoid machines from science fiction. But real robots are everywhere, performing tasks that range from mundane to dangerous. Robotics has become essential to manufacturing, medicine, exploration, and increasingly, our homes.

Factory robots have existed since the 1960s, but modern industrial robots are far more sophisticated. They weld car bodies, package food, and assemble electronics with speed and precision humans can't match. Collaborative robots, designed to work safely alongside humans, are expanding automation to new tasks.

Medical robots assist in surgery, enabling procedures that would be impossible with human hands alone. Robotic systems like the da Vinci Surgical System translate surgeons' hand movements into precise micro-movements. Robots also disinfect hospital rooms, deliver medications, and help rehabilitate patients.

Robots go places too dangerous for humans. They explore the deep ocean, investigate nuclear disasters, and search collapsed buildings for survivors. NASA rovers have explored Mars for decades, sending back data from millions of miles away.

Consumer robots are becoming common. Robot vacuums clean floors autonomously. Toy robots help children learn programming. Social robots provide companionship to elderly people. Delivery robots and drones are beginning to transport packages.

Autonomous vehicles represent robotics' most ambitious consumer application. Self-driving cars must navigate complex environments, recognizing roads, traffic, pedestrians, and countless variables. While fully autonomous vehicles aren't yet common, cars increasingly include robotic features like automatic braking and lane keeping.

The robots of the future will likely be more capable and more common. As artificial intelligence improves, robots will handle increasingly complex tasks. Society will need to address how this affects employment, safety, and what it means to be human in a world of machines.`
  },
]

// ============================================================================
// INFORMATIONAL PASSAGES - Arts & Culture
// ============================================================================

const artsPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'informational',
    title: 'The History of Hip-Hop',
    lexile_band: '960L',
    text: `In the South Bronx in the 1970s, a new musical movement emerged from block parties and community gatherings. Hip-hop would grow from these humble origins to become one of the world's most influential cultural forces.

DJ Kool Herc is often credited as hip-hop's founding father. At parties, he extended the instrumental breaks in funk and soul records—the parts where dancers showed their best moves. He isolated these breaks using two turntables, creating continuous rhythms. This technique, called the breakbeat, became hip-hop's musical foundation.

Rapping evolved from DJs talking over beats, encouraging crowds to dance. Early MCs (master of ceremonies) developed rhyming patterns and storytelling techniques that became increasingly sophisticated. By the late 1970s, songs like "Rapper's Delight" by the Sugarhill Gang brought hip-hop to mainstream audiences.

Breakdancing and graffiti art developed alongside the music. B-boys and b-girls performed athletic, acrobatic moves. Graffiti writers transformed subway cars and walls into canvases. DJing and MCing completed what became known as hip-hop's four elements.

The 1980s and 1990s saw hip-hop diversify and spread. Political groups like Public Enemy addressed social issues. Gangsta rap depicted street life. The East Coast-West Coast rivalry dominated headlines. Hip-hop became the soundtrack of urban America.

Today, hip-hop is global. Artists from every continent create music in the genre. Hip-hop influences fashion, language, advertising, and politics. What began at block parties in a struggling neighborhood has become a multibillion-dollar industry and a dominant force in popular culture. Its story demonstrates how creativity can flourish even in difficult circumstances.`
  },
  {
    genre: 'informational',
    title: 'Shakespeare: The World\'s Most Famous Playwright',
    lexile_band: '1000L',
    text: `William Shakespeare died over 400 years ago, yet his words remain part of everyday English. Phrases like "wild-goose chase," "break the ice," and "heart of gold" all come from his plays. Understanding Shakespeare helps us understand both literature and the English language itself.

Shakespeare was born in Stratford-upon-Avon, England, in 1564. He married Anne Hathaway at 18 and had three children. By his late twenties, he was working as an actor and playwright in London. Details of his life remain sparse—we know his works far better than the man himself.

He wrote approximately 37 plays, along with sonnets and poems. His works include tragedies like Hamlet, Macbeth, and King Lear; comedies like A Midsummer Night's Dream and Much Ado About Nothing; and histories chronicling English kings. Each genre showcases different aspects of his genius.

Shakespeare's plays explore universal themes. Hamlet questions the nature of action and thought. Romeo and Juliet depicts young love against family conflict. The Merchant of Venice examines justice and mercy. These themes resonate across centuries and cultures because they address fundamental human experiences.

His use of language was revolutionary. Shakespeare invented over 1,700 words, including "assassination," "lonely," and "countless." He wrote in iambic pentameter—a rhythm that echoes natural English speech. His metaphors and wordplay remain studied for their brilliance.

Shakespeare's influence extends beyond literature. His plays have been adapted into operas, ballets, films, and musicals. West Side Story retells Romeo and Juliet in 1950s New York. The Lion King parallels Hamlet. Every generation finds new meaning in his work.`
  },
  {
    genre: 'informational',
    title: 'The Art of Animation',
    lexile_band: '940L',
    text: `Animation brings drawings to life through the magic of motion. From classic Disney films to modern computer-generated spectacles, animation has become one of the most popular and technically sophisticated art forms.

Traditional animation, also called cel animation, creates movement by displaying slightly different drawings in rapid sequence. When shown at 24 frames per second, the human eye perceives smooth motion. This optical illusion, called persistence of vision, is the foundation of all animation.

Early animators drew each frame by hand on transparent sheets called cels. Disney's Snow White and the Seven Dwarfs (1937), the first full-length animated feature, required over 200,000 hand-drawn images. This painstaking process continued through classics like Cinderella, The Little Mermaid, and Beauty and the Beast.

Computer animation has revolutionized the industry. Pixar's Toy Story (1995) was the first entirely computer-animated feature film. Instead of drawing frames, animators create digital models and use software to generate movements. Computers can calculate realistic lighting, physics, and textures that would be impossible to draw by hand.

Today, most animated films blend techniques. Computer-generated imagery (CGI) handles complex scenes while traditional principles of animation—timing, weight, anticipation—remain essential. Some films, like Spider-Man: Into the Spider-Verse, deliberately combine styles for artistic effect.

Animation extends beyond entertainment. Medical animations explain surgical procedures. Architectural animations show buildings before they're built. Scientific animations visualize concepts from molecular biology to cosmology. Video games rely entirely on real-time animation. The art form that began with drawings has become essential across industries.`
  },
  {
    genre: 'informational',
    title: 'Museums: Preserving Human History',
    lexile_band: '950L',
    text: `Museums hold the world's treasures—art, artifacts, specimens, and objects that tell the story of human civilization and the natural world. These institutions preserve history, educate visitors, and spark curiosity about our shared heritage.

The concept of museums dates back to ancient times. The word itself comes from the Greek "mouseion," meaning a place sacred to the Muses—goddesses of arts and sciences. The famous Library of Alexandria included collections of art and specimens. Renaissance princes assembled "cabinets of curiosities" displaying remarkable objects.

Modern museums emerged in the 1700s. The British Museum, founded in 1753, was among the first public museums. The Louvre in Paris opened to the public in 1793. These institutions established the idea that cultural treasures should be accessible to everyone, not just the wealthy.

Different types of museums serve different purposes. Art museums like the Metropolitan Museum of Art display paintings, sculptures, and decorative arts. Natural history museums like the Smithsonian preserve specimens from dinosaur fossils to moon rocks. History museums document human events and cultures. Science museums make complex concepts accessible through interactive exhibits.

Behind the scenes, museum professionals do crucial work. Curators research collections and plan exhibitions. Conservators preserve and restore objects. Educators develop programs for schools and the public. Security staff protect priceless treasures. Each role supports the museum's mission.

Museums face ongoing debates. Should objects taken during colonial periods be returned? How should museums present difficult history? How can museums become more inclusive and relevant? These questions reflect broader societal discussions about history, culture, and access.`
  },
]

// ============================================================================
// LITERARY PASSAGES - Various Themes
// ============================================================================

const literaryPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'literary',
    title: 'The Tryout',
    lexile_band: '920L',
    text: `Mia's hands shook as she waited outside the auditorium. Through the doors, she could hear someone finishing their monologue—they were good, really good. What had made her think she could compete?

"Next: Mia Chen!"

Her legs felt wooden as she walked to center stage. The auditorium seats stretched into darkness, but she could see the three drama teachers at a table in the front row, their faces neutral.

"Whenever you're ready," said Ms. Holloway.

Mia opened her mouth, but nothing came out. Three months of practice, countless rehearsals in front of her bedroom mirror, and now—nothing. The silence stretched painfully.

Then she remembered her grandmother's advice: "Before you speak, breathe. Fill yourself with air like a balloon. Let the breath carry your voice."

She closed her eyes, inhaled deeply, and felt her feet solid on the stage. When she opened her eyes, she wasn't in the auditorium anymore. She was Viola from Twelfth Night, shipwrecked on a strange shore, preparing to disguise herself as a man.

The words came, not as memorized lines but as thoughts—her thoughts, Viola's thoughts. Her voice filled the space. She moved naturally, responding to imaginary storms and distant shores. When she finished, she was breathing hard, unsure how much time had passed.

"Thank you," said Ms. Holloway, writing something on her notepad.

Mia walked off stage in a daze. Whatever happened, she'd done it. She'd found the courage to share something real. That was already a kind of victory.

The callback list went up the next day. Her name was third from the top.`
  },
  {
    genre: 'literary',
    title: 'The Science Fair',
    lexile_band: '930L',
    text: `"I'm withdrawing from the science fair," Devon announced at dinner.

His mother set down her fork. "You've been working on that project for two months."

"Marcus copied my idea. Except his dad is an engineer, so his version is way better. I can't win against that."

"Since when is winning the only point?"

Devon pushed food around his plate. Since always, he thought. Since his older sister brought home trophies like report cards and his parents' refrigerator was a shrine to her achievements. Since he was constantly compared to students whose parents could afford private tutors and professional-grade equipment.

His mother seemed to read his thoughts. "You know what I remember about my college applications? Not my grades or test scores. I remember the essay about building a radio with my grandfather—all the ways it failed before it worked."

"But it worked eventually."

"That's not why I wrote about it. I wrote about learning that failure isn't the opposite of success. It's part of success."

Devon thought about his project, a water filtration system using local materials. It wasn't fancy. It wouldn't impress the judges with expensive components. But he'd tested it at the river, and it worked—actually cleaned water that would have made someone sick.

"The fair is about demonstrating understanding," his mother continued. "Not about impressing people with money."

Devon looked at his hands—the same hands that had built something useful from ordinary materials. Maybe that was worth showing, whether he won or not.

"Okay," he said finally. "I'll stay in. But I'm not changing my project."

"I wouldn't want you to."`
  },
  {
    genre: 'literary',
    title: 'Night Shift',
    lexile_band: '950L',
    text: `The hospital corridors were quiet at 3 AM, lit by fluorescent lights that never turned off. Jaylen walked them carefully, pushing his grandmother's wheelchair toward the window at the end of the oncology wing.

"I can never see the stars from my room," Grandma Ruth said. "Too much light pollution."

"Dad said you used to know all the constellations."

"Still do. That's Orion up there—see the three stars in a row? That's his belt. And Betelgeuse, that reddish one, that's his shoulder."

Jaylen followed her finger, seeing the patterns take shape. The stars looked different here than they did at home—clearer somehow, despite the hospital's glow.

"When I was your age, we didn't have all these lights everywhere," Grandma Ruth continued. "The Milky Way looked like someone had spilled milk across the sky. Now most people have never seen it."

"Maybe when you get out of here, we can go somewhere dark. One of those dark sky preserves."

His grandmother was quiet for a moment. They both knew her prognosis wasn't good.

"Maybe," she said. "But if we don't—" She reached back and squeezed his hand. "You know that everything we're made of came from stars? Every atom of carbon, oxygen, iron in our bodies was forged in a star that exploded billions of years ago. We're not separate from them. We're made of them."

Jaylen felt tears threatening but held them back. "That's pretty cool, actually."

"Isn't it?" She smiled, her face pale but peaceful in the starlight. "We're already connected to them, sweetheart. Distance doesn't change that."

They sat together watching until the sky began to lighten, finding shapes in the darkness.`
  },
  {
    genre: 'literary',
    title: 'The Move',
    lexile_band: '910L',
    text: `The last box was packed. Aaliyah walked through the empty rooms of the only house she'd ever known, her footsteps echoing off bare walls.

In the kitchen, a height chart was penciled on the doorframe—nine years of her growth, year by year. In her bedroom, the outline of old posters left shadows on the paint. The living room still smelled faintly of her mother's cooking, countless meals shared around a table that was now loaded in a truck.

"Ready?" her father called from the front door.

She wasn't. How could anyone be ready to leave their whole life behind? Chicago was three states away. She'd be the new kid, starting fresh with no one who remembered her first lost tooth or her embarrassing phase of wearing tutus everywhere.

But she'd seen the letter offering her father the job he'd dreamed of for years. She'd seen her parents' careful expressions trying to hide their excitement. This move wasn't just about her.

She pulled out her phone and took one last photo of the empty living room. Then she walked to the doorframe and ran her finger over the penciled lines.

"Wait," she said. She found a marker in her pocket—purple, her favorite color—and drew a small heart next to the most recent mark. Someone else would live here next. Maybe another kid would start their own height chart. She wanted them to know that this house had been loved.

Her father appeared in the kitchen doorway and saw what she'd done. His eyes glistened, but he just nodded.

"Let's go make some new memories," he said quietly.

Aaliyah took one more look around, then walked out into the sunlight, pulling the door closed behind her.`
  },
  {
    genre: 'literary',
    title: 'The Championship',
    lexile_band: '940L',
    text: `Fourth quarter, two minutes left, down by four. Coach Davis called timeout, and the team huddled around her.

"We've got this," she said, but her voice wavered slightly.

Jordan looked at her teammates—at Sara, nursing a sprained ankle but refusing to come out. At Destiny, who'd played every minute because their backup was out with the flu. At freshman Maya, wide-eyed and terrified but standing her ground.

They were exhausted. The other team was bigger, faster, better-rested. By every measure, this game should already be over.

"Run the pick and roll," Coach continued. "Get the ball to Jordan at the three-point line."

"They'll collapse on Jordan," Sara said. "They've been doing it all game."

"Then I'll pass to whoever's open," Jordan replied, an idea forming. "Maya, when they collapse, you cut to the basket. You'll be wide open."

Maya's eyes went wider. "Me?"

"You've been open all quarter. They're not guarding you because they think you won't shoot."

"They might be right," Maya whispered.

Jordan grabbed her shoulders. "Listen. I was a freshman once. I missed the shot that could've won the district championship. I cried for a week. But I'm still here. Whatever happens, you'll be fine. Just trust your training."

The buzzer called them back. Jordan brought the ball up court, watching the defense. Sure enough, when she drove, three defenders converged. She found Maya cutting to the basket and delivered a perfect bounce pass.

Time seemed to slow. Maya caught the ball, took two steps, and laid it gently off the backboard.

It dropped through the net as the final buzzer sounded. The crowd erupted. And Jordan watched Maya disappear under a pile of celebrating teammates, remembering exactly how that felt.`
  },
  {
    genre: 'literary',
    title: 'The Volunteer',
    lexile_band: '920L',
    text: `"Community service hours are stupid," Alex muttered, pushing through the doors of the animal shelter.

Sixty hours to graduate. Sixty hours of pretending to care about something just to check a box. He signed in, received a brief orientation, and found himself holding a leash attached to the most pathetic dog he'd ever seen.

The dog was small, brown, and shaking. One ear drooped permanently. He looked like he expected to be hit at any moment.

"That's Biscuit," said Maria, the shelter coordinator. "He's been here eight months. Very shy. Most people walk right past him."

"Great," Alex said without enthusiasm. "What do I do?"

"Just walk him around the yard. Talk to him. Let him know someone cares."

Alex walked Biscuit to a patch of grass, where the dog immediately pressed himself against Alex's leg, trembling. After a few minutes of awkward silence, Alex sat down. Biscuit immediately climbed into his lap.

"You're a mess," Alex said, but his hand moved automatically to stroke the matted fur. "What happened to you?"

Over the following weeks, Alex found himself looking forward to his volunteer hours. Biscuit still trembled at loud noises and cowered from sudden movements, but his tail began to wag when he saw Alex. He'd bring toys. He'd roll onto his back, exposing his belly.

"He trusts you," Maria observed one afternoon. "He doesn't trust anybody."

Alex looked at the small dog in his arms. Somehow, through no effort of his own, he'd become the person this creature depended on. It wasn't a responsibility he'd wanted—but now that he had it, he couldn't imagine walking away.

"Is there an adoption application?" he heard himself ask.`
  },
  {
    genre: 'literary',
    title: 'The Project Partner',
    lexile_band: '900L',
    text: `"Your partner for the semester project is Tyler Morrison," Ms. Patterson announced.

Sofia's heart sank. Tyler Morrison—the kid who slept through class, never did homework, and somehow thought everything was funny when it definitely wasn't.

"Maybe I could work alone?" she asked after class.

"Learning to collaborate is part of the assignment," Ms. Patterson replied with an apologetic smile.

Their first meeting at the library was a disaster. Tyler showed up late, immediately started drawing in his notebook, and offered nothing useful.

"Do you even care about your grade?" Sofia demanded.

Tyler's expression flickered—something crossed his face too quickly for Sofia to read. "I care about plenty of things," he said quietly. "Just not about what you think I should care about."

"Then what? What's more important than passing history?"

There was a long pause. Then Tyler pushed his notebook toward her. It wasn't random drawings—it was an intricate comic strip about a kid who moved constantly, changing schools every year, never belonging anywhere.

"That's you?" Sofia asked.

"My mom's in the military. This is my fourth school in three years." He took the notebook back. "I stopped trying after the second one. What's the point of making friends you'll just leave?"

Sofia thought about her own life—same house since birth, friends she'd had since kindergarten. She'd never considered that someone might stop trying on purpose.

"The project is about immigration," she said slowly. "You probably actually have something to contribute. Different perspectives, adapting to new places."

Tyler looked at her with surprise—like he'd expected dismissal and received something else.

"I do have some ideas," he admitted. "But I'm not good at the writing part."

"That's what partners are for," Sofia said. "Let's start over."`
  },
  {
    genre: 'literary',
    title: 'The Recital',
    lexile_band: '910L',
    text: `The piano loomed on stage like a sleeping giant. From the wings, Kenji could see the audience filling the concert hall—rows and rows of faces that would soon be watching him.

His hands were sweating. He wiped them on his suit pants for the tenth time in five minutes.

"You look terrified," said a voice behind him.

Kenji turned to find an elderly woman in an elegant black dress. Her silver hair was swept up, and her eyes twinkled with understanding.

"I'm supposed to be," he replied. "First solo recital. Everyone I know is out there."

"I performed my first solo recital in this hall fifty-three years ago," the woman said. "I remember the feeling. Like standing on the edge of a cliff."

"Does it get easier?"

She laughed softly. "The fear never goes away completely. But you learn to transform it. That energy you're feeling—your heart pounding, your senses sharpening—that's your body preparing to do something extraordinary."

"I'm afraid I'll forget everything."

"You might. I forgot an entire section once, right in the middle of Chopin. I had to improvise my way back. But here's what I learned that night: the audience doesn't know what you planned. They only know what you give them. If you play with honesty, they'll hear that, even if you stumble."

The stage manager signaled. It was time.

The woman squeezed his shoulder. "Music isn't about perfection. It's about communication. You have something to say. Trust that."

Kenji walked onto the stage, sat at the piano, and placed his trembling hands on the keys. He thought of all the hours of practice, his teacher's patient guidance, his family in the audience.

Then he began to play, and the fear transformed into something that felt remarkably like joy.`
  },
  {
    genre: 'literary',
    title: 'The Goodbye',
    lexile_band: '930L',
    text: `The airport security line stretched endlessly forward. Zara stood at its edge with her father, both of them pretending the moment wasn't coming.

"You have your passport? Your boarding pass? Snacks for the plane?"

"Dad, I'm seventeen, not seven."

"You'll always be my little girl." His voice cracked slightly on the last word.

This exchange program had seemed like such an adventure when she'd applied. A semester in Japan, immersing herself in a language she'd studied for three years. Now, facing the actual moment of departure, she wanted nothing more than to go home.

"You don't have to do this," her father said, reading her face. "No one would blame you for changing your mind."

The words were tempting. She could walk back through those glass doors, return to her bedroom with its familiar chaos, spend the semester with friends she'd known forever.

But she thought about why she'd applied. The feeling of limitation, of knowing everything too well. The longing for something that would push her, challenge her, make her discover who she might become away from everything familiar.

"I want to," she said, finding that she meant it. "I'm just scared and excited and sad all at once."

Her father pulled her into a hug. "That's how all the best adventures start."

They stood there for a long moment, neither wanting to let go. Finally, Zara stepped back.

"I'll call when I land. And video chat every Sunday. And I'll be back before you know it."

"I know." Her father's eyes were bright with tears he was trying not to shed. "I'm so proud of you."

Zara picked up her carry-on and walked toward security. At the last moment, she turned and waved. Then she stepped forward into the unknown.`
  },
  {
    genre: 'literary',
    title: 'The Team',
    lexile_band: '910L',
    text: `Three weeks into robotics club, Isabella was ready to quit.

"You're putting the motor in backwards," said Nathan, not bothering to hide his condescension. "How many times do I have to explain this?"

"Maybe if you explained it in a way that made sense instead of acting like everyone should already know everything—"

"Enough." Mr. Okonkwo, their advisor, set down his coffee and gestured at the half-built robot between them. "This team has a competition in six weeks. You'll either learn to communicate or you'll lose. Your choice."

After he walked away, silence hung between them. The other team members had pointedly focused on their own work, avoiding the conflict.

"I don't know everything," Nathan finally said, his voice smaller. "I just—I've been doing this since fifth grade. It's literally the only thing I'm good at. When someone doesn't understand, I don't know how to explain it differently."

Isabella studied him. Behind the arrogance, she saw something unexpected: fear. Nathan was afraid that if he slowed down, if he admitted he didn't have all the answers, maybe he wasn't so special after all.

"I'm really good at organizing information," she offered. "At school, I help explain things to other kids all the time. But with robots, everything is new to me."

"So... maybe I show you how things work, and you help me explain it in ways that make sense to everyone?"

It wasn't friendship—not yet. But it was a beginning. Over the following weeks, their robot took shape, and so did something else: a team that was more than individual talents competing against each other.

At the competition, they didn't win. But when the robot navigated the obstacle course without a single mistake, Nathan and Isabella high-fived, and both of them meant it.`
  },
  {
    genre: 'literary',
    title: 'Lost and Found',
    lexile_band: '920L',
    text: `The forest had looked smaller from the road. Now, an hour into the hike, every direction looked the same: endless trees, fallen leaves, sky glimpsed through branches.

Marcus checked his phone again. No signal. The sun had moved significantly since he'd left the marked trail to investigate what he thought was a shortcut.

"Okay," he said aloud, hearing the fear in his own voice. "Think."

His dad's survival tips surfaced from memory. Rule one: don't panic. Rule two: stay put if you're lost—rescuers can find you easier. Rule three: if you must move, move systematically.

Marcus found a large rock and sat down. He tried to remember which way he'd come, but the trees all looked alike now. His water bottle was half empty. His phone battery showed 40 percent.

He'd been so confident. "I go hiking all the time," he'd told his worried mother. "I don't need a buddy." Now he understood why his dad always insisted on never hiking alone.

Think. What else had his dad taught him?

Follow water downhill. Streams lead to rivers, rivers lead to civilization. He listened carefully and heard—barely—the sound of running water somewhere to his left.

It took thirty minutes to reach the stream, picking his way carefully through the undergrowth. The stream was small but definite, flowing downhill through the forest. Marcus followed it.

An hour later, the stream joined a larger creek. Another twenty minutes, and he spotted a bridge—a trail marker just beyond it.

He'd made it. Shaking with relief, he pulled out his phone. Two bars of signal.

"Mom? I'm okay. But I think I learned something important about hubris."

"Hubris?"

"Pride. Overconfidence. I'll explain when I get home. And I'm never hiking alone again."`
  },
  {
    genre: 'literary',
    title: 'The Understudy',
    lexile_band: '940L',
    text: `"Rachel's out with laryngitis. You're on tonight."

The words hit like a punch to the stomach. Emma had spent three months as an understudy, quietly hoping she'd never have to perform—and now, two hours before curtain, she was supposed to carry the lead role.

"I'm not ready," she whispered.

Ms. Torres, the director, gripped her shoulders. "You know every line, every blocking mark, every musical cue. You've been rehearsing alongside Rachel this whole time. You are ready."

"Knowing it in rehearsal isn't the same as doing it in front of three hundred people!"

"Then pretend it's rehearsal. The audience wants you to succeed. They're on your side."

Emma spent the next two hours in a daze. Makeup, costume, warm-ups—everything felt like it was happening to someone else. When the stage manager called places, her legs barely carried her to the wings.

The lights went down. The overture began. And suddenly, irrationally, Emma felt calm.

This was the moment she'd prepared for, even if she'd never admitted wanting it. Every line she'd memorized while the spotlight shone on someone else. Every harmony she'd sung quietly backstage. Every night she'd gone home and performed the whole show in her bedroom, imagining an audience that couldn't see her.

She walked onto the stage and became Maria from The Sound of Music. Not Emma pretending, but Maria herself, climbing every mountain, fording every stream.

The applause at curtain call brought tears to her eyes. In the wings afterward, cast members hugged her. "You were amazing!" "I forgot it wasn't Rachel!"

And deep down, beneath the relief and exhaustion, Emma felt a new understanding take root: sometimes the opportunity you're terrified of is the one you're most ready for.`
  },
  {
    genre: 'literary',
    title: 'The Apology',
    lexile_band: '920L',
    text: `The text had been a mistake. Jada had written it in anger, sent it without thinking, and immediately wished she could take it back.

But you can't unring a bell. Twenty-four hours later, her best friend still hadn't responded, and Jada had reread her own message a hundred times, cringing at every cruel word.

"Why is this so hard?" she asked her mother.

"What part?"

"Apologizing. I know I was wrong. I know I need to say sorry. But every time I start typing, I can't find the right words."

Her mother considered this. "Maybe because you're trying to fix it with the same method that broke it. You texted something hurtful. Perhaps a text isn't the right way to say you're sorry."

Jada thought about this as she walked to Madeline's house. Each step felt heavier than the last. What if Madeline didn't want to hear it? What if their friendship was over?

Madeline's mother answered the door. "She's in her room. Fair warning—she's pretty upset."

Jada climbed the familiar stairs and knocked on the door she'd entered a thousand times without knocking.

"Who is it?"

"Jada. I came to apologize. In person. Because you deserve that."

A long pause. Then the door opened.

Madeline's eyes were red. Jada felt the full weight of the hurt she'd caused.

"I was angry about something that had nothing to do with you," Jada said. "But I took it out on you, and what I said was cruel and untrue. I'm so sorry. I understand if you need time, or if you're not ready to forgive me. But I needed you to know I didn't mean it."

Madeline studied her for a long moment. Then she stepped aside.

"Come in," she said. "I think we need to talk."

It wasn't instant forgiveness, but it was a beginning.`
  },
]

// ============================================================================
// Additional passages for more variety
// ============================================================================

const additionalInformationalPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'informational',
    title: 'The Psychology of Habits',
    lexile_band: '970L',
    text: `Every morning, you probably follow a routine—brush your teeth, eat breakfast, get dressed—without consciously thinking about each step. These automatic behaviors are habits, and understanding how they form can help you build better ones.

Habits develop through a neurological loop with three parts: cue, routine, and reward. The cue is a trigger that tells your brain to switch into automatic mode. The routine is the behavior itself. The reward is the benefit your brain receives, which reinforces the habit loop.

Consider the habit of checking your phone first thing in the morning. The cue might be waking up. The routine is reaching for your phone. The reward is the dopamine hit from new messages or notifications. Your brain learns to crave this reward, making the habit harder to break.

Scientists have found that habits form in a brain region called the basal ganglia, separate from the areas responsible for decision-making. This is why habits feel automatic—they literally bypass conscious thought. Once established, habits never truly disappear; they're just overwritten by new habits.

This permanence explains why change is difficult but also offers hope. To modify a habit, you don't need to eliminate it entirely. Instead, you can keep the same cue and reward but insert a new routine. If you reach for your phone when bored, you could instead reach for a book—same cue, similar reward (distraction), different behavior.

Research shows it takes an average of 66 days to form a new habit, though this varies widely by person and complexity. The key is consistency: performing the new behavior in the same context until it becomes automatic.`
  },
  {
    genre: 'informational',
    title: 'Coral Reefs: Rainforests of the Sea',
    lexile_band: '950L',
    text: `Coral reefs cover less than one percent of the ocean floor, yet they support about 25 percent of all marine species. These underwater ecosystems, often called the rainforests of the sea, are among the most diverse and productive on Earth—and they're under serious threat.

Coral may look like colorful rocks, but it's actually made of tiny animals called polyps. Each polyp builds a limestone skeleton around itself. Over time, thousands of polyps create the massive structures we recognize as reefs. This building process is incredibly slow—reefs grow only about half an inch per year.

Inside coral tissues live microscopic algae called zooxanthellae. This relationship benefits both partners. The algae get shelter and access to sunlight. In return, they provide the coral with nutrients through photosynthesis. This partnership is so important that coral gets up to 90 percent of its energy from these algae.

Coral reefs support incredible biodiversity. Fish of every color and size dart through reef structures. Sea turtles graze on algae. Sharks patrol reef edges. Countless invertebrates—shrimp, crabs, sea stars, octopuses—make their homes in reef crevices. Scientists are still discovering new species.

Climate change poses the greatest threat to coral reefs. When ocean temperatures rise, coral expel their algae partners—a phenomenon called bleaching. Without the algae, coral turns white and begins to starve. If temperatures don't return to normal quickly, the coral dies. Ocean acidification, caused by absorbed carbon dioxide, further weakens coral skeletons.

Scientists are working to save reefs through coral nurseries, heat-resistant coral breeding, and marine protected areas. But the long-term solution requires addressing climate change itself.`
  },
  {
    genre: 'informational',
    title: 'The History of Medicine',
    lexile_band: '990L',
    text: `For most of human history, illness was a mystery. People believed diseases were caused by evil spirits, divine punishment, or imbalanced bodily fluids. The transformation of medicine from superstition to science occurred gradually over centuries.

Ancient civilizations made early advances. Egyptian doctors could set broken bones and perform surgeries. Greek physician Hippocrates emphasized careful observation of symptoms, earning him the title "Father of Medicine." His ethical principles still guide doctors today through the Hippocratic Oath.

During the Middle Ages, Islamic scholars preserved and expanded Greek medical knowledge while European medicine stagnated. Hospitals, pharmacies, and medical schools flourished in the Islamic world. Scholars like Ibn Sina wrote comprehensive medical texts used for centuries.

The Scientific Revolution brought new approaches. Andreas Vesalius dissected human bodies to study anatomy, correcting centuries of errors. William Harvey discovered blood circulation. Microscopes revealed the existence of tiny organisms, though their role in disease wasn't yet understood.

The 19th century saw breakthrough after breakthrough. Anesthesia made surgery painless. Germ theory, developed by Louis Pasteur and Robert Koch, proved that microorganisms cause infectious disease. Antiseptic techniques dramatically reduced deaths from infection. Vaccines began preventing diseases like smallpox.

Modern medicine has achieved remarkable progress. Antibiotics fight bacterial infections. Imaging technology reveals the body's interior without surgery. Organ transplants save lives. Gene therapy targets diseases at their source. Yet new challenges emerge—antibiotic resistance, chronic diseases, and global health inequities—reminding us that medicine's story continues.`
  },
  {
    genre: 'informational',
    title: 'Sleep: Why Your Body Needs It',
    lexile_band: '940L',
    text: `You spend about one-third of your life asleep. This might seem like wasted time, but sleep is essential for health, learning, and even survival. Scientists are still uncovering all the reasons we sleep, but research has revealed its remarkable importance.

During sleep, your brain is surprisingly active. It cycles through different stages approximately every 90 minutes. Light sleep transitions into deep sleep, where the body repairs tissues and strengthens the immune system. Then comes REM (rapid eye movement) sleep, when most dreaming occurs and the brain processes memories and emotions.

Memory consolidation is one of sleep's crucial functions. During the day, your brain encodes experiences into temporary storage. During sleep, it transfers important memories into long-term storage while discarding irrelevant information. Studies show that people remember information better after sleeping than after the same amount of time awake.

Sleep deprivation has serious consequences. Even one night of poor sleep impairs attention, decision-making, and reaction time—similar to being legally drunk. Chronic sleep deprivation increases risk of obesity, diabetes, heart disease, and mental health disorders. Yet many people regularly get less than the recommended amount.

Teenagers need 8-10 hours of sleep per night, but biological changes during puberty shift sleep cycles later. This means teens naturally want to stay up late and sleep in—a conflict with early school start times. Many schools have begun starting later to align with adolescent sleep patterns.

Good sleep habits, called sleep hygiene, can improve sleep quality: consistent bedtimes, limited screen use before bed, a cool and dark room, and avoiding caffeine in the afternoon.`
  },
  {
    genre: 'informational',
    title: 'Weather Prediction: The Science of Forecasting',
    lexile_band: '960L',
    text: `Will it rain this weekend? Should you bring an umbrella tomorrow? These simple questions require incredibly complex science to answer. Weather forecasting combines massive amounts of data with sophisticated computer models to predict the atmosphere's behavior.

Modern weather prediction relies on observations from thousands of sources. Weather stations measure temperature, humidity, and pressure at ground level. Weather balloons carry instruments high into the atmosphere. Satellites track cloud formations and measure radiation from space. Ships, planes, and buoys add observations from oceans and remote areas.

All this data feeds into numerical weather prediction models—computer programs that simulate the atmosphere. These models divide the atmosphere into millions of grid cells and calculate how conditions in each cell will change based on physics equations. Supercomputers run these calculations, producing forecasts hours or days into the future.

The challenge is that weather is chaotic—small differences in initial conditions can lead to vastly different outcomes. This is the "butterfly effect," named for the idea that a butterfly flapping its wings could eventually affect weather patterns far away. Because of chaos, forecast accuracy decreases as you look further into the future.

Five-day forecasts are now about as accurate as one-day forecasts were 30 years ago. Improvements come from better observations, more powerful computers, and refined models. Ensemble forecasting, which runs multiple simulations with slightly different starting conditions, helps quantify uncertainty.

Despite advances, some weather events remain difficult to predict. The exact track of a hurricane, the location of severe thunderstorms, or whether rain will fall on a particular neighborhood—these questions push the limits of forecasting science.`
  },
  {
    genre: 'informational',
    title: 'The Olympic Games: From Ancient Greece to Today',
    lexile_band: '950L',
    text: `Every four years, athletes from around the world gather to compete in the Olympic Games. This tradition stretches back nearly 3,000 years to ancient Greece, making the Olympics one of humanity's oldest continuing traditions.

The ancient Olympics began in 776 BCE in Olympia, Greece. They were held to honor Zeus, king of the Greek gods. Only Greek men could compete, participating in events like running, wrestling, boxing, and chariot racing. Winners received olive wreaths and became heroes in their home cities.

The ancient games continued for over 1,100 years until a Roman emperor banned them in 393 CE. For fifteen centuries, the Olympics existed only in history books.

A French educator named Pierre de Coubertin revived the Olympics in 1896. He believed international athletic competition could promote peace and understanding. The first modern Games, held in Athens, featured 241 athletes from 14 nations competing in 43 events.

The modern Olympics have grown enormously. Recent Summer Games include over 10,000 athletes from more than 200 countries competing in hundreds of events. The Winter Olympics, added in 1924, features sports like skiing, skating, and hockey. The Paralympics, for athletes with disabilities, have become an important part of the Olympic movement.

The Olympics have faced controversies: political boycotts, doping scandals, concerns about host city costs. Yet the Games remain a powerful symbol of international unity. For a few weeks every four years, the world's attention turns to athletic achievement rather than conflict, and athletes who may never meet otherwise share a common experience of striving for excellence.`
  },
  {
    genre: 'informational',
    title: 'Earthquakes: When the Ground Shakes',
    lexile_band: '940L',
    text: `The ground beneath your feet seems solid and stable, but Earth's surface is actually in constant slow motion. When built-up tension suddenly releases, the ground shakes, sometimes violently. Understanding earthquakes helps communities prepare for these powerful natural events.

Earth's outer layer is broken into tectonic plates that float on the partially molten rock below. These plates move a few centimeters per year—about as fast as your fingernails grow. Where plates meet, they can collide, pull apart, or slide past each other. These boundaries are where most earthquakes occur.

Earthquakes happen when stress along a fault—a crack in the rock—exceeds the rock's strength. The rock suddenly slips, releasing energy as seismic waves that radiate outward from the point of rupture. The location where slippage begins is called the focus; the point directly above on the surface is the epicenter.

Scientists measure earthquakes using the moment magnitude scale. Each whole number increase represents about 32 times more energy released. A magnitude 6 earthquake releases 32 times more energy than a magnitude 5. The largest earthquakes, magnitude 9 and above, can cause catastrophic damage across wide areas.

California's San Andreas Fault is one of the world's most studied earthquake zones. Here, the Pacific Plate slides past the North American Plate, creating constant seismic activity. Major earthquakes have struck San Francisco (1906), Los Angeles (1994), and many other locations along this fault system.

While we cannot predict exactly when earthquakes will occur, we can prepare for them. Building codes require structures that can withstand shaking. Early warning systems provide seconds to minutes of advance notice. Emergency plans help communities respond and recover.`
  },
  {
    genre: 'informational',
    title: 'The United Nations: Working for World Peace',
    lexile_band: '970L',
    text: `After two devastating world wars in the first half of the 20th century, world leaders sought a way to prevent future conflicts. The result was the United Nations, an international organization founded in 1945 to maintain peace and security among nations.

The UN emerged from the ashes of the League of Nations, which had failed to prevent World War II. Fifty-one countries signed the UN Charter in San Francisco, establishing a new framework for international cooperation. The preamble famously begins: "We the peoples of the United Nations, determined to save succeeding generations from the scourge of war..."

The organization has six main parts. The General Assembly, where all 193 member nations have equal votes, discusses issues and makes recommendations. The Security Council, with five permanent members (US, UK, France, Russia, China) and ten rotating members, can authorize military action and impose sanctions. The Secretariat, led by the Secretary-General, carries out day-to-day operations.

The UN does far more than address conflicts. Its agencies tackle global challenges: the World Health Organization fights disease; UNICEF protects children; the World Food Programme combats hunger. The UN has established international human rights standards and environmental agreements like the Paris Climate Accord.

Critics argue the UN is ineffective, pointing to ongoing conflicts and the veto power that allows permanent Security Council members to block action. Supporters note that, despite limitations, the UN has helped prevent another world war and has successfully mediated many disputes.

The UN represents humanity's attempt to solve problems collectively rather than through force. Its successes and failures reflect the ongoing challenge of international cooperation in a world of diverse nations and interests.`
  },
  {
    genre: 'informational',
    title: 'The Human Digestive System',
    lexile_band: '930L',
    text: `The cheeseburger you eat for lunch contains proteins, fats, carbohydrates, vitamins, and minerals—but your body can't use any of them until they're broken down. The digestive system transforms food into molecules small enough to enter your bloodstream and reach every cell.

Digestion begins in the mouth. Teeth mechanically break food into smaller pieces while saliva starts chemical digestion. An enzyme called amylase begins breaking down starches into sugars. When you swallow, food travels down the esophagus in about 10 seconds.

The stomach is a muscular bag that churns food and bathes it in gastric juice—a powerful mix of hydrochloric acid and enzymes. The acid is strong enough to dissolve metal, but a thick mucus layer protects the stomach wall. Food stays here for several hours, transforming into a thick liquid called chyme.

The small intestine is where most digestion and absorption occurs. At about 20 feet long, it has enormous surface area thanks to fingerlike projections called villi. Here, enzymes from the pancreas and bile from the liver complete the breakdown of proteins, fats, and carbohydrates. Nutrients pass through the intestinal wall into the bloodstream.

The large intestine absorbs water and forms solid waste. Trillions of bacteria live here, making up your gut microbiome. These bacteria help digest fiber, produce vitamins, and protect against harmful microorganisms. The health of this bacterial community affects overall health in ways scientists are still discovering.

From mouth to end, digestion takes 24 to 72 hours. This complex process transforms a cheeseburger into energy for running, building materials for growing, and everything else your body needs.`
  },
  {
    genre: 'informational',
    title: 'Caves: Underground Worlds',
    lexile_band: '950L',
    text: `Beneath Earth's surface lies a hidden world of chambers, passages, and underground rivers. Caves form through various geological processes and shelter unique ecosystems found nowhere else on Earth.

Most caves form in limestone, a rock composed of ancient sea creature shells. Rainwater absorbs carbon dioxide, becoming slightly acidic. This weak acid dissolves limestone along cracks and crevices. Over thousands or millions of years, the dissolving rock creates caverns that can extend for miles.

Cave formations, called speleothems, create otherworldly landscapes. Stalactites hang from ceilings where mineral-laden water drips and leaves deposits behind. Stalagmites grow from floors below. When the two meet, they form columns. Other formations include flowstones, cave pearls, and delicate crystal structures.

Caves have their own ecosystems. Near entrances, where some light reaches, live plants and animals similar to those outside. Deeper in the twilight zone, darkness-adapted creatures dominate. The deep cave zone supports organisms that have evolved for total darkness: eyeless fish, white crayfish, and insects that navigate by other senses.

Some cave creatures have never seen sunlight. Cut off from surface evolution, they developed unique adaptations over millions of years. Many species exist only in single cave systems, making them extremely vulnerable to disturbance. Pollution, climate change, and human intrusion threaten these fragile environments.

Humans have used caves throughout history—for shelter, worship, and art. Prehistoric cave paintings in France and Spain are among humanity's oldest artworks. Today, caves attract tourists, challenge adventurous cavers, and provide natural laboratories for studying geology and biology. Yet most of Earth's caves remain unexplored.`
  },
]

// ============================================================================
// More literary passages
// ============================================================================

const additionalLiteraryPassages: Omit<Passage, 'id' | 'word_count' | 'created_at'>[] = [
  {
    genre: 'literary',
    title: 'The Decision',
    lexile_band: '930L',
    text: `The scholarship letter lay on Daniel's desk, its crisp college letterhead promising everything he'd ever wanted: a full ride to study computer science at one of the best programs in the country. Three states away from home.

His grandmother appeared in the doorway, smaller than he remembered, leaning on the walker she'd started using last month. "Good news?"

"I got in. Full scholarship."

Her face lit up with genuine joy. "Daniel! That's wonderful! Your parents would be so proud."

His parents. Gone three years now, killed by a drunk driver. His grandmother had raised him since, on her limited income, never complaining, always believing in him. Now her health was failing, and she'd need more help in the coming years.

"I'm thinking of deferring," he said. "Maybe taking classes at community college for a year or two."

Her expression shifted. "Because of me."

"Because I want to be here. With you."

She crossed the room—slowly, carefully—and sat beside him on the bed. "Daniel, I raised you to fly, not to stay in the nest. I have my friends. I have my doctors. I have a life that doesn't require you to sacrifice yours."

"It's not a sacrifice—"

"Isn't it?" Her voice was sharp but loving. "You've worked for this since you were twelve years old. Every late night studying, every competition, every summer program. Are you going to let it go because you're afraid?"

Daniel stared at the letter. "What if something happens to you while I'm gone?"

"Something might. Something might happen even if you're here." She took his hand. "Life doesn't wait for convenient timing. Your parents taught me that. Go live yours."

Three months later, from his dorm room, he video-called her every Sunday without fail.`
  },
  {
    genre: 'literary',
    title: 'The Substitute',
    lexile_band: '910L',
    text: `Mr. Warren, the substitute teacher, looked like he'd rather be anywhere else. He sat behind the desk, barely glancing up as students filed into the classroom.

"Read chapter seven. Answer the questions. Don't bother me."

Typical sub. Leah opened her textbook, but her eyes drifted to the window. Outside, Ms. Garcia was conducting her biology class on the lawn, students clustered around microscopes examining pond water. That's where Leah wished she was—anywhere but stuck in history with a substitute who'd clearly given up.

Then something caught her attention. Mr. Warren was reading too, but not from a textbook. She could see the cover: a biography of Frederick Douglass. His eyes were intent, engaged in a way that contradicted his bored demeanor.

"That's a good book," she said, surprising herself.

He looked up, suspicious. "You've read it?"

"My grandmother gave it to me. She met him once—or met someone who met him, anyway. Family story."

Something shifted in his expression. "Which part?"

"He spoke at a church in her town. She was just a kid. She said she'd never heard anyone speak like that before."

Mr. Warren closed the biography. For a moment, the tired substitute was gone, replaced by someone curious and present. "History isn't just what's in your textbook. It's stories like that—connections to people who are still almost alive in memory. That's what I always tried to teach."

"You were a teacher?"

"Thirty years. Retired last June." He smiled ruefully. "Turns out I don't know who I am without a classroom."

Leah considered this. "So why do you act like you don't care?"

"Because being temporary is lonely," he admitted. "But maybe that's not a good enough excuse."

The next day, Mr. Warren was different. He told stories. He asked questions. He taught.`
  },
  {
    genre: 'literary',
    title: 'The Mural',
    lexile_band: '920L',
    text: `The wall had been blank concrete for forty years—the side of a building that everyone passed and no one saw. Now Arturo stood before it with brushes, paint, and a design approved by the city council after three months of meetings.

"You sure about this?" asked his sister Carmen. She was seventeen, like him, and had spent weeks helping him perfect the design.

He wasn't sure at all. The mural was supposed to represent their neighborhood: its history, its people, its hopes. That was a lot to put on a wall.

He started with the background—the lake that had existed here before the city, then the fields where great-great-grandparents had worked. Layers of time, each one leading to the next.

Neighbors stopped to watch. An elderly woman named Mrs. Chen brought him lemonade and told him about the restaurant her family had run here for fifty years—the restaurant that became the hardware store on the corner.

"Put in a dumpling," she suggested. "Just a small one."

He did. Next to the dumpling, he added a tortilla, a pierogi, and a bowl of pho—all the foods that had nourished this neighborhood over decades.

A little girl asked if she could add something. Arturo let her paint a sun in the corner, bright yellow and perfectly imperfect.

The mural grew over weeks. People brought stories; Arturo translated them into images. The man who'd organized the first community garden. The teacher who'd taught three generations. The kids playing basketball on the court that had once been a vacant lot.

When it was finished, Arturo stepped back. It wasn't exactly what he'd designed. It was better—because it belonged to everyone who'd contributed to it.

"Not bad," Carmen said, standing beside him.

"Not bad at all," he agreed.`
  },
  {
    genre: 'literary',
    title: 'The Rescue',
    lexile_band: '930L',
    text: `The kayak flipped without warning, dumping Hana into Lake Michigan's cold October water. One moment she was paddling; the next she was underwater, disoriented, gasping.

She surfaced, grabbed the overturned kayak, and tried to remember her training. Stay calm. Stay with the boat. Signal for help.

But the shore looked impossibly far—a quarter mile at least—and the waves were pushing her further out. Her life jacket kept her afloat, but her hands were already numb. Her brother was in the other kayak, somewhere behind her...

"Hana!" She heard him before she saw him, paddling hard against the waves. Marcus reached her in seconds, his face white with fear.

"I can't flip the kayak back over," she gasped. "My hands won't work."

"Then hold onto mine. We'll tow yours."

It took all her remaining strength to grip his boat's stern handle. Marcus began paddling toward shore, fighting the waves that seemed determined to push them deeper into the lake.

"Keep talking to me," he shouted. "Tell me about that book you're reading."

She wanted to laugh—who cared about books right now?—but she understood. He needed her to stay conscious, stay present.

"It's about a girl who survives a plane crash," she managed through chattering teeth. "In the wilderness. She has to figure out how to stay alive."

"Sounds familiar," Marcus grunted, still paddling.

By the time they reached shallow water, Hana couldn't feel anything below her elbows. But she was alive. She collapsed on the beach, shaking uncontrollably, as Marcus called for help.

Later, wrapped in emergency blankets, she found his hand with her numb fingers. "Thank you."

"That's what brothers are for," he said. "But next time we check the weather forecast first."`
  },
  {
    genre: 'literary',
    title: 'The Tutor',
    lexile_band: '900L',
    text: `Olivia had dreaded this moment all week. Community service hours required tutoring younger kids, and she'd been assigned to work with a fifth-grader named Marcus who was struggling with reading.

"I'm not stupid," Marcus announced before she'd even sat down. His arms were crossed, his expression hostile.

"I didn't say you were."

"Teachers think I'm stupid. That's why they made me come here."

Olivia recognized that defensiveness—she'd felt it herself in math class, when numbers swam before her eyes and nothing made sense. "What happens when you try to read?"

"The letters move around. They don't stay where they're supposed to."

"Have you told anyone that?"

Marcus looked at her like she'd asked if he'd told anyone his deepest secret. "They'd think I was crazy."

"Actually, there's a name for that. Dyslexia. My cousin has it. The letters really do seem to move for him—it's how his brain processes visual information. It doesn't mean you're stupid. It means you need different strategies."

For the first time, Marcus uncrossed his arms. "Really?"

"Really. He listens to audiobooks now. He uses colored overlays that help the letters stay still. He's actually in honors English this year."

Something shifted in Marcus's expression—a tiny spark of hope replacing the defensive anger.

"Can you teach me those strategies?"

Olivia thought about her remaining service hours stretching ahead. Suddenly they didn't feel like an obligation.

"Yeah," she said. "I can try."

Three months later, Marcus was reading at grade level. But more importantly, he'd stopped calling himself stupid. That transformation, Olivia realized, mattered more than any assignment could.`
  },
  {
    genre: 'literary',
    title: 'The Photograph Album',
    lexile_band: '920L',
    text: `The box was labeled "Do not open until I'm gone." But Grace's grandmother had been gone for two weeks now, and the time had finally come.

Inside were photograph albums—dozens of them, spanning decades. Grace turned the yellowed pages carefully, watching her grandmother age in reverse: middle-aged mother, young bride, teenager in clothes from another era.

Then she found one she didn't recognize. A young woman who looked like her grandmother but wasn't. Standing beside a man Grace had never seen.

"Who is this?" she asked her mother, who was sorting papers nearby.

Her mother came over, squinted at the photograph, and went very still. "Where did you find this?"

"In the box. The one she said not to open."

A long pause. Then her mother sat down, looking older than Grace had ever seen her. "That's your grandmother's sister. Sophie. She died when she was nineteen."

"I didn't know Grandma had a sister."

"She never talked about her. It was... they had an argument, the day before Sophie died. She was killed in a car accident before they could make up. Your grandmother carried that guilt her whole life."

Grace looked at the photograph with new eyes. Sophie was laughing, caught in a moment of joy. She'd never get another moment.

"Why did Grandma keep this hidden?"

"Some pain is too deep to share. But maybe—" Her mother took the album gently. "Maybe she knew that someday, you'd need to know this story. That carrying guilt doesn't help anyone. That saying 'I'm sorry' while you can matters more than keeping it inside."

Grace thought about her own arguments, her own stubborn silences. Tomorrow, she decided, she'd text her friend Mia, the one she'd been feuding with for two months.

Life was too short for unfinished conversations.`
  },
  {
    genre: 'literary',
    title: 'The Storm Shelter',
    lexile_band: '930L',
    text: `The tornado sirens started wailing just as the power went out. In the sudden darkness, Jasmine felt her way to the basement door, her heart pounding in her chest.

"Mom? Dad?" No answer. They were still at work, stuck on the other side of town.

She grabbed her phone—12% battery—and descended the stairs. The basement was pitch black except for the glow of her screen. She could hear the storm now, a sound like a freight train getting closer.

Under the stairs, in the safest corner. That's what they'd always practiced. She wedged herself into the small space, pulling boxes around her for extra protection, and waited.

The house groaned. Something crashed above her—a window, maybe, or a tree falling. The roaring grew so loud she couldn't hear her own screaming.

Then her phone buzzed. A text from her mother: Are you safe? Where are you?

Basement. Under stairs. Alone. Scared.

The reply came instantly: Stay there. We're coming. You're going to be okay. I love you.

I love you too.

She clutched the phone like a lifeline, reading those words over and over as the storm raged above. The house shuddered. Something crashed. But she stayed small and still, focused on the tiny glowing screen.

After what felt like hours but was probably twenty minutes, the roaring faded. Jasmine emerged from under the stairs to find the basement untouched, though something upstairs was dripping.

She climbed the stairs into chaos—broken windows, debris everywhere—but the house was standing. And fifteen minutes later, her parents' car pulled up, her mother running toward her, arms open.

"I stayed under the stairs," Jasmine said into her mother's shoulder.

"You did exactly right," her mother whispered. "I'm so proud of you."`
  },
  {
    genre: 'literary',
    title: 'The Competition',
    lexile_band: '920L',
    text: `Two minutes left. The score was tied, and both quiz bowl teams stared at the moderator, waiting for the final question.

Ryan had never wanted anything more than this trophy. Three years of early morning practices, weekend competitions, and memorizing everything from Egyptian pharaohs to organic chemistry—all for this moment.

Across the stage, Sierra from Westwood Prep met his eyes. They'd been rivals since middle school, trading victories back and forth. She was brilliant—maybe more brilliant than him—and she knew it.

"Final question, worth twenty points," the moderator announced. "In organic chemistry, what is the process by which..."

Ryan's hand hit the buzzer first. He knew this. He'd studied it last night. The answer was on the tip of his tongue.

And then it vanished.

Complete blank. Three seconds to answer, and his mind was empty.

"I—" He looked at his team, saw their desperate hope. Looked at the audience, his parents leaning forward. Looked at Sierra, who was watching with an expression he couldn't read.

"Pass," he heard himself say.

The moderator turned to Westwood Prep. Sierra's hand was on the buzzer, but she didn't press it. Instead, she sat back.

"The answer is hydrogenation," she said quietly.

"Correct! Westwood Prep wins!"

Afterward, Ryan found Sierra outside. "You could have buzzed in. You knew it."

"I did know it." She shrugged. "But I wanted to beat you when you were at your best. That wasn't your best."

"So next year?"

"Next year." She smiled—a real smile, not a competitive one. "Maybe we should practice together sometime. Share notes."

Ryan considered this. Rivals becoming allies. It was unexpected. But then again, so was learning that losing could teach you as much as winning.

"I'd like that," he said.`
  },
  {
    genre: 'literary',
    title: 'The Garden Project',
    lexile_band: '900L',
    text: `The empty lot had been full of trash for as long as anyone could remember. Broken bottles, old tires, fast food wrappers that blew in from the highway. It was an eyesore, and it was right next to Rosa's apartment building.

"We could make it into a garden," she said at the community meeting, her voice shaking slightly.

Silence. Then Mr. Abara, who'd lived in the building for forty years, spoke up. "Who's going to pay for it? Who's going to do the work?"

"We are. All of us." Rosa pulled out the folder she'd prepared—grant applications, volunteer sign-up sheets, designs she'd sketched during study halls. "The city has a program. They'll provide materials if we provide labor."

More silence. Then Ms. Kim raised her hand. "I used to grow vegetables in Korea. I could help."

"I can build raised beds," added Mr. Williams, the retired carpenter.

One by one, neighbors who'd barely spoken to each other for years began volunteering skills Rosa hadn't known they had. By the end of the meeting, twenty people had signed up.

The work took months. Clearing trash. Testing soil. Building beds and trellises. There were arguments about what to plant, where to put the paths, who wasn't doing their share. Twice, Rosa wanted to quit.

But spring came, and seeds became sprouts became vegetables. The garden attracted bees and butterflies. Children played in the paths while parents weeded. Neighbors who'd passed each other for years without speaking now stopped to discuss tomatoes.

On the day of the first harvest—tomatoes, peppers, beans, all divided among whoever wanted them—Mr. Abara found Rosa.

"You were right," he admitted. "This place needed something to grow."

"Not something," Rosa said, watching her neighbors laugh together. "Someone. Us."`
  },
  {
    genre: 'literary',
    title: 'The Long Way Home',
    lexile_band: '930L',
    text: `The last bus had left without him. Marcus stood at the empty station, watching its taillights disappear into the evening, calculating the ten-mile walk home.

This was his own fault. He'd stayed at the library too long, lost in research for a paper that wasn't due for two weeks. Now night was falling, his phone was dead, and he had no other options.

He started walking.

The first mile was fine—sidewalks, streetlights, occasional cars. The second mile took him through a neighborhood he didn't know, where dogs barked behind fences and porch lights flickered on as he passed.

By mile three, his feet were aching. He'd worn his good shoes today, the ones for presentations, not the sneakers he should have chosen. Every step reminded him of that mistake.

A pickup truck slowed beside him. Marcus tensed, remembering every warning his mother had ever given.

"You need a ride?" The driver was a woman about his mother's age.

"No thank you." He kept walking.

"You sure? It's getting dark."

"I'm fine."

She drove on, and he felt both relief and regret. But his mother's voice was clear in his head: Better safe than sorry.

Mile five brought a convenience store where he bought water and rested for ten minutes. The clerk asked if he needed to call someone, but his phone was still dead and he didn't have numbers memorized. When had he stopped memorizing phone numbers?

By mile eight, he'd developed a blister. By mile nine, he was limping. But mile ten brought the familiar turn onto his street, and the light in his kitchen window, and his mother's silhouette moving behind the curtain.

He'd made it. On his own, using only his own two feet. It was exhausting and painful and he never wanted to do it again.

But also: he'd done it.`
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
    tags: ['synthetic', 'main_idea'],
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
    tags: ['synthetic', 'inference'],
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
    tags: ['synthetic', 'vocab_context'],
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
    tags: ['synthetic', 'author_craft'],
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
    tags: ['synthetic', 'supporting_details'],
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
      `A. The passage explains ${passage.title.toLowerCase()} and its significance.`,
      `B. The passage describes unrelated facts about the topic.`,
      `C. The passage focuses only on historical information.`,
      `D. The passage argues that the topic is not important.`
    ]
  } else {
    return [
      `A. The story shows how challenges can lead to personal growth.`,
      `B. The story suggests that problems cannot be solved.`,
      `C. The story is mainly about the setting.`,
      `D. The story teaches that characters never change.`
    ]
  }
}

function generateInferenceChoices(passage: Passage): string[] {
  if (passage.genre === 'informational') {
    return [
      'A. This topic will continue to be relevant in the future.',
      'B. Scientists have stopped researching this topic.',
      'C. This topic only matters to a few experts.',
      'D. Nothing more can be learned about this subject.'
    ]
  } else {
    return [
      'A. The main character learned something important during the story.',
      'B. The character will make the same mistakes again.',
      'C. The character did not care about the events.',
      'D. The other characters were more important than the main character.'
    ]
  }
}

function generateVocabChoices(passage: Passage): string[] {
  return [
    'A. having great importance or meaning',
    'B. being small or insignificant',
    'C. causing confusion or uncertainty',
    'D. lacking any real value'
  ]
}

function generateCraftChoices(passage: Passage): string[] {
  if (passage.genre === 'informational') {
    return [
      'A. to inform readers about an important topic',
      'B. to persuade readers to take a specific action',
      'C. to entertain readers with a fictional story',
      'D. to express personal opinions without evidence'
    ]
  } else {
    return [
      'A. to help readers understand the characters and their experiences',
      'B. to fill space in the story',
      'C. to confuse readers about what is happening',
      'D. to show that setting is not important'
    ]
  }
}

function generateDetailChoices(passage: Passage): string[] {
  if (passage.genre === 'informational') {
    return [
      'A. The passage provides specific examples to support its claims.',
      'B. No evidence is provided in the passage.',
      'C. The topic was only recently discovered.',
      'D. The information contradicts what scientists believe.'
    ]
  } else {
    return [
      "A. The character's words and actions show development.",
      'B. The character remains unchanged throughout the story.',
      'C. Other characters prevented any change.',
      'D. The story ends before any change can occur.'
    ]
  }
}

// ============================================================================
// Main function
// ============================================================================

async function main() {
  console.log('Generating batch 2 of reading passages...\n')

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

  // Combine all passage sources
  const allNewPassageTemplates = [
    ...sciencePassages,
    ...historyPassages,
    ...techPassages,
    ...artsPassages,
    ...literaryPassages,
    ...additionalInformationalPassages,
    ...additionalLiteraryPassages
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
