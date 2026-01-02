'use client'

import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle } from 'lucide-react'

interface SessionProgressProps {
  current: number
  total: number
  correctCount: number
  incorrectCount: number
}

export function SessionProgress({
  current,
  total,
  correctCount,
  incorrectCount,
}: SessionProgressProps) {
  const progressPercent = total > 0 ? ((current - 1) / total) * 100 : 0
  const answered = correctCount + incorrectCount

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          Question {current} of {total}
        </span>
        {answered > 0 && (
          <div className="flex items-center gap-3 text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              {correctCount}
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              {incorrectCount}
            </span>
          </div>
        )}
      </div>
      <Progress value={progressPercent} className="h-2" />
    </div>
  )
}
