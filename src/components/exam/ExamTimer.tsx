'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExamTimerProps {
  totalSeconds: number
  onTimeUp: () => void
  isPaused?: boolean
}

export function ExamTimer({ totalSeconds, onTimeUp, isPaused = false }: ExamTimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPaused, onTimeUp])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60

  const isLow = remaining <= 60 // Last minute
  const isCritical = remaining <= 30 // Last 30 seconds

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-bold transition-colors',
        isCritical
          ? 'bg-red-100 text-red-700 animate-pulse'
          : isLow
          ? 'bg-amber-100 text-amber-700'
          : 'bg-blue-100 text-blue-700'
      )}
    >
      {isCritical ? (
        <AlertTriangle className="h-5 w-5" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span>
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  )
}
