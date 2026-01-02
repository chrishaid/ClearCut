'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Flag, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ItemWithPassage } from '@/types/database'

interface ExamReviewProps {
  items: ItemWithPassage[]
  answers: (string | null)[]
  flagged: Set<number>
  onNavigate: (index: number) => void
  onSubmit: () => void
  onBack: () => void
}

export function ExamReview({
  items,
  answers,
  flagged,
  onNavigate,
  onSubmit,
  onBack,
}: ExamReviewProps) {
  const answeredCount = answers.filter(a => a !== null).length
  const unansweredCount = items.length - answeredCount

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Review Your Answers</CardTitle>
          <CardDescription>
            Check your answers before submitting the exam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{answeredCount}</div>
              <div className="text-sm text-green-600">Answered</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-700">{unansweredCount}</div>
              <div className="text-sm text-gray-600">Unanswered</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="text-2xl font-bold text-amber-700">{flagged.size}</div>
              <div className="text-sm text-amber-600">Flagged</div>
            </div>
          </div>

          {/* Warning if unanswered */}
          {unansweredCount > 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">You have unanswered questions</p>
                <p>Unanswered questions will be marked incorrect. Consider reviewing before submitting.</p>
              </div>
            </div>
          )}

          {/* Question list */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {items.map((item, index) => (
              <button
                key={item.id}
                onClick={() => onNavigate(index)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                  answers[index] !== null
                    ? 'bg-green-50 hover:bg-green-100'
                    : 'bg-gray-50 hover:bg-gray-100'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                    answers[index] !== null
                      ? 'bg-green-200 text-green-700'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">
                    {item.stem.length > 60 ? item.stem.slice(0, 60) + '...' : item.stem}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {item.subject} • {item.topic.replace(/_/g, ' ')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {flagged.has(index) && (
                    <Flag className="h-4 w-4 text-amber-500 fill-amber-500" />
                  )}
                  {answers[index] !== null ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t">
            <Button variant="outline" onClick={onBack} className="flex-1 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Continue Exam
            </Button>
            <Button
              onClick={onSubmit}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Submit Exam
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
