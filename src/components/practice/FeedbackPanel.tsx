'use client'

import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, XCircle, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FeedbackPanelProps {
  isCorrect: boolean
  correctAnswer: string
  rationale: string
}

export function FeedbackPanel({ isCorrect, correctAnswer, rationale }: FeedbackPanelProps) {
  return (
    <Card
      className={cn(
        'border-2',
        isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
      )}
    >
      <CardContent className="p-4 space-y-4">
        {/* Result header */}
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-green-800 text-lg">Correct!</h3>
                <p className="text-sm text-green-700">Great job!</p>
              </div>
            </>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-red-800 text-lg">Not quite</h3>
                <p className="text-sm text-red-700">
                  The correct answer is <strong>{correctAnswer}</strong>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Explanation */}
        <div
          className={cn(
            'p-4 rounded-lg',
            isCorrect ? 'bg-green-100/50' : 'bg-red-100/50'
          )}
        >
          <div className="flex items-start gap-2">
            <Lightbulb
              className={cn(
                'h-5 w-5 flex-shrink-0 mt-0.5',
                isCorrect ? 'text-green-600' : 'text-red-600'
              )}
            />
            <div>
              <p
                className={cn(
                  'text-sm font-medium mb-1',
                  isCorrect ? 'text-green-800' : 'text-red-800'
                )}
              >
                Explanation
              </p>
              <p
                className={cn(
                  'text-sm leading-relaxed',
                  isCorrect ? 'text-green-700' : 'text-red-700'
                )}
              >
                {rationale}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
