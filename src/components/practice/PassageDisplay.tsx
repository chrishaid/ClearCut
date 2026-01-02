'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, FileText } from 'lucide-react'
import type { Passage } from '@/types/database'

interface PassageDisplayProps {
  passage: Passage
}

export function PassageDisplay({ passage }: PassageDisplayProps) {
  const isLiterary = passage.genre === 'literary'

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-3 border-b bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isLiterary ? (
              <BookOpen className="h-4 w-4 text-purple-600" />
            ) : (
              <FileText className="h-4 w-4 text-blue-600" />
            )}
            <span className="font-medium text-sm">
              {passage.title || 'Reading Passage'}
            </span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {isLiterary ? 'Literary' : 'Informational'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-y-auto max-h-[60vh]">
        <div className="prose prose-sm max-w-none">
          {passage.text.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 leading-relaxed text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
