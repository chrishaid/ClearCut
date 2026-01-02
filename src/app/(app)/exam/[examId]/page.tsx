'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/actions/session'
import { ExamTimer } from '@/components/exam/ExamTimer'
import { ExamNavigation } from '@/components/exam/ExamNavigation'
import { ExamReview } from '@/components/exam/ExamReview'
import { ExamResults } from '@/components/exam/ExamResults'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ItemWithPassage, SessionWithItems } from '@/types/database'

type ExamState = 'loading' | 'taking' | 'review' | 'results' | 'timeup'

export default function ExamSessionPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const router = useRouter()
  const [session, setSession] = useState<SessionWithItems | null>(null)
  const [items, setItems] = useState<ItemWithPassage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>([])
  const [flagged, setFlagged] = useState<Set<number>>(new Set())
  const [state, setState] = useState<ExamState>('loading')
  const [startTime, setStartTime] = useState<number>(Date.now())
  const [endTime, setEndTime] = useState<number | null>(null)
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(0)

  // Load session data
  useEffect(() => {
    async function loadSession() {
      const resolvedParams = await params
      const sessionData = await getSession(resolvedParams.examId)

      if (!sessionData) {
        router.push('/exam')
        return
      }

      // If session is already completed, show results
      if (sessionData.completed) {
        // For completed sessions, we'd need to load the answers from attempts
        // For now, redirect to exam selection
        router.push('/exam')
        return
      }

      setSession(sessionData)

      // Extract items from session items
      const sessionItems = sessionData.items
        .map(si => si.item as ItemWithPassage)
        .filter(Boolean)

      setItems(sessionItems)
      setAnswers(new Array(sessionItems.length).fill(null))
      setTimeLimitSeconds((sessionData.time_limit_minutes || 30) * 60)
      setStartTime(Date.now())
      setState('taking')
    }

    loadSession()
  }, [params, router])

  const currentItem = items[currentIndex]

  // Handle answer selection
  const handleSelectAnswer = useCallback((answer: string) => {
    setAnswers(prev => {
      const newAnswers = [...prev]
      newAnswers[currentIndex] = answer
      return newAnswers
    })
  }, [currentIndex])

  // Navigation handlers
  const handleNavigate = useCallback((index: number) => {
    setCurrentIndex(index)
    if (state === 'review') {
      setState('taking')
    }
  }, [state])

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1)
    }
  }, [currentIndex])

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, items.length])

  const handleFlag = useCallback(() => {
    setFlagged(prev => {
      const newSet = new Set(prev)
      if (newSet.has(currentIndex)) {
        newSet.delete(currentIndex)
      } else {
        newSet.add(currentIndex)
      }
      return newSet
    })
  }, [currentIndex])

  const handleReview = useCallback(() => {
    setState('review')
  }, [])

  const handleSubmit = useCallback(() => {
    setEndTime(Date.now())
    setState('results')
  }, [])

  const handleTimeUp = useCallback(() => {
    setEndTime(Date.now())
    setState('timeup')
  }, [])

  const handleTimeUpSubmit = useCallback(() => {
    setState('results')
  }, [])

  // Loading state
  if (state === 'loading') {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="text-muted-foreground">Loading your exam...</p>
        </div>
      </div>
    )
  }

  // Time up state
  if (state === 'timeup') {
    return (
      <div className="py-8 max-w-md mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Time's Up!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Your exam time has expired. Your answers will be submitted now.
            </p>
            <p className="text-sm text-muted-foreground">
              {answers.filter(a => a !== null).length} of {items.length} questions answered
            </p>
            <Button onClick={handleTimeUpSubmit} className="w-full">
              View Results
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Review state
  if (state === 'review') {
    return (
      <div className="py-8">
        <ExamReview
          items={items}
          answers={answers}
          flagged={flagged}
          onNavigate={handleNavigate}
          onSubmit={handleSubmit}
          onBack={() => setState('taking')}
        />
      </div>
    )
  }

  // Results state
  if (state === 'results') {
    const totalSeconds = endTime ? Math.round((endTime - startTime) / 1000) : 0
    return (
      <div className="py-8">
        <ExamResults
          items={items}
          answers={answers}
          totalSeconds={totalSeconds}
        />
      </div>
    )
  }

  // Taking exam state
  if (!currentItem) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">No questions available</p>
        <Button onClick={() => router.push('/exam')} className="mt-4">
          Back to Exam Selection
        </Button>
      </div>
    )
  }

  const selectedAnswer = answers[currentIndex]

  return (
    <div className="py-6 space-y-6">
      {/* Timer and progress */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Question {currentIndex + 1} of {items.length}
        </div>
        <ExamTimer
          totalSeconds={timeLimitSeconds}
          onTimeUp={handleTimeUp}
        />
      </div>

      {/* Passage (if reading question) */}
      {currentItem.passage && (
        <Card className="bg-gray-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              {currentItem.passage.title || 'Reading Passage'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none max-h-48 overflow-y-auto">
              {currentItem.passage.text.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded capitalize">
              {currentItem.subject}
            </span>
            <span className="text-xs text-muted-foreground capitalize">
              {currentItem.topic.replace(/_/g, ' ')}
            </span>
          </div>
          <CardTitle className="text-lg font-normal leading-relaxed">
            {currentItem.stem}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentItem.choices && (
            <div className="space-y-2">
              {currentItem.choices.map((choice, index) => {
                const letter = String.fromCharCode(65 + index) // A, B, C, D
                const isSelected = selectedAnswer === letter

                return (
                  <button
                    key={letter}
                    onClick={() => handleSelectAnswer(letter)}
                    className={cn(
                      'w-full flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all',
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <span
                      className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium',
                        isSelected
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      )}
                    >
                      {letter}
                    </span>
                    <span className="pt-1">{choice}</span>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <ExamNavigation
        currentIndex={currentIndex}
        total={items.length}
        answers={answers}
        flagged={flagged}
        onNavigate={handleNavigate}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onFlag={handleFlag}
        onSubmit={handleReview}
      />
    </div>
  )
}
