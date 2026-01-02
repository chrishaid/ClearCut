'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { recordAttempt } from '@/actions/attempt'
import { completeSession, getSession } from '@/actions/session'
import { QuestionCard } from '@/components/practice/QuestionCard'
import { FeedbackPanel } from '@/components/practice/FeedbackPanel'
import { ConfidenceRating } from '@/components/practice/ConfidenceRating'
import { SessionProgress } from '@/components/practice/SessionProgress'
import { SessionSummary } from '@/components/practice/SessionSummary'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { ItemWithPassage, FSRSRating, SessionWithItems } from '@/types/database'

type SessionState = 'loading' | 'answering' | 'checking' | 'feedback' | 'rating' | 'completed'

interface AttemptResult {
  isCorrect: boolean
  correctAnswer: string
  rationale: string
}

export default function PracticeSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const router = useRouter()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [session, setSession] = useState<SessionWithItems | null>(null)
  const [items, setItems] = useState<ItemWithPassage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [state, setState] = useState<SessionState>('loading')

  // Answer tracking
  const [selectedAnswer, setSelectedAnswer] = useState<string | undefined>()
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null)
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now())
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now())

  // Stats
  const [correctCount, setCorrectCount] = useState(0)
  const [incorrectCount, setIncorrectCount] = useState(0)
  const [topicBreakdown, setTopicBreakdown] = useState<Map<string, { correct: number; total: number }>>(new Map())

  // Load session data
  useEffect(() => {
    async function loadSession() {
      const resolvedParams = await params
      setSessionId(resolvedParams.sessionId)

      const sessionData = await getSession(resolvedParams.sessionId)
      if (!sessionData) {
        router.push('/practice')
        return
      }

      // If session is already completed, show summary
      if (sessionData.completed) {
        setSession(sessionData)
        setCorrectCount(sessionData.correct_count)
        setIncorrectCount(sessionData.incorrect_count)
        setState('completed')
        return
      }

      setSession(sessionData)

      // Extract items from session items
      const sessionItems = sessionData.items
        .map(si => si.item as ItemWithPassage)
        .filter(Boolean)

      setItems(sessionItems)

      // Find first unanswered question
      const firstUnanswered = sessionData.items.findIndex(si => !si.answered)
      const startIndex = firstUnanswered >= 0 ? firstUnanswered : 0

      // Count already answered
      let correct = 0
      let incorrect = 0
      sessionData.items.forEach(si => {
        if (si.answered) {
          // We don't have the result here, so we'll use session counts
        }
      })
      setCorrectCount(sessionData.correct_count)
      setIncorrectCount(sessionData.incorrect_count)

      setCurrentIndex(startIndex)
      setSessionStartTime(Date.now())
      setQuestionStartTime(Date.now())
      setState('answering')
    }

    loadSession()
  }, [params, router])

  const currentItem = items[currentIndex]

  // Handle answer selection
  const handleSelectAnswer = useCallback((answer: string) => {
    if (state !== 'answering') return
    setSelectedAnswer(answer)
  }, [state])

  // Submit answer
  const handleSubmitAnswer = useCallback(async () => {
    if (!selectedAnswer || !currentItem || !sessionId) return

    // Show checking state while API call is in progress
    setState('checking')

    const secondsSpent = Math.round((Date.now() - questionStartTime) / 1000)

    try {
      const result = await recordAttempt({
        itemId: currentItem.id,
        sessionId,
        response: selectedAnswer,
        secondsSpent,
        rating: 'good', // Will be updated after confidence rating
      })

      setAttemptResult(result)

      // Update stats
      if (result.isCorrect) {
        setCorrectCount(prev => prev + 1)
      } else {
        setIncorrectCount(prev => prev + 1)
      }

      // Update topic breakdown
      setTopicBreakdown(prev => {
        const newMap = new Map(prev)
        const topic = currentItem.topic
        const existing = newMap.get(topic) || { correct: 0, total: 0 }
        newMap.set(topic, {
          correct: existing.correct + (result.isCorrect ? 1 : 0),
          total: existing.total + 1,
        })
        return newMap
      })

      // Now show the result
      setState('rating')
    } catch (error) {
      console.error('Failed to record attempt:', error)
      setState('answering')
    }
  }, [selectedAnswer, currentItem, sessionId, questionStartTime])

  // Handle confidence rating
  const handleConfidenceRating = useCallback(async (rating: FSRSRating) => {
    if (!currentItem || !sessionId) return

    // Record the rating (the attempt was already recorded, this updates FSRS)
    // In a real implementation, you might want to update the attempt's rating
    // For now, we move to next question

    // Check if this was the last question
    if (currentIndex >= items.length - 1) {
      // Complete the session
      const totalSeconds = Math.round((Date.now() - sessionStartTime) / 1000)
      await completeSession(sessionId, {
        correctCount: correctCount,
        incorrectCount: incorrectCount,
        totalSeconds,
        actualNew: session?.target_new || 0,
        actualReview: session?.target_review || 0,
      })
      setState('completed')
    } else {
      // Move to next question
      setCurrentIndex(prev => prev + 1)
      setSelectedAnswer(undefined)
      setAttemptResult(null)
      setQuestionStartTime(Date.now())
      setState('answering')
    }
  }, [currentItem, sessionId, currentIndex, items.length, sessionStartTime, correctCount, incorrectCount, session])

  // Loading state
  if (state === 'loading') {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground">Loading your session...</p>
        </div>
      </div>
    )
  }

  // Completed state
  if (state === 'completed') {
    const topicArray = Array.from(topicBreakdown.entries()).map(([topic, stats]) => ({
      topic,
      correct: stats.correct,
      total: stats.total,
    }))

    return (
      <div className="py-8">
        <SessionSummary
          correctCount={correctCount}
          incorrectCount={incorrectCount}
          totalSeconds={Math.round((Date.now() - sessionStartTime) / 1000)}
          topicBreakdown={topicArray}
          onPlayAgain={() => router.push('/practice')}
        />
      </div>
    )
  }

  // No current item
  if (!currentItem) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">No questions available</p>
        <Button onClick={() => router.push('/practice')} className="mt-4">
          Back to Practice
        </Button>
      </div>
    )
  }

  return (
    <div className="py-6 space-y-6">
      {/* Progress bar */}
      <SessionProgress
        current={currentIndex + 1}
        total={items.length}
        correctCount={correctCount}
        incorrectCount={incorrectCount}
      />

      {/* Question */}
      <QuestionCard
        item={currentItem}
        selectedAnswer={selectedAnswer}
        correctAnswer={attemptResult?.correctAnswer}
        showResult={state === 'rating' && attemptResult !== null}
        onSelectAnswer={handleSelectAnswer}
        disabled={state !== 'answering'}
      />

      {/* Submit button (only in answering state) */}
      {state === 'answering' && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer}
            className="min-w-[200px] h-12"
          >
            Check Answer
          </Button>
        </div>
      )}

      {/* Checking indicator */}
      {state === 'checking' && (
        <div className="flex justify-center">
          <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <span className="text-blue-700 font-medium">Checking your answer...</span>
          </div>
        </div>
      )}

      {/* Feedback panel */}
      {state === 'rating' && attemptResult && (
        <FeedbackPanel
          isCorrect={attemptResult.isCorrect}
          correctAnswer={attemptResult.correctAnswer}
          rationale={attemptResult.rationale}
        />
      )}

      {/* Confidence rating */}
      {state === 'rating' && attemptResult && (
        <ConfidenceRating
          isCorrect={attemptResult.isCorrect}
          onRate={handleConfidenceRating}
        />
      )}
    </div>
  )
}
