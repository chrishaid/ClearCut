'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'

interface ExamNavigationProps {
  currentIndex: number
  total: number
  answers: (string | null)[]
  flagged: Set<number>
  onNavigate: (index: number) => void
  onPrevious: () => void
  onNext: () => void
  onFlag: () => void
  onSubmit: () => void
}

export function ExamNavigation({
  currentIndex,
  total,
  answers,
  flagged,
  onNavigate,
  onPrevious,
  onNext,
  onFlag,
  onSubmit,
}: ExamNavigationProps) {
  const unanswered = answers.filter(a => a === null).length
  const isFlagged = flagged.has(currentIndex)

  return (
    <div className="space-y-4">
      {/* Question dots */}
      <div className="flex flex-wrap gap-2 justify-center">
        {answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => onNavigate(index)}
            className={cn(
              'w-8 h-8 rounded-full text-sm font-medium transition-all relative',
              index === currentIndex
                ? 'bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2'
                : answer !== null
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {index + 1}
            {flagged.has(index) && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Navigation controls */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentIndex === 0}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <Button
          variant={isFlagged ? 'secondary' : 'outline'}
          onClick={onFlag}
          className="gap-2"
        >
          <Flag className={cn('h-4 w-4', isFlagged && 'fill-amber-500 text-amber-500')} />
          {isFlagged ? 'Flagged' : 'Flag'}
        </Button>

        {currentIndex < total - 1 ? (
          <Button onClick={onNext} className="gap-2">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={onSubmit} variant="default" className="gap-2 bg-green-600 hover:bg-green-700">
            Submit Exam
          </Button>
        )}
      </div>

      {/* Summary */}
      <div className="text-center text-sm text-muted-foreground">
        {unanswered === 0 ? (
          <span className="text-green-600">All questions answered</span>
        ) : (
          <span>{unanswered} question{unanswered !== 1 ? 's' : ''} unanswered</span>
        )}
        {flagged.size > 0 && (
          <span className="ml-2 text-amber-600">• {flagged.size} flagged</span>
        )}
      </div>
    </div>
  )
}
