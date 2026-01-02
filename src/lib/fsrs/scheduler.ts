import { getFSRS } from './index'
import { Rating, Grades } from 'ts-fsrs'
import { dbStateToCard, cardToDbUpdate, mapRatingToGrade, mapStateToDb, mapGradeToRating } from './mappers'
import type { UserItemState, FSRSRating, FSRSState } from '@/types/database'
import type { ScheduleResult } from './types'

/**
 * Schedule the next review for an item based on user's rating
 */
export function scheduleReview(
  currentState: UserItemState | null,
  rating: FSRSRating,
  reviewDate: Date = new Date()
): ScheduleResult {
  const fsrs = getFSRS()
  const card = dbStateToCard(currentState)
  const grade = mapRatingToGrade(rating)

  // Get the result for the given rating directly
  const result = fsrs.next(card, reviewDate, grade)
  const newCard = result.card

  return {
    nextDue: newCard.due,
    scheduledDays: newCard.scheduled_days,
    newStability: newCard.stability,
    newDifficulty: newCard.difficulty,
    newState: mapStateToDb(newCard.state),
    newReps: newCard.reps,
    newLapses: newCard.lapses,
  }
}

/**
 * Get the database update object after scheduling
 */
export function getScheduleDbUpdate(
  currentState: UserItemState | null,
  rating: FSRSRating,
  reviewDate: Date = new Date()
): Partial<UserItemState> {
  const fsrs = getFSRS()
  const card = dbStateToCard(currentState)
  const grade = mapRatingToGrade(rating)

  const result = fsrs.next(card, reviewDate, grade)

  return cardToDbUpdate(result.card)
}

/**
 * Check if an item is due for review
 */
export function isDue(state: UserItemState, asOf: Date = new Date()): boolean {
  return new Date(state.due) <= asOf
}

/**
 * Calculate review priority for queue ordering
 * Higher priority = should review first
 */
export function getReviewPriority(state: UserItemState): number {
  const now = new Date()
  const due = new Date(state.due)

  // Days overdue (more overdue = higher priority)
  const overdueDays = Math.max(0, (now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))

  // State priority (relearning items need attention first)
  const statePriority: Record<FSRSState, number> = {
    'relearning': 100,
    'learning': 50,
    'review': 0,
    'new': -50,
  }

  // Lower stability = more fragile memory = higher priority
  const stabilityFactor = Math.max(0, 10 - state.stability)

  return overdueDays * 10 + statePriority[state.state] + stabilityFactor
}

/**
 * Get preview of all possible scheduling outcomes
 * Useful for showing user what will happen with each rating
 */
export function getSchedulePreview(
  currentState: UserItemState | null,
  reviewDate: Date = new Date()
): Record<FSRSRating, { nextDue: Date; scheduledDays: number }> {
  const fsrs = getFSRS()
  const card = dbStateToCard(currentState)

  // Use next() for each grade to get the outcomes
  const result: Record<FSRSRating, { nextDue: Date; scheduledDays: number }> = {} as Record<FSRSRating, { nextDue: Date; scheduledDays: number }>

  // Grades is [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]
  for (const grade of Grades) {
    const outcome = fsrs.next(card, reviewDate, grade)
    const ratingKey = mapGradeToRating(grade)
    result[ratingKey] = {
      nextDue: outcome.card.due,
      scheduledDays: outcome.card.scheduled_days,
    }
  }

  return result
}

/**
 * Calculate week number from study start date
 */
export function calculateWeekNumber(startDate: Date, currentDate: Date = new Date()): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const diff = currentDate.getTime() - startDate.getTime()
  return Math.max(1, Math.floor(diff / msPerWeek) + 1)
}

/**
 * Get the current week phase based on week number
 */
export type WeekPhase = 'fundamentals' | 'balanced' | 'applications'

export function getWeekPhase(weekNumber: number): WeekPhase {
  if (weekNumber <= 4) return 'fundamentals'
  if (weekNumber <= 20) return 'balanced'
  return 'applications'
}

/**
 * Topic categorization for week-based weighting
 */
export const TOPIC_PHASES: Record<string, WeekPhase> = {
  // Math fundamentals
  'number_sense': 'fundamentals',
  'linear_equations': 'fundamentals',
  'fractions_decimals': 'fundamentals',

  // Math balanced
  'ratios_percents': 'balanced',
  'geometry_measurement': 'balanced',
  'algebraic_expressions': 'balanced',

  // Math applications
  'data_probability': 'applications',
  'word_problems': 'applications',
  'multi_step': 'applications',

  // Reading fundamentals
  'vocab_context': 'fundamentals',
  'main_idea': 'fundamentals',

  // Reading balanced
  'inference': 'balanced',
  'structure_evidence': 'balanced',
  'supporting_details': 'balanced',

  // Reading applications
  'author_craft': 'applications',
  'compare_contrast': 'applications',
  'analysis': 'applications',
}

/**
 * Get weight multiplier for topic selection in current week phase
 */
export function getTopicWeight(topic: string, currentPhase: WeekPhase): number {
  const topicPhase = TOPIC_PHASES[topic] || 'balanced'

  // Double weight for matching phase
  if (topicPhase === currentPhase) return 2.0

  // Balanced phase weights everything equally
  if (currentPhase === 'balanced') return 1.0

  // Slight penalty for off-phase topics (but still include them)
  return 0.5
}
