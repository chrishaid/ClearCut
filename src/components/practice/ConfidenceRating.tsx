'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FSRSRating } from '@/types/database'
import {
  CORRECT_CONFIDENCE_OPTIONS,
  INCORRECT_CONFIDENCE_OPTIONS,
} from '@/lib/fsrs/types'

interface ConfidenceRatingProps {
  isCorrect: boolean
  onRate: (rating: FSRSRating) => void
}

export function ConfidenceRating({ isCorrect, onRate }: ConfidenceRatingProps) {
  const options = isCorrect
    ? CORRECT_CONFIDENCE_OPTIONS
    : INCORRECT_CONFIDENCE_OPTIONS

  return (
    <Card className="border-2 border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-blue-800">
          {isCorrect ? 'How did that feel?' : 'Did you know this one?'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="flex flex-wrap gap-3">
          {options.map((option) => (
            <Button
              key={option.rating}
              variant="outline"
              onClick={() => onRate(option.rating)}
              className="flex-1 min-w-[120px] h-auto py-3 flex flex-col items-center gap-1 hover:bg-blue-100 hover:border-blue-400"
            >
              <span className="font-semibold">{option.label}</span>
              <span className="text-xs text-muted-foreground font-normal">
                {option.description}
              </span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
