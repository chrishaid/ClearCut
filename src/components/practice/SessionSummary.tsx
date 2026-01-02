'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import {
  CheckCircle,
  XCircle,
  Clock,
  Flame,
  TrendingUp,
  Home,
  RefreshCw,
} from 'lucide-react'

interface SessionSummaryProps {
  correctCount: number
  incorrectCount: number
  totalSeconds: number
  streakCount?: number
  isNewStreak?: boolean
  topicBreakdown?: {
    topic: string
    correct: number
    total: number
  }[]
  onPlayAgain?: () => void
}

export function SessionSummary({
  correctCount,
  incorrectCount,
  totalSeconds,
  streakCount = 0,
  isNewStreak = false,
  topicBreakdown = [],
  onPlayAgain,
}: SessionSummaryProps) {
  const total = correctCount + incorrectCount
  const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0

  // Format time
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`

  // Get message based on accuracy
  const getMessage = () => {
    if (accuracy >= 90) return "Outstanding! You're crushing it!"
    if (accuracy >= 80) return 'Great job! Keep up the good work!'
    if (accuracy >= 70) return 'Nice work! You\'re making progress!'
    if (accuracy >= 60) return 'Good effort! Keep practicing!'
    return 'Keep going! Practice makes perfect!'
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Main summary card */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Session Complete!</CardTitle>
          <p className="text-blue-100">{getMessage()}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Accuracy display */}
          <div className="text-center">
            <div className="text-6xl font-bold mb-2">{accuracy}%</div>
            <div className="flex items-center justify-center gap-4 text-blue-100">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-5 w-5 text-green-300" />
                {correctCount} correct
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-5 w-5 text-red-300" />
                {incorrectCount} incorrect
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-blue-200" />
              <div className="text-2xl font-semibold">{timeDisplay}</div>
              <div className="text-sm text-blue-200">Time</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Flame className="h-6 w-6 mx-auto mb-2 text-orange-300" />
              <div className="text-2xl font-semibold">{streakCount}</div>
              <div className="text-sm text-blue-200">
                {isNewStreak ? 'Day streak!' : 'Day streak'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topic breakdown */}
      {topicBreakdown.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Topics Practiced
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topicBreakdown.map((topic) => {
              const topicAccuracy =
                topic.total > 0
                  ? Math.round((topic.correct / topic.total) * 100)
                  : 0
              return (
                <div key={topic.topic} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">
                      {topic.topic.replace(/_/g, ' ')}
                    </span>
                    <span className="text-muted-foreground">
                      {topic.correct}/{topic.total}
                    </span>
                  </div>
                  <Progress value={topicAccuracy} className="h-2" />
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/dashboard" className="flex-1">
          <Button variant="outline" className="w-full h-12 gap-2">
            <Home className="h-5 w-5" />
            Back to Dashboard
          </Button>
        </Link>
        {onPlayAgain && (
          <Button onClick={onPlayAgain} className="flex-1 h-12 gap-2">
            <RefreshCw className="h-5 w-5" />
            Practice Again
          </Button>
        )}
      </div>
    </div>
  )
}
