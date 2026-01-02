'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calculator, BookOpen, X } from 'lucide-react'

interface ExamFiltersProps {
  mathTopics: string[]
  readingTopics: string[]
  topicLabels: Record<string, string>
}

export function ExamFilters({ mathTopics, readingTopics, topicLabels }: ExamFiltersProps) {
  const [subject, setSubject] = useState<'all' | 'math' | 'reading'>('all')
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])

  // Update hidden form fields when filters change
  useEffect(() => {
    // Update all exam form hidden fields
    const subjectInputs = document.querySelectorAll<HTMLInputElement>('input[name="subject"]')
    const topicInputs = document.querySelectorAll<HTMLInputElement>('input[name="topics"]')

    subjectInputs.forEach(input => {
      input.value = subject
    })

    topicInputs.forEach(input => {
      input.value = selectedTopics.join(',')
    })
  }, [subject, selectedTopics])

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic)
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    )
  }

  const clearFilters = () => {
    setSubject('all')
    setSelectedTopics([])
  }

  const visibleTopics = subject === 'all'
    ? [...mathTopics, ...readingTopics]
    : subject === 'math'
      ? mathTopics
      : readingTopics

  const hasFilters = subject !== 'all' || selectedTopics.length > 0

  return (
    <div className="space-y-4">
      {/* Subject Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Subject</label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={subject === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSubject('all')
              setSelectedTopics([])
            }}
          >
            All Subjects
          </Button>
          <Button
            type="button"
            variant={subject === 'math' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSubject('math')
              setSelectedTopics(prev => prev.filter(t => mathTopics.includes(t)))
            }}
            className="gap-1"
          >
            <Calculator className="h-4 w-4" />
            Math Only
          </Button>
          <Button
            type="button"
            variant={subject === 'reading' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSubject('reading')
              setSelectedTopics(prev => prev.filter(t => readingTopics.includes(t)))
            }}
            className="gap-1"
          >
            <BookOpen className="h-4 w-4" />
            Reading Only
          </Button>
        </div>
      </div>

      {/* Topic Filter */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Topics (optional)</label>
          {hasFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs text-muted-foreground"
            >
              <X className="h-3 w-3 mr-1" />
              Clear all
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleTopics.map(topic => {
            const isSelected = selectedTopics.includes(topic)
            const isMath = mathTopics.includes(topic)
            return (
              <Badge
                key={topic}
                variant={isSelected ? 'default' : 'outline'}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? isMath
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                    : 'hover:bg-muted'
                }`}
                onClick={() => toggleTopic(topic)}
              >
                {topicLabels[topic] || topic}
              </Badge>
            )
          })}
        </div>
        {selectedTopics.length === 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            Click topics to focus on specific areas, or leave empty for a balanced exam.
          </p>
        )}
      </div>

      {/* Active Filter Summary */}
      {hasFilters && (
        <div className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2">
          <strong>Active filters:</strong>{' '}
          {subject !== 'all' && <span className="capitalize">{subject} only</span>}
          {subject !== 'all' && selectedTopics.length > 0 && ' • '}
          {selectedTopics.length > 0 && (
            <span>{selectedTopics.length} topic{selectedTopics.length > 1 ? 's' : ''} selected</span>
          )}
        </div>
      )}
    </div>
  )
}
