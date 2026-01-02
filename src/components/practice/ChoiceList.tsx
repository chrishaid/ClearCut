'use client'

import { cn } from '@/lib/utils'
import { CheckCircle, XCircle } from 'lucide-react'

interface Choice {
  label?: string
  text?: string
}

interface ChoiceListProps {
  choices: (string | Choice)[]
  selectedKey?: string
  correctKey?: string
  showResult: boolean
  onSelect: (key: string) => void
  disabled: boolean
}

export function ChoiceList({
  choices,
  selectedKey,
  correctKey,
  showResult,
  onSelect,
  disabled,
}: ChoiceListProps) {
  // Normalize choices to consistent format
  const normalizedChoices = choices.map((choice, index) => {
    if (typeof choice === 'string') {
      // Handle format like "A. Answer text" or just "Answer text"
      const match = choice.match(/^([A-D])\.\s*(.*)$/)
      if (match) {
        return { label: match[1], text: match[2] }
      }
      // Assign letter based on index
      return { label: String.fromCharCode(65 + index), text: choice }
    }
    return {
      label: choice.label || String.fromCharCode(65 + index),
      text: choice.text || '',
    }
  })

  return (
    <div className="space-y-3">
      {normalizedChoices.map((choice) => {
        const isSelected = selectedKey === choice.label
        const isCorrect = correctKey === choice.label
        const showCorrectHighlight = showResult && isCorrect
        const showIncorrectHighlight = showResult && isSelected && !isCorrect

        return (
          <button
            key={choice.label}
            onClick={() => !disabled && onSelect(choice.label)}
            disabled={disabled}
            className={cn(
              'w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all',
              'hover:border-blue-300 hover:bg-blue-50/50',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
              'disabled:cursor-not-allowed',
              // Default state
              !isSelected && !showResult && 'border-gray-200 bg-white',
              // Selected but not submitted
              isSelected && !showResult && 'border-blue-500 bg-blue-50',
              // Correct answer highlight
              showCorrectHighlight && 'border-green-500 bg-green-50',
              // Incorrect selection highlight
              showIncorrectHighlight && 'border-red-500 bg-red-50',
              // Disabled styling
              disabled && !showResult && 'opacity-50'
            )}
          >
            {/* Choice letter badge */}
            <span
              className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm',
                !isSelected && !showResult && 'bg-gray-100 text-gray-600',
                isSelected && !showResult && 'bg-blue-500 text-white',
                showCorrectHighlight && 'bg-green-500 text-white',
                showIncorrectHighlight && 'bg-red-500 text-white'
              )}
            >
              {showCorrectHighlight ? (
                <CheckCircle className="h-5 w-5" />
              ) : showIncorrectHighlight ? (
                <XCircle className="h-5 w-5" />
              ) : (
                choice.label
              )}
            </span>

            {/* Choice text */}
            <span
              className={cn(
                'flex-1 pt-1 text-base',
                showCorrectHighlight && 'text-green-800 font-medium',
                showIncorrectHighlight && 'text-red-800'
              )}
            >
              {choice.text}
            </span>
          </button>
        )
      })}
    </div>
  )
}
