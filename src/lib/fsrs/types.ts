import type { FSRSState, FSRSRating } from '@/types/database'

// Application-level types for FSRS integration

export interface FSRSCardState {
  due: Date
  stability: number
  difficulty: number
  elapsed_days: number
  scheduled_days: number
  reps: number
  lapses: number
  state: FSRSState
  last_review: Date | null
}

export interface ScheduleResult {
  nextDue: Date
  scheduledDays: number
  newStability: number
  newDifficulty: number
  newState: FSRSState
  newReps: number
  newLapses: number
}

// Confidence options shown to users (mapped to FSRS ratings)
export type ConfidenceOption = {
  label: string
  description: string
  rating: FSRSRating
}

// Options for correct answers
export const CORRECT_CONFIDENCE_OPTIONS: ConfidenceOption[] = [
  {
    label: 'Too Easy',
    description: 'I knew it instantly',
    rating: 'easy',
  },
  {
    label: 'Just Right',
    description: 'I had to think about it',
    rating: 'good',
  },
  {
    label: 'Tricky',
    description: 'I almost got it wrong',
    rating: 'hard',
  },
]

// Options for incorrect answers
export const INCORRECT_CONFIDENCE_OPTIONS: ConfidenceOption[] = [
  {
    label: 'Total Guess',
    description: "I didn't know this at all",
    rating: 'again',
  },
  {
    label: 'Almost Had It',
    description: 'I was close / knew the concept',
    rating: 'hard',
  },
]
