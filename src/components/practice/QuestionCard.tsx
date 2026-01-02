'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calculator, BookOpen } from 'lucide-react'
import { ChoiceList } from './ChoiceList'
import { PassageDisplay } from './PassageDisplay'
import type { ItemWithPassage } from '@/types/database'

interface QuestionCardProps {
  item: ItemWithPassage
  selectedAnswer?: string
  correctAnswer?: string
  showResult: boolean
  onSelectAnswer: (answer: string) => void
  disabled: boolean
}

export function QuestionCard({
  item,
  selectedAnswer,
  correctAnswer,
  showResult,
  onSelectAnswer,
  disabled,
}: QuestionCardProps) {
  const isMath = item.subject === 'math'
  const hasPassage = item.passage !== null

  // Parse choices from JSON or array
  const choices = Array.isArray(item.choices)
    ? item.choices
    : typeof item.choices === 'object' && item.choices !== null
    ? Object.values(item.choices)
    : []

  return (
    <div className={hasPassage ? 'grid lg:grid-cols-2 gap-6' : ''}>
      {/* Passage display for reading questions */}
      {hasPassage && item.passage && (
        <div className="lg:sticky lg:top-4 lg:self-start">
          <PassageDisplay passage={item.passage} />
        </div>
      )}

      {/* Question content */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {isMath ? (
                <Badge variant="secondary" className="gap-1">
                  <Calculator className="h-3 w-3" />
                  Math
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800">
                  <BookOpen className="h-3 w-3" />
                  Reading
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {item.topic.replace(/_/g, ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Question stem */}
            <div className="text-lg leading-relaxed">
              {item.stem.split('**').map((part, index) =>
                index % 2 === 1 ? (
                  <strong key={index}>{part}</strong>
                ) : (
                  <span key={index}>{part}</span>
                )
              )}
            </div>

            {/* Answer choices */}
            <ChoiceList
              choices={choices as (string | { label?: string; text?: string })[]}
              selectedKey={selectedAnswer}
              correctKey={showResult ? correctAnswer : undefined}
              showResult={showResult}
              onSelect={onSelectAnswer}
              disabled={disabled}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
