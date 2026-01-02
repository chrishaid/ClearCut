/**
 * Generate rigorous math items aligned with:
 * - Eureka Math Squared Grade 8 curriculum
 * - HSAT difficulty (40 questions in 40 minutes, no calculator)
 * - NWEA MAP RIT 230-250 (advanced 8th grade)
 *
 * Key characteristics of rigorous items:
 * - Multi-step problem solving
 * - Real-world application contexts
 * - Require conceptual understanding, not just procedural
 * - Time pressure simulation (quick mental math)
 * - Higher cognitive levels (3-4 on Bloom's taxonomy)
 *
 * Usage:
 *   npx tsx scripts/generateRigorousMath.ts
 */

import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const BANK_DIR = path.join(process.cwd(), 'content', 'hsat_full_item_bank')

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
  week_phase: string
  created_at: string
}

// ============================================================================
// EUREKA MATH SQUARED GRADE 8 ALIGNED CONTENT
// Module 1: Integer Exponents and Scientific Notation
// Module 2: Transformational Geometry
// Module 3: Linear Equations
// Module 4: Linear Functions
// Module 5: Systems of Linear Equations
// Module 6: Pythagorean Theorem & Irrational Numbers
// Module 7: Statistics
// ============================================================================

const rigorousMathItems: Omit<Item, 'id' | 'created_at'>[] = [
  // ========== INTEGER EXPONENTS & SCIENTIFIC NOTATION ==========
  {
    subject: 'math',
    topic: 'exponents',
    subtopic: 'properties',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'If 2^x · 2^(x+2) = 2^12, what is the value of x?',
    choices: ['A. 3', 'B. 4', 'C. 5', 'D. 6'],
    answer_key: 'C',
    rationale: 'Using the product rule: 2^x · 2^(x+2) = 2^(2x+2) = 2^12. So 2x + 2 = 12, meaning 2x = 10 and x = 5.',
    tags: ['rigorous', 'eureka_m1', 'exponents', 'algebra'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'exponents',
    subtopic: 'scientific_notation',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'The distance from Earth to the Sun is approximately 1.5 × 10^8 km. Light travels at 3 × 10^5 km/sec. Approximately how many minutes does it take light to travel from the Sun to Earth?',
    choices: ['A. 5 minutes', 'B. 8 minutes', 'C. 50 minutes', 'D. 500 minutes'],
    answer_key: 'B',
    rationale: 'Time = distance/speed = (1.5 × 10^8)/(3 × 10^5) = 0.5 × 10^3 = 500 seconds = 8.33 minutes ≈ 8 minutes.',
    tags: ['rigorous', 'eureka_m1', 'scientific_notation', 'application'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'exponents',
    subtopic: 'negative_exponents',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'Which expression is equivalent to (3^-2 · 3^5) / 3^2?',
    choices: ['A. 3', 'B. 3^2', 'C. 3^5', 'D. 1/3'],
    answer_key: 'A',
    rationale: '(3^-2 · 3^5) / 3^2 = 3^(-2+5) / 3^2 = 3^3 / 3^2 = 3^(3-2) = 3^1 = 3.',
    tags: ['rigorous', 'eureka_m1', 'exponents', 'negative_exponents'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'exponents',
    subtopic: 'scientific_notation',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'A bacterial colony doubles every 20 minutes. If the colony starts with 5 × 10^3 bacteria, approximately how many bacteria will there be after 2 hours?',
    choices: ['A. 3.2 × 10^5', 'B. 6.4 × 10^4', 'C. 5 × 10^9', 'D. 1.6 × 10^4'],
    answer_key: 'A',
    rationale: '2 hours = 120 minutes = 6 doubling periods. Final count = 5 × 10^3 × 2^6 = 5 × 10^3 × 64 = 320 × 10^3 = 3.2 × 10^5.',
    tags: ['rigorous', 'eureka_m1', 'exponential_growth', 'application'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },

  // ========== TRANSFORMATIONAL GEOMETRY ==========
  {
    subject: 'math',
    topic: 'geometry',
    subtopic: 'transformations',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'Triangle ABC has vertices at A(1, 2), B(4, 2), and C(1, 6). If the triangle is reflected over the y-axis and then translated 3 units down, what are the coordinates of C\'?',
    choices: ['A. (-1, 3)', 'B. (-1, 9)', 'C. (1, 3)', 'D. (-1, -3)'],
    answer_key: 'A',
    rationale: 'Reflection over y-axis: C(1, 6) → C\'(-1, 6). Translation 3 down: C\'(-1, 6) → C\'\'(-1, 3).',
    tags: ['rigorous', 'eureka_m2', 'transformations', 'coordinate_geometry'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'geometry',
    subtopic: 'transformations',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'A figure is rotated 90° clockwise around the origin. If point P was at (3, -2) before the rotation, where is it after?',
    choices: ['A. (-2, -3)', 'B. (-3, 2)', 'C. (2, 3)', 'D. (-2, 3)'],
    answer_key: 'A',
    rationale: 'For 90° clockwise rotation: (x, y) → (y, -x). So (3, -2) → (-2, -3).',
    tags: ['rigorous', 'eureka_m2', 'rotations', 'coordinate_geometry'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'geometry',
    subtopic: 'congruence',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'Two triangles are congruent. The first triangle has angles measuring 35°, 65°, and 80°. The second triangle has one angle of 65° and a second angle of 35°. What is the measure of the third angle in the second triangle?',
    choices: ['A. 60°', 'B. 70°', 'C. 80°', 'D. 100°'],
    answer_key: 'C',
    rationale: 'Congruent triangles have equal corresponding angles. 35° + 65° + x = 180°, so x = 80°. Also, congruent means matching angles.',
    tags: ['rigorous', 'eureka_m2', 'congruence', 'triangle_angles'],
    status: 'active',
    passage_id: null,
    week_phase: 'balanced'
  },
  {
    subject: 'math',
    topic: 'geometry',
    subtopic: 'similarity',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'Triangle DEF is similar to triangle ABC with a scale factor of 3:2. If the area of triangle ABC is 24 square units, what is the area of triangle DEF?',
    choices: ['A. 36 sq units', 'B. 54 sq units', 'C. 16 sq units', 'D. 48 sq units'],
    answer_key: 'B',
    rationale: 'For similar figures, the ratio of areas equals the square of the scale factor. Area ratio = (3/2)² = 9/4. Area DEF = 24 × (9/4) = 54.',
    tags: ['rigorous', 'eureka_m2', 'similarity', 'area_ratio'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },

  // ========== LINEAR EQUATIONS ==========
  {
    subject: 'math',
    topic: 'linear_equations',
    subtopic: 'multi_step',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'Solve for x: 3(2x - 4) - 2(x + 5) = 2(x - 1)',
    choices: ['A. x = 5', 'B. x = 10', 'C. x = 15', 'D. No solution'],
    answer_key: 'B',
    rationale: '6x - 12 - 2x - 10 = 2x - 2. Simplify: 4x - 22 = 2x - 2. Then 2x = 20, so x = 10.',
    tags: ['rigorous', 'eureka_m3', 'linear_equations', 'multi_step'],
    status: 'active',
    passage_id: null,
    week_phase: 'balanced'
  },
  {
    subject: 'math',
    topic: 'linear_equations',
    subtopic: 'variables_both_sides',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'For what value of k does the equation 4x + k = 2x + 10 have a solution of x = 3?',
    choices: ['A. k = 4', 'B. k = 10', 'C. k = 16', 'D. k = 6'],
    answer_key: 'A',
    rationale: 'Substitute x = 3: 4(3) + k = 2(3) + 10. So 12 + k = 16, meaning k = 4.',
    tags: ['rigorous', 'eureka_m3', 'linear_equations', 'working_backwards'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'linear_equations',
    subtopic: 'word_problems',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'A phone plan costs $45 per month plus $0.10 per text over 500 texts. Another plan costs $55 per month with unlimited texts. For how many texts are the plans equal in cost?',
    choices: ['A. 100 texts over 500', 'B. 550 texts total', 'C. 600 texts total', 'D. 1000 texts total'],
    answer_key: 'C',
    rationale: 'Let t = texts over 500. Then 45 + 0.10t = 55. So 0.10t = 10, t = 100 texts over 500. Total = 600 texts.',
    tags: ['rigorous', 'eureka_m3', 'word_problems', 'real_world'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'linear_equations',
    subtopic: 'special_cases',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'How many solutions does the equation 2(3x + 4) = 6x + 8 have?',
    choices: ['A. No solutions', 'B. Exactly one solution', 'C. Exactly two solutions', 'D. Infinitely many solutions'],
    answer_key: 'D',
    rationale: '2(3x + 4) = 6x + 8 simplifies to 6x + 8 = 6x + 8, which is always true. Therefore, infinitely many solutions.',
    tags: ['rigorous', 'eureka_m3', 'identity_equations', 'special_cases'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },

  // ========== LINEAR FUNCTIONS ==========
  {
    subject: 'math',
    topic: 'linear_functions',
    subtopic: 'slope',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'Line m passes through points (-2, 5) and (4, -7). What is the slope of a line perpendicular to line m?',
    choices: ['A. -2', 'B. 1/2', 'C. 2', 'D. -1/2'],
    answer_key: 'B',
    rationale: 'Slope of m = (-7 - 5)/(4 - (-2)) = -12/6 = -2. Perpendicular slope is negative reciprocal: 1/2.',
    tags: ['rigorous', 'eureka_m4', 'slope', 'perpendicular'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'linear_functions',
    subtopic: 'equation_from_graph',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'A line has a y-intercept of -3 and passes through the point (6, 9). What is the equation of the line?',
    choices: ['A. y = 2x - 3', 'B. y = 2x + 3', 'C. y = x - 3', 'D. y = 3x - 3'],
    answer_key: 'A',
    rationale: 'Slope = (9 - (-3))/(6 - 0) = 12/6 = 2. y-intercept is -3. Equation: y = 2x - 3.',
    tags: ['rigorous', 'eureka_m4', 'slope_intercept', 'equation_writing'],
    status: 'active',
    passage_id: null,
    week_phase: 'balanced'
  },
  {
    subject: 'math',
    topic: 'linear_functions',
    subtopic: 'rate_of_change',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'A tank contains 200 gallons of water. Water drains at a constant rate of 8 gallons per minute. Which function represents the water remaining after t minutes, and what is a reasonable domain?',
    choices: [
      'A. W(t) = 200 - 8t, 0 ≤ t ≤ 25',
      'B. W(t) = 200 + 8t, t ≥ 0',
      'C. W(t) = 8t - 200, 0 ≤ t ≤ 25',
      'D. W(t) = 200 - 8t, t ≥ 0'
    ],
    answer_key: 'A',
    rationale: 'Water decreases at 8 gal/min: W(t) = 200 - 8t. Empty when 200 - 8t = 0, so t = 25. Domain: 0 ≤ t ≤ 25.',
    tags: ['rigorous', 'eureka_m4', 'rate_of_change', 'domain_context'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },

  // ========== SYSTEMS OF LINEAR EQUATIONS ==========
  {
    subject: 'math',
    topic: 'systems',
    subtopic: 'substitution',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'Solve the system: y = 3x - 7 and 2x + y = 13. What is the value of x + y?',
    choices: ['A. 11', 'B. 12', 'C. 13', 'D. 17'],
    answer_key: 'A',
    rationale: 'Substitute: 2x + (3x - 7) = 13. So 5x - 7 = 13, 5x = 20, x = 4. Then y = 3(4) - 7 = 5. x + y = 9. Wait, let me recalculate. 2x + y = 13, so 2(4) + y = 13, y = 5. x + y = 4 + 5 = 9. Hmm, that doesn\'t match. Let me recheck: if x = 4, y = 3(4) - 7 = 5. Check: 2(4) + 5 = 13 ✓. So x + y = 9, not in choices. Let me redo: 2x + 3x - 7 = 13, 5x = 20, x = 4, y = 5, sum = 9. The answer should be 9 but that\'s not a choice. There may be an error - this needs fixing.',
    tags: ['rigorous', 'eureka_m5', 'systems', 'substitution'],
    status: 'active',
    passage_id: null,
    week_phase: 'balanced'
  },
  {
    subject: 'math',
    topic: 'systems',
    subtopic: 'elimination',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'Solve the system: 3x + 2y = 19 and 3x - 2y = 5. What is the value of x?',
    choices: ['A. 2', 'B. 4', 'C. 5', 'D. 7'],
    answer_key: 'B',
    rationale: 'Add equations: 6x = 24, so x = 4. (Checking: 3(4) + 2y = 19, y = 3.5. 3(4) - 2(3.5) = 12 - 7 = 5 ✓)',
    tags: ['rigorous', 'eureka_m5', 'systems', 'elimination'],
    status: 'active',
    passage_id: null,
    week_phase: 'balanced'
  },
  {
    subject: 'math',
    topic: 'systems',
    subtopic: 'word_problems',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'Adult tickets cost $12 and child tickets cost $8. A group bought 15 tickets for $156. How many adult tickets were purchased?',
    choices: ['A. 6', 'B. 8', 'C. 9', 'D. 10'],
    answer_key: 'C',
    rationale: 'Let a = adult, c = child. a + c = 15 and 12a + 8c = 156. From first: c = 15 - a. Substitute: 12a + 8(15 - a) = 156. 12a + 120 - 8a = 156. 4a = 36. a = 9.',
    tags: ['rigorous', 'eureka_m5', 'systems', 'word_problems'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'systems',
    subtopic: 'no_solution',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'Which system of equations has no solution?',
    choices: [
      'A. y = 2x + 1 and y = 2x - 3',
      'B. y = 2x + 1 and y = -2x + 1',
      'C. y = 2x + 1 and 2y = 4x + 2',
      'D. x + y = 5 and x - y = 1'
    ],
    answer_key: 'A',
    rationale: 'Parallel lines (same slope, different y-intercepts) have no solution. y = 2x + 1 and y = 2x - 3 both have slope 2 but different intercepts.',
    tags: ['rigorous', 'eureka_m5', 'systems', 'special_cases'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },

  // ========== PYTHAGOREAN THEOREM & IRRATIONAL NUMBERS ==========
  {
    subject: 'math',
    topic: 'pythagorean',
    subtopic: 'application',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'A 15-foot ladder leans against a wall. The base of the ladder is 9 feet from the wall. How high up the wall does the ladder reach?',
    choices: ['A. 6 feet', 'B. 12 feet', 'C. 18 feet', 'D. 24 feet'],
    answer_key: 'B',
    rationale: 'Let h = height. h² + 9² = 15². h² + 81 = 225. h² = 144. h = 12 feet.',
    tags: ['rigorous', 'eureka_m6', 'pythagorean', 'application'],
    status: 'active',
    passage_id: null,
    week_phase: 'balanced'
  },
  {
    subject: 'math',
    topic: 'pythagorean',
    subtopic: 'distance',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'What is the distance between points A(-3, 4) and B(5, -2)?',
    choices: ['A. 8', 'B. 10', 'C. 12', 'D. 14'],
    answer_key: 'B',
    rationale: 'd = √[(5-(-3))² + (-2-4)²] = √[64 + 36] = √100 = 10.',
    tags: ['rigorous', 'eureka_m6', 'distance_formula', 'coordinate_geometry'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'irrational_numbers',
    subtopic: 'estimation',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'Between which two consecutive integers does √50 lie?',
    choices: ['A. 5 and 6', 'B. 6 and 7', 'C. 7 and 8', 'D. 8 and 9'],
    answer_key: 'C',
    rationale: '7² = 49 and 8² = 64. Since 49 < 50 < 64, we have 7 < √50 < 8.',
    tags: ['rigorous', 'eureka_m6', 'irrational_numbers', 'estimation'],
    status: 'active',
    passage_id: null,
    week_phase: 'fundamental'
  },
  {
    subject: 'math',
    topic: 'pythagorean',
    subtopic: 'converse',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'A triangle has sides of length 7, 24, and 25. Is this a right triangle? If so, which side is the hypotenuse?',
    choices: [
      'A. Yes, the side of length 25 is the hypotenuse',
      'B. Yes, the side of length 24 is the hypotenuse',
      'C. Yes, the side of length 7 is the hypotenuse',
      'D. No, this is not a right triangle'
    ],
    answer_key: 'A',
    rationale: 'Check: 7² + 24² = 49 + 576 = 625 = 25². Since a² + b² = c², it\'s a right triangle with hypotenuse 25.',
    tags: ['rigorous', 'eureka_m6', 'pythagorean_converse', 'reasoning'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },

  // ========== STATISTICS ==========
  {
    subject: 'math',
    topic: 'data_probability',
    subtopic: 'scatter_plots',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'A scatter plot shows hours studied (x) vs test score (y). The line of best fit is y = 8x + 45. Predict the score for a student who studies 5 hours.',
    choices: ['A. 80', 'B. 85', 'C. 90', 'D. 95'],
    answer_key: 'B',
    rationale: 'y = 8(5) + 45 = 40 + 45 = 85.',
    tags: ['rigorous', 'eureka_m7', 'scatter_plots', 'linear_models'],
    status: 'active',
    passage_id: null,
    week_phase: 'balanced'
  },
  {
    subject: 'math',
    topic: 'data_probability',
    subtopic: 'two_way_tables',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'In a survey, 40 students play sports, 35 play instruments, and 15 do both. How many students play sports OR instruments (or both)?',
    choices: ['A. 50', 'B. 55', 'C. 60', 'D. 75'],
    answer_key: 'C',
    rationale: 'Using inclusion-exclusion: |A ∪ B| = |A| + |B| - |A ∩ B| = 40 + 35 - 15 = 60.',
    tags: ['rigorous', 'eureka_m7', 'probability', 'set_operations'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'data_probability',
    subtopic: 'correlation',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'Which scenario would most likely show a negative correlation?',
    choices: [
      'A. Hours of exercise per week and resting heart rate',
      'B. Temperature and ice cream sales',
      'C. Height and shoe size',
      'D. Study time and test scores'
    ],
    answer_key: 'A',
    rationale: 'More exercise generally leads to lower resting heart rate, showing negative correlation. The others show positive correlations.',
    tags: ['rigorous', 'eureka_m7', 'correlation', 'conceptual'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },

  // ========== VOLUME & 3D GEOMETRY (HSAT FOCUS) ==========
  {
    subject: 'math',
    topic: 'geometry_measurement',
    subtopic: 'volume_cone',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'A cone has a radius of 6 cm and a height of 10 cm. What is its volume? (Use π ≈ 3.14)',
    choices: ['A. 188.4 cm³', 'B. 376.8 cm³', 'C. 565.2 cm³', 'D. 1130.4 cm³'],
    answer_key: 'B',
    rationale: 'V = (1/3)πr²h = (1/3)(3.14)(36)(10) = (1/3)(1130.4) = 376.8 cm³.',
    tags: ['rigorous', 'hsat_focus', 'volume', 'cone'],
    status: 'active',
    passage_id: null,
    week_phase: 'balanced'
  },
  {
    subject: 'math',
    topic: 'geometry_measurement',
    subtopic: 'volume_sphere',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'A sphere has a diameter of 12 inches. What is its volume in terms of π?',
    choices: ['A. 288π in³', 'B. 576π in³', 'C. 864π in³', 'D. 2304π in³'],
    answer_key: 'A',
    rationale: 'Radius = 6. V = (4/3)πr³ = (4/3)π(216) = 288π in³.',
    tags: ['rigorous', 'hsat_focus', 'volume', 'sphere'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'geometry_measurement',
    subtopic: 'volume_cylinder',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'A cylinder and a cone have the same radius and height. If the cylinder\'s volume is 270π cm³, what is the cone\'s volume?',
    choices: ['A. 90π cm³', 'B. 135π cm³', 'C. 180π cm³', 'D. 810π cm³'],
    answer_key: 'A',
    rationale: 'A cone\'s volume is 1/3 of a cylinder with the same dimensions. Cone volume = 270π ÷ 3 = 90π cm³.',
    tags: ['rigorous', 'hsat_focus', 'volume', 'comparison'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },

  // ========== RATIOS & PROPORTIONAL REASONING ==========
  {
    subject: 'math',
    topic: 'ratios_percents',
    subtopic: 'proportional',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'A map uses a scale of 1 inch : 50 miles. Two cities are 3.5 inches apart on the map. What is the actual distance between them?',
    choices: ['A. 125 miles', 'B. 150 miles', 'C. 175 miles', 'D. 200 miles'],
    answer_key: 'C',
    rationale: 'Distance = 3.5 × 50 = 175 miles.',
    tags: ['rigorous', 'hsat_focus', 'scale', 'proportional_reasoning'],
    status: 'active',
    passage_id: null,
    week_phase: 'balanced'
  },
  {
    subject: 'math',
    topic: 'ratios_percents',
    subtopic: 'percent_change',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'A jacket originally costs $80. It\'s discounted 25%, then the sale price is reduced by an additional 20%. What is the final price?',
    choices: ['A. $44', 'B. $48', 'C. $52', 'D. $56'],
    answer_key: 'B',
    rationale: 'After 25% off: $80 × 0.75 = $60. After additional 20% off: $60 × 0.80 = $48.',
    tags: ['rigorous', 'hsat_focus', 'percent', 'successive_discount'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'ratios_percents',
    subtopic: 'percent_increase',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'After a 15% raise, Maya\'s salary is $57,500. What was her salary before the raise?',
    choices: ['A. $48,875', 'B. $50,000', 'C. $51,250', 'D. $52,500'],
    answer_key: 'B',
    rationale: 'Let x = original salary. x + 0.15x = 57500. 1.15x = 57500. x = 50000.',
    tags: ['rigorous', 'hsat_focus', 'percent', 'working_backwards'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },

  // ========== QUADRATIC PREVIEW (HSAT INCLUDES SOME) ==========
  {
    subject: 'math',
    topic: 'quadratics',
    subtopic: 'factoring',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'Factor completely: x² + 5x - 24',
    choices: ['A. (x + 8)(x - 3)', 'B. (x - 8)(x + 3)', 'C. (x + 6)(x - 4)', 'D. (x - 6)(x + 4)'],
    answer_key: 'A',
    rationale: 'Need factors of -24 that sum to 5: 8 and -3. So x² + 5x - 24 = (x + 8)(x - 3).',
    tags: ['rigorous', 'hsat_focus', 'quadratics', 'factoring'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'quadratics',
    subtopic: 'solve_by_factoring',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'Solve: x² - 7x + 12 = 0',
    choices: ['A. x = 3 or x = 4', 'B. x = -3 or x = -4', 'C. x = 2 or x = 6', 'D. x = -2 or x = -6'],
    answer_key: 'A',
    rationale: 'Factor: (x - 3)(x - 4) = 0. So x = 3 or x = 4.',
    tags: ['rigorous', 'hsat_focus', 'quadratics', 'solving'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'quadratics',
    subtopic: 'quadratic_formula',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'Using the quadratic formula, solve: x² + 6x + 5 = 0. What is the sum of the solutions?',
    choices: ['A. -6', 'B. -5', 'C. 5', 'D. 6'],
    answer_key: 'A',
    rationale: 'For ax² + bx + c = 0, sum of roots = -b/a = -6/1 = -6. (Or solve to get x = -1 and x = -5, sum = -6.)',
    tags: ['rigorous', 'hsat_focus', 'quadratics', 'quadratic_formula'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },

  // ========== MORE CHALLENGING WORD PROBLEMS ==========
  {
    subject: 'math',
    topic: 'word_problems',
    subtopic: 'rate_time_distance',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'Train A leaves Chicago at 10 AM traveling at 60 mph. Train B leaves Chicago at 11 AM on the same track at 80 mph. At what time will Train B catch up to Train A?',
    choices: ['A. 1 PM', 'B. 2 PM', 'C. 3 PM', 'D. 4 PM'],
    answer_key: 'B',
    rationale: 'After t hours from 11 AM, Train A has traveled 60 + 60t miles. Train B has traveled 80t miles. Set equal: 60 + 60t = 80t. 60 = 20t. t = 3 hours after 11 AM = 2 PM.',
    tags: ['rigorous', 'hsat_focus', 'word_problems', 'rate_time_distance'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'word_problems',
    subtopic: 'mixture',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'How many liters of a 20% salt solution must be mixed with 10 liters of a 50% salt solution to create a 30% salt solution?',
    choices: ['A. 10 liters', 'B. 15 liters', 'C. 20 liters', 'D. 25 liters'],
    answer_key: 'C',
    rationale: 'Let x = liters of 20% solution. 0.20x + 0.50(10) = 0.30(x + 10). 0.20x + 5 = 0.30x + 3. 2 = 0.10x. x = 20 liters.',
    tags: ['rigorous', 'hsat_focus', 'word_problems', 'mixture'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'word_problems',
    subtopic: 'work',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'Alex can paint a room in 6 hours. Jordan can paint the same room in 4 hours. Working together, how long will it take them to paint the room?',
    choices: ['A. 2.0 hours', 'B. 2.4 hours', 'C. 2.5 hours', 'D. 3.0 hours'],
    answer_key: 'B',
    rationale: 'Combined rate = 1/6 + 1/4 = 2/12 + 3/12 = 5/12 rooms per hour. Time = 12/5 = 2.4 hours.',
    tags: ['rigorous', 'hsat_focus', 'word_problems', 'work_rate'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },
  {
    subject: 'math',
    topic: 'word_problems',
    subtopic: 'age',
    difficulty: 5,
    cognitive_level: 4,
    source_style: 'iowa_like',
    stem: 'Sarah is twice as old as Tom. In 6 years, Sarah will be 1.5 times as old as Tom. How old is Tom now?',
    choices: ['A. 6 years', 'B. 10 years', 'C. 12 years', 'D. 18 years'],
    answer_key: 'C',
    rationale: 'Let T = Tom\'s age. Sarah = 2T. In 6 years: 2T + 6 = 1.5(T + 6). 2T + 6 = 1.5T + 9. 0.5T = 3. T = 6. Wait, let me recheck: 2(6) + 6 = 18, 1.5(12) = 18. ✓ But that gives T = 6, which contradicts my answer. Let me redo: if T = 12, Sarah = 24. In 6 years: Sarah = 30, Tom = 18. 30/18 = 5/3 ≈ 1.67 ≠ 1.5. If T = 6: Sarah = 12. In 6 years: Sarah = 18, Tom = 12. 18/12 = 1.5 ✓. So Tom is 6. Answer should be A.',
    tags: ['rigorous', 'hsat_focus', 'word_problems', 'age_problems'],
    status: 'active',
    passage_id: null,
    week_phase: 'application'
  },

  // ========== NUMBER PROPERTIES ==========
  {
    subject: 'math',
    topic: 'number_sense',
    subtopic: 'divisibility',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'What is the least common multiple (LCM) of 12 and 18?',
    choices: ['A. 36', 'B. 48', 'C. 72', 'D. 216'],
    answer_key: 'A',
    rationale: '12 = 2² × 3. 18 = 2 × 3². LCM = 2² × 3² = 4 × 9 = 36.',
    tags: ['rigorous', 'hsat_focus', 'number_properties', 'lcm'],
    status: 'active',
    passage_id: null,
    week_phase: 'fundamental'
  },
  {
    subject: 'math',
    topic: 'number_sense',
    subtopic: 'prime_factorization',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'If the prime factorization of a number is 2³ × 3² × 5, how many factors does the number have?',
    choices: ['A. 10', 'B. 18', 'C. 24', 'D. 30'],
    answer_key: 'C',
    rationale: 'Number of factors = (3+1)(2+1)(1+1) = 4 × 3 × 2 = 24.',
    tags: ['rigorous', 'hsat_focus', 'number_properties', 'factors'],
    status: 'active',
    passage_id: null,
    week_phase: 'balanced'
  },
  {
    subject: 'math',
    topic: 'number_sense',
    subtopic: 'absolute_value',
    difficulty: 4,
    cognitive_level: 3,
    source_style: 'iowa_like',
    stem: 'Solve: |2x - 5| = 11',
    choices: ['A. x = 3 or x = 8', 'B. x = -3 or x = 8', 'C. x = 3 or x = -8', 'D. x = -3 or x = -8'],
    answer_key: 'B',
    rationale: '2x - 5 = 11 → x = 8. OR 2x - 5 = -11 → 2x = -6 → x = -3.',
    tags: ['rigorous', 'hsat_focus', 'absolute_value', 'solving'],
    status: 'active',
    passage_id: null,
    week_phase: 'balanced'
  }
]

// Fix the systems problem that had an error in rationale
const fixedItems = rigorousMathItems.map(item => {
  if (item.stem === 'Solve the system: y = 3x - 7 and 2x + y = 13. What is the value of x + y?') {
    return {
      ...item,
      stem: 'Solve the system: y = 2x - 1 and x + y = 8. What is the value of x + y?',
      choices: ['A. 8', 'B. 9', 'C. 10', 'D. 11'],
      answer_key: 'A',
      rationale: 'Substitute: x + (2x - 1) = 8. So 3x - 1 = 8, 3x = 9, x = 3. Then y = 2(3) - 1 = 5. x + y = 8.',
    }
  }
  if (item.stem === 'Sarah is twice as old as Tom. In 6 years, Sarah will be 1.5 times as old as Tom. How old is Tom now?') {
    return {
      ...item,
      answer_key: 'A',
      rationale: 'Let T = Tom\'s age. Sarah = 2T. In 6 years: 2T + 6 = 1.5(T + 6). 2T + 6 = 1.5T + 9. 0.5T = 3. T = 6 years.',
    }
  }
  return item
})

async function main() {
  console.log('Generating rigorous math items aligned with Eureka Math Squared and HSAT...\n')

  const existingItems: Item[] = JSON.parse(
    fs.readFileSync(path.join(BANK_DIR, 'items.json'), 'utf8')
  )

  const now = new Date().toISOString()
  const newItems: Item[] = fixedItems.map(item => ({
    ...item,
    id: randomUUID(),
    created_at: now
  }))

  const allItems = [...existingItems, ...newItems]

  fs.writeFileSync(
    path.join(BANK_DIR, 'items.json'),
    JSON.stringify(allItems, null, 2)
  )

  const mathCount = allItems.filter(i => i.subject === 'math').length
  const readingCount = allItems.filter(i => i.subject === 'reading').length
  const rigorousCount = newItems.length

  console.log('========================================')
  console.log('Rigorous Math Generation Complete!')
  console.log('========================================')
  console.log(`New rigorous items added: ${rigorousCount}`)
  console.log(`\nTotal items: ${allItems.length}`)
  console.log(`  Math: ${mathCount} (${((mathCount/allItems.length)*100).toFixed(1)}%)`)
  console.log(`  Reading: ${readingCount} (${((readingCount/allItems.length)*100).toFixed(1)}%)`)
  console.log(`\nTopics covered:`)
  const topics = [...new Set(newItems.map(i => i.topic))]
  topics.forEach(t => {
    const count = newItems.filter(i => i.topic === t).length
    console.log(`  - ${t}: ${count} items`)
  })
  console.log(`\nRun 'npx tsx scripts/importBank.ts' to upload to Supabase`)
}

main().catch(console.error)
