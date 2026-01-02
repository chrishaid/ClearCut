import { createEmptyCard, Rating, State, type Card, type Grade } from 'ts-fsrs'
import type { UserItemState, FSRSState, FSRSRating } from '@/types/database'
import type { FSRSCardState } from './types'

// Map database state enum to ts-fsrs State
const stateToFSRS: Record<FSRSState, State> = {
  'new': State.New,
  'learning': State.Learning,
  'review': State.Review,
  'relearning': State.Relearning,
}

// Map ts-fsrs State to database enum
const fsrsToState: Record<State, FSRSState> = {
  [State.New]: 'new',
  [State.Learning]: 'learning',
  [State.Review]: 'review',
  [State.Relearning]: 'relearning',
}

// Map database rating enum to ts-fsrs Grade (not Rating, since Grade excludes Manual)
const ratingToGrade: Record<FSRSRating, Grade> = {
  'again': Rating.Again,
  'hard': Rating.Hard,
  'good': Rating.Good,
  'easy': Rating.Easy,
}

// Map ts-fsrs Grade to database enum
const gradeToRating: Record<Grade, FSRSRating> = {
  [Rating.Again]: 'again',
  [Rating.Hard]: 'hard',
  [Rating.Good]: 'good',
  [Rating.Easy]: 'easy',
}

/**
 * Convert database user_item_state to ts-fsrs Card
 */
export function dbStateToCard(state: UserItemState | null): Card {
  if (!state || state.state === 'new') {
    return createEmptyCard()
  }

  return {
    due: new Date(state.due),
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: state.elapsed_days,
    scheduled_days: state.scheduled_days,
    reps: state.reps,
    lapses: state.lapses,
    state: stateToFSRS[state.state],
    last_review: state.last_review ? new Date(state.last_review) : undefined,
    learning_steps: 0, // Number of short-term learning steps completed
  }
}

/**
 * Convert ts-fsrs Card to database update object
 */
export function cardToDbUpdate(card: Card): Partial<UserItemState> {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    reps: card.reps,
    lapses: card.lapses,
    state: fsrsToState[card.state],
    last_review: card.last_review?.toISOString() ?? null,
  }
}

/**
 * Convert database state to application-level FSRSCardState
 */
export function dbStateToAppState(state: UserItemState | null): FSRSCardState | null {
  if (!state) return null

  return {
    due: new Date(state.due),
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: state.elapsed_days,
    scheduled_days: state.scheduled_days,
    reps: state.reps,
    lapses: state.lapses,
    state: state.state,
    last_review: state.last_review ? new Date(state.last_review) : null,
  }
}

/**
 * Map user-facing rating to ts-fsrs Grade
 */
export function mapRatingToGrade(rating: FSRSRating): Grade {
  return ratingToGrade[rating]
}

/**
 * Map ts-fsrs Grade to database rating
 */
export function mapGradeToRating(grade: Grade): FSRSRating {
  return gradeToRating[grade]
}

/**
 * Map ts-fsrs State to database state
 */
export function mapStateToDb(state: State): FSRSState {
  return fsrsToState[state]
}

/**
 * Map database state to ts-fsrs State
 */
export function mapStateToFSRS(state: FSRSState): State {
  return stateToFSRS[state]
}
