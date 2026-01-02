'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Trophy,
  Target,
  Clock,
  Calculator,
  BookOpen,
  CheckCircle,
  XCircle,
  Home,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ItemWithPassage } from '@/types/database'

interface ExamResultsProps {
  items: ItemWithPassage[]
  answers: (string | null)[]
  totalSeconds: number
}

export function ExamResults({ items, answers, totalSeconds }: ExamResultsProps) {
  const router = useRouter()

  // Calculate results
  const results = items.map((item, index) => {
    const answer = answers[index]
    const isCorrect = answer === item.answer_key
    return { item, answer, isCorrect }
  })

  const correctCount = results.filter(r => r.isCorrect).length
  const incorrectCount = results.filter(r => !r.isCorrect).length
  const accuracy = items.length > 0 ? Math.round((correctCount / items.length) * 100) : 0

  // Calculate by subject
  const mathResults = results.filter(r => r.item.subject === 'math')
  const readingResults = results.filter(r => r.item.subject === 'reading')
  const mathCorrect = mathResults.filter(r => r.isCorrect).length
  const readingCorrect = readingResults.filter(r => r.isCorrect).length
  const mathAccuracy = mathResults.length > 0 ? Math.round((mathCorrect / mathResults.length) * 100) : 0
  const readingAccuracy = readingResults.length > 0 ? Math.round((readingCorrect / readingResults.length) * 100) : 0

  // Format time
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  // Performance message
  const getMessage = () => {
    if (accuracy >= 90) return { text: 'Outstanding!', color: 'text-green-600' }
    if (accuracy >= 80) return { text: 'Great job!', color: 'text-green-600' }
    if (accuracy >= 70) return { text: 'Good work!', color: 'text-blue-600' }
    if (accuracy >= 60) return { text: 'Keep practicing!', color: 'text-amber-600' }
    return { text: 'More practice needed', color: 'text-red-600' }
  }
  const message = getMessage()

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with score */}
      <Card className="text-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-white shadow-md flex items-center justify-center">
            <Trophy className="h-10 w-10 text-amber-500" />
          </div>
          <CardTitle className="text-3xl">Exam Complete!</CardTitle>
          <CardDescription className={cn('text-lg font-medium', message.color)}>
            {message.text}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-6xl font-bold text-blue-600 mb-2">{accuracy}%</div>
          <div className="text-muted-foreground">
            {correctCount} of {items.length} correct
          </div>
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-600">{correctCount}</div>
            <div className="text-sm text-muted-foreground">Correct</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold text-red-500">{incorrectCount}</div>
            <div className="text-sm text-muted-foreground">Incorrect</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold">{accuracy}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <div className="text-2xl font-bold">
              {minutes}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-sm text-muted-foreground">Time Used</div>
          </CardContent>
        </Card>
      </div>

      {/* Subject breakdown */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Math
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {mathCorrect} / {mathResults.length} correct
              </span>
              <span className="font-bold">{mathAccuracy}%</span>
            </div>
            <Progress value={mathAccuracy} className="h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Reading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {readingCorrect} / {readingResults.length} correct
              </span>
              <span className="font-bold">{readingAccuracy}%</span>
            </div>
            <Progress value={readingAccuracy} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Question review */}
      <Card>
        <CardHeader>
          <CardTitle>Question Review</CardTitle>
          <CardDescription>Review each question and your answer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={result.item.id}
              className={cn(
                'p-4 rounded-lg border',
                result.isCorrect
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    result.isCorrect ? 'bg-green-200' : 'bg-red-200'
                  )}
                >
                  {result.isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-700" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">Question {index + 1}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded capitalize">
                      {result.item.subject}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {result.item.topic.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{result.item.stem}</p>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Your answer: </span>
                    <span className={result.isCorrect ? 'text-green-700' : 'text-red-700'}>
                      {result.answer || 'Not answered'}
                    </span>
                    {!result.isCorrect && (
                      <>
                        <span className="text-muted-foreground"> • Correct: </span>
                        <span className="text-green-700">{result.item.answer_key}</span>
                      </>
                    )}
                  </div>
                  {!result.isCorrect && result.item.rationale && (
                    <p className="text-sm text-muted-foreground mt-2 italic">
                      {result.item.rationale}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard')}
          className="flex-1 gap-2"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Button>
        <Button
          onClick={() => router.push('/exam')}
          className="flex-1 gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Take Another Exam
        </Button>
      </div>
    </div>
  )
}
