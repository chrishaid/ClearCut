'use server'

import { createClient } from '@/lib/supabase/server'
import { calculateWeekNumber, getWeekPhase, getTopicWeight } from '@/lib/fsrs/scheduler'
import type { Session, SessionWithItems, Item, ItemWithPassage } from '@/types/database'

const DEFAULT_SESSION_SIZE = 25
const DEFAULT_REVIEW_TARGET = 15
const DEFAULT_NEW_TARGET = 10

interface CreateSessionResult {
  session: Session
  items: ItemWithPassage[]
  error?: string
}

/**
 * Create or get today's daily practice session
 */
export async function createDailySession(): Promise<CreateSessionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const today = new Date().toISOString().split('T')[0]

  // Check if session already exists for today
  const { data: existingSession } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('session_date', today)
    .eq('session_type', 'daily')
    .single()

  if (existingSession) {
    // Return existing session with items
    const items = await getSessionItems(existingSession.id)
    return { session: existingSession, items }
  }

  // Get user profile for study start date
  const { data: profile } = await supabase
    .from('profiles')
    .select('study_start_date, daily_goal')
    .eq('id', user.id)
    .single()

  // Calculate week number
  const studyStartDate = profile?.study_start_date
    ? new Date(profile.study_start_date)
    : new Date()
  const weekNumber = calculateWeekNumber(studyStartDate)
  const weekPhase = getWeekPhase(weekNumber)

  // Get due review items
  const now = new Date().toISOString()
  const { data: dueItems } = await supabase
    .from('user_item_state')
    .select(`
      *,
      item:items(*, passage:passages(*))
    `)
    .eq('user_id', user.id)
    .lte('due', now)
    .neq('state', 'new')
    .order('due', { ascending: true })
    .limit(DEFAULT_REVIEW_TARGET)

  const reviewItems = (dueItems || [])
    .map(d => d.item as ItemWithPassage)
    .filter(Boolean)

  const reviewCount = reviewItems.length
  const newItemsNeeded = Math.max(0, DEFAULT_SESSION_SIZE - reviewCount)

  // Get IDs of items user has already seen
  const { data: seenItemIds } = await supabase
    .from('user_item_state')
    .select('item_id')
    .eq('user_id', user.id)

  const seenIds = new Set((seenItemIds || []).map(s => s.item_id))

  // Get new items (not yet in user_item_state)
  let newItems: ItemWithPassage[] = []

  if (newItemsNeeded > 0) {
    // Get all active items not yet seen
    const { data: availableItems } = await supabase
      .from('items')
      .select('*, passage:passages(*)')
      .eq('status', 'active')
      .limit(200) // Get a pool to select from

    if (availableItems) {
      // Filter out seen items
      const unseenItems = availableItems.filter(item => !seenIds.has(item.id))

      // Weight items by topic phase
      const weightedItems = unseenItems.map(item => ({
        item: item as ItemWithPassage,
        weight: getTopicWeight(item.topic, weekPhase),
      }))

      // Sort by weight (higher first) and take needed amount
      // Also try to balance subjects
      const mathItems = weightedItems
        .filter(w => w.item.subject === 'math')
        .sort((a, b) => b.weight - a.weight)

      const readingItems = weightedItems
        .filter(w => w.item.subject === 'reading')
        .sort((a, b) => b.weight - a.weight)

      // Alternate between subjects for balance
      const halfNeeded = Math.ceil(newItemsNeeded / 2)
      const selectedMath = mathItems.slice(0, halfNeeded).map(w => w.item)
      const selectedReading = readingItems.slice(0, halfNeeded).map(w => w.item)

      // Interleave and trim to exact count
      newItems = []
      for (let i = 0; i < halfNeeded; i++) {
        if (selectedMath[i]) newItems.push(selectedMath[i])
        if (selectedReading[i]) newItems.push(selectedReading[i])
      }
      newItems = newItems.slice(0, newItemsNeeded)
    }
  }

  // Create session record
  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      session_type: 'daily',
      session_date: today,
      week_number: weekNumber,
      target_new: newItems.length,
      target_review: reviewCount,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (sessionError || !session) {
    throw new Error('Failed to create session')
  }

  // Combine items: reviews first, then new
  const allItems = [...reviewItems, ...newItems]

  // Create session_items records
  const sessionItemsData = allItems.map((item, index) => ({
    session_id: session.id,
    item_id: item.id,
    position: index + 1,
    is_review: index < reviewCount,
  }))

  if (sessionItemsData.length > 0) {
    await supabase.from('session_items').insert(sessionItemsData)
  }

  // Create user_item_state for new items
  const newItemStates = newItems.map(item => ({
    user_id: user.id,
    item_id: item.id,
    due: new Date().toISOString(), // Due now (will be updated after first attempt)
    state: 'new' as const,
    first_seen_at: new Date().toISOString(),
  }))

  if (newItemStates.length > 0) {
    await supabase.from('user_item_state').upsert(newItemStates, {
      onConflict: 'user_id,item_id',
    })
  }

  return { session, items: allItems }
}

/**
 * Get items for an existing session
 */
export async function getSessionItems(sessionId: string): Promise<ItemWithPassage[]> {
  const supabase = await createClient()

  const { data: sessionItems } = await supabase
    .from('session_items')
    .select(`
      *,
      item:items(*, passage:passages(*))
    `)
    .eq('session_id', sessionId)
    .order('position', { ascending: true })

  return (sessionItems || [])
    .map(si => si.item as ItemWithPassage)
    .filter(Boolean)
}

/**
 * Get full session with items
 */
export async function getSession(sessionId: string): Promise<SessionWithItems | null> {
  const supabase = await createClient()

  const { data: session } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (!session) return null

  const { data: sessionItems } = await supabase
    .from('session_items')
    .select(`
      *,
      item:items(*, passage:passages(*))
    `)
    .eq('session_id', sessionId)
    .order('position', { ascending: true })

  return {
    ...session,
    items: sessionItems || [],
  } as SessionWithItems
}

/**
 * Complete a session
 */
export async function completeSession(
  sessionId: string,
  stats: {
    correctCount: number
    incorrectCount: number
    totalSeconds: number
    actualNew: number
    actualReview: number
  }
): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Update session
  await supabase
    .from('sessions')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
      correct_count: stats.correctCount,
      incorrect_count: stats.incorrectCount,
      total_seconds: stats.totalSeconds,
      actual_new: stats.actualNew,
      actual_review: stats.actualReview,
    })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  // Update streak
  await updateStreak(user.id)

  // Update daily stats
  await updateDailyStats(user.id, stats)
}

/**
 * Update user's streak after completing a session
 */
async function updateStreak(userId: string): Promise<void> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!streak) {
    // Create new streak record
    await supabase.from('streaks').insert({
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: today,
      streak_start_date: today,
    })
    return
  }

  const lastActivity = streak.last_activity_date
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let newStreak = streak.current_streak

  if (lastActivity === today) {
    // Already completed today, no change
    return
  } else if (lastActivity === yesterdayStr) {
    // Consecutive day, increment streak
    newStreak = streak.current_streak + 1
  } else {
    // Streak broken, start over
    newStreak = 1
  }

  await supabase
    .from('streaks')
    .update({
      current_streak: newStreak,
      longest_streak: Math.max(newStreak, streak.longest_streak),
      last_activity_date: today,
      streak_start_date: newStreak === 1 ? today : streak.streak_start_date,
    })
    .eq('user_id', userId)
}

/**
 * Update daily stats aggregate
 */
async function updateDailyStats(
  userId: string,
  stats: {
    correctCount: number
    incorrectCount: number
    totalSeconds: number
    actualNew: number
    actualReview: number
  }
): Promise<void> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  // Get today's attempts to calculate subject breakdowns
  const { data: todayAttempts } = await supabase
    .from('attempts')
    .select(`
      result,
      item:items(subject)
    `)
    .eq('user_id', userId)
    .gte('created_at', `${today}T00:00:00`)
    .lte('created_at', `${today}T23:59:59`)

  let mathCorrect = 0
  let mathTotal = 0
  let readingCorrect = 0
  let readingTotal = 0

  todayAttempts?.forEach(attempt => {
    const subject = (attempt.item as { subject: string })?.subject
    if (subject === 'math') {
      mathTotal++
      if (attempt.result === 'correct') mathCorrect++
    } else if (subject === 'reading') {
      readingTotal++
      if (attempt.result === 'correct') readingCorrect++
    }
  })

  await supabase
    .from('daily_stats')
    .upsert({
      user_id: userId,
      stat_date: today,
      items_studied: stats.correctCount + stats.incorrectCount,
      items_correct: stats.correctCount,
      items_incorrect: stats.incorrectCount,
      new_items_seen: stats.actualNew,
      reviews_completed: stats.actualReview,
      total_seconds: stats.totalSeconds,
      sessions_completed: 1,
      math_correct: mathCorrect,
      math_total: mathTotal,
      reading_correct: readingCorrect,
      reading_total: readingTotal,
    }, {
      onConflict: 'user_id,stat_date',
    })
}

/**
 * Options for filtering exam content
 */
interface ExamFilterOptions {
  subject?: 'math' | 'reading'
  topics?: string[]
}

/**
 * Create a timed practice exam
 */
export async function createTimedExam(
  minutes: 10 | 20 | 30 | 60,
  filters?: ExamFilterOptions
): Promise<CreateSessionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Roughly 1 item per minute
  const itemCount = minutes
  const today = new Date().toISOString().split('T')[0]

  // Check for existing incomplete exam today - delete it to allow a new one
  const { data: existingExam } = await supabase
    .from('sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('session_date', today)
    .eq('session_type', 'exam')
    .eq('completed', false)
    .single()

  if (existingExam) {
    // Delete session_items first, then the session
    await supabase.from('session_items').delete().eq('session_id', existingExam.id)
    await supabase.from('sessions').delete().eq('id', existingExam.id)
  }

  // Build query with optional filters
  let query = supabase
    .from('items')
    .select('*, passage:passages(*)')
    .eq('status', 'active')

  // Apply subject filter
  if (filters?.subject) {
    query = query.eq('subject', filters.subject)
  }

  // Apply topic filter
  if (filters?.topics && filters.topics.length > 0) {
    query = query.in('topic', filters.topics)
  }

  const { data: availableItems } = await query.limit(500)

  if (!availableItems || availableItems.length < itemCount) {
    throw new Error(`Not enough items available with current filters. Found ${availableItems?.length || 0}, need ${itemCount}.`)
  }

  // Shuffle function
  const shuffle = <T>(arr: T[]): T[] => {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  let examItems: ItemWithPassage[]

  // If subject filter is applied, just shuffle and take items
  if (filters?.subject) {
    examItems = shuffle(availableItems).slice(0, itemCount) as ItemWithPassage[]
  } else {
    // Balance between subjects
    const mathItems = availableItems.filter(i => i.subject === 'math')
    const readingItems = availableItems.filter(i => i.subject === 'reading')

    const shuffledMath = shuffle(mathItems)
    const shuffledReading = shuffle(readingItems)

    const halfCount = Math.ceil(itemCount / 2)
    const selectedItems = [
      ...shuffledMath.slice(0, halfCount),
      ...shuffledReading.slice(0, halfCount),
    ].slice(0, itemCount)

    examItems = shuffle(selectedItems) as ItemWithPassage[]
  }

  // Get week number
  const { data: profile } = await supabase
    .from('profiles')
    .select('study_start_date')
    .eq('id', user.id)
    .single()

  const studyStartDate = profile?.study_start_date
    ? new Date(profile.study_start_date)
    : new Date()
  const weekNumber = calculateWeekNumber(studyStartDate)

  // Create exam session
  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      user_id: user.id,
      session_type: 'exam',
      session_date: today,
      week_number: weekNumber,
      target_new: 0,
      target_review: itemCount,
      time_limit_minutes: minutes,
      started_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error || !session) {
    console.error('Exam session creation error:', error)
    throw new Error(`Failed to create exam session: ${error?.message || 'Unknown error'}`)
  }

  // Create session items
  const sessionItemsData = examItems.map((item, index) => ({
    session_id: session.id,
    item_id: item.id,
    position: index + 1,
    is_review: false, // Exams don't affect FSRS scheduling
  }))

  await supabase.from('session_items').insert(sessionItemsData)

  return { session, items: examItems }
}
