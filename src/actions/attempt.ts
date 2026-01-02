'use server'

import { createClient } from '@/lib/supabase/server'
import { getScheduleDbUpdate } from '@/lib/fsrs/scheduler'
import type { FSRSRating, AttemptResult, Item, Subject, UserItemState, TopicStat } from '@/types/database'

interface RecordAttemptInput {
  itemId: string
  sessionId: string
  response: string
  secondsSpent: number
  rating: FSRSRating
}

interface RecordAttemptResult {
  isCorrect: boolean
  correctAnswer: string
  rationale: string
  nextDue?: Date
  scheduledDays?: number
}

/**
 * Record an attempt and update FSRS scheduling
 */
export async function recordAttempt(input: RecordAttemptInput): Promise<RecordAttemptResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { itemId, sessionId, response, secondsSpent, rating } = input

  // Get the item to check answer
  const { data: item } = await supabase
    .from('items')
    .select('answer_key, rationale')
    .eq('id', itemId)
    .single() as { data: { answer_key: string; rationale: string } | null }

  if (!item) {
    throw new Error('Item not found')
  }

  // Check if correct
  const isCorrect = response.toUpperCase() === item.answer_key.toUpperCase()
  const result: AttemptResult = isCorrect ? 'correct' : 'incorrect'

  // Get current FSRS state
  const { data: currentState } = await supabase
    .from('user_item_state')
    .select('*')
    .eq('user_id', user.id)
    .eq('item_id', itemId)
    .single() as { data: UserItemState | null }

  // Calculate new FSRS state
  const now = new Date()
  const fsrsUpdate = getScheduleDbUpdate(currentState, rating, now)

  // Record attempt with before/after snapshots
  const attemptData = {
    user_id: user.id,
    item_id: itemId,
    session_id: sessionId,
    presented_at: now.toISOString(),
    answered_at: now.toISOString(),
    seconds_spent: secondsSpent,
    response,
    result,
    rating,
    // Before snapshots
    state_before: currentState?.state || 'new',
    stability_before: currentState?.stability || 0,
    difficulty_before: currentState?.difficulty || 0,
    // After snapshots
    state_after: fsrsUpdate.state,
    stability_after: fsrsUpdate.stability,
    difficulty_after: fsrsUpdate.difficulty,
    scheduled_days_after: fsrsUpdate.scheduled_days,
  }

  await supabase.from('attempts').insert(attemptData)

  // Update user_item_state with new FSRS values
  await supabase
    .from('user_item_state')
    .upsert({
      user_id: user.id,
      item_id: itemId,
      due: fsrsUpdate.due || now.toISOString(),
      stability: fsrsUpdate.stability,
      difficulty: fsrsUpdate.difficulty,
      elapsed_days: fsrsUpdate.elapsed_days,
      scheduled_days: fsrsUpdate.scheduled_days,
      reps: fsrsUpdate.reps,
      lapses: fsrsUpdate.lapses,
      state: fsrsUpdate.state,
      last_review: now.toISOString(),
    }, {
      onConflict: 'user_id,item_id',
    })

  // Mark session item as answered
  await supabase
    .from('session_items')
    .update({ answered: true })
    .eq('session_id', sessionId)
    .eq('item_id', itemId)

  // Update topic stats
  await updateTopicStats(user.id, itemId, isCorrect, secondsSpent)

  return {
    isCorrect,
    correctAnswer: item.answer_key,
    rationale: item.rationale,
    nextDue: fsrsUpdate.due ? new Date(fsrsUpdate.due) : undefined,
    scheduledDays: fsrsUpdate.scheduled_days,
  }
}

/**
 * Update topic statistics after an attempt
 */
async function updateTopicStats(
  userId: string,
  itemId: string,
  isCorrect: boolean,
  secondsSpent: number
): Promise<void> {
  const supabase = await createClient()

  // Get item's subject and topic
  const { data: item } = await supabase
    .from('items')
    .select('subject, topic')
    .eq('id', itemId)
    .single() as { data: { subject: Subject; topic: string } | null }

  if (!item) return

  // Get existing topic stats
  const { data: existingStats } = await supabase
    .from('topic_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('subject', item.subject)
    .eq('topic', item.topic)
    .single() as { data: TopicStat | null }

  const now = new Date()
  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

  // Calculate new stats
  const totalAttempts = (existingStats?.total_attempts || 0) + 1
  const totalCorrect = (existingStats?.total_correct || 0) + (isCorrect ? 1 : 0)

  // For recent stats, we need to count attempts from last 14 days
  // This is a simplified version - in production you might want a more accurate count
  const recentAttempts = (existingStats?.recent_attempts || 0) + 1
  const recentCorrect = (existingStats?.recent_correct || 0) + (isCorrect ? 1 : 0)

  // Calculate average time (running average)
  const prevAvgTime = existingStats?.avg_time_seconds || secondsSpent
  const avgTimeSeconds = (prevAvgTime * (totalAttempts - 1) + secondsSpent) / totalAttempts

  // Calculate mastery score (simple accuracy-based for now)
  // Could be enhanced with stability, recency weighting, etc.
  const masteryScore = totalAttempts >= 3
    ? (totalCorrect / totalAttempts) * 100
    : null

  await supabase
    .from('topic_stats')
    .upsert({
      user_id: userId,
      subject: item.subject,
      topic: item.topic,
      total_attempts: totalAttempts,
      total_correct: totalCorrect,
      recent_attempts: recentAttempts,
      recent_correct: recentCorrect,
      avg_time_seconds: avgTimeSeconds,
      mastery_score: masteryScore,
      last_attempted_at: now.toISOString(),
    }, {
      onConflict: 'user_id,subject,topic',
    })
}

/**
 * Record an exam attempt (doesn't update FSRS)
 */
export async function recordExamAttempt(input: {
  itemId: string
  sessionId: string
  response: string
  secondsSpent: number
}): Promise<{ isCorrect: boolean }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { itemId, sessionId, response, secondsSpent } = input

  // Get the item to check answer
  const { data: item } = await supabase
    .from('items')
    .select('answer_key')
    .eq('id', itemId)
    .single() as { data: { answer_key: string } | null }

  if (!item) {
    throw new Error('Item not found')
  }

  const isCorrect = response.toUpperCase() === item.answer_key.toUpperCase()
  const result: AttemptResult = isCorrect ? 'correct' : 'incorrect'

  // Record attempt (no FSRS rating for exams)
  await supabase.from('attempts').insert({
    user_id: user.id,
    item_id: itemId,
    session_id: sessionId,
    presented_at: new Date().toISOString(),
    answered_at: new Date().toISOString(),
    seconds_spent: secondsSpent,
    response,
    result,
    rating: 'good' as FSRSRating, // Placeholder rating for exam attempts
  })

  // Mark session item as answered
  await supabase
    .from('session_items')
    .update({ answered: true })
    .eq('session_id', sessionId)
    .eq('item_id', itemId)

  return { isCorrect }
}

/**
 * Get attempt history for an item (for review page)
 */
export async function getItemAttempts(itemId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data: attempts } = await supabase
    .from('attempts')
    .select('*')
    .eq('user_id', user.id)
    .eq('item_id', itemId)
    .order('created_at', { ascending: false })
    .limit(10)

  return attempts || []
}
