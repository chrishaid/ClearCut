import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createTimedExam } from '@/actions/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, AlertCircle, Filter } from 'lucide-react'
import { ExamFilters } from '@/components/exam/ExamFilters'

const examOptions = [
  { minutes: 10 as const, questions: 10, description: 'Quick practice' },
  { minutes: 20 as const, questions: 20, description: 'Short exam' },
  { minutes: 30 as const, questions: 30, description: 'Standard length' },
  { minutes: 60 as const, questions: 60, description: 'Full practice test' },
]

// Topic display names
const topicLabels: Record<string, string> = {
  // Math topics
  linear_equations: 'Linear Equations',
  data_probability: 'Data & Probability',
  ratios_percents: 'Ratios & Percents',
  number_sense: 'Number Sense',
  geometry_measurement: 'Geometry & Measurement',
  word_problems: 'Word Problems',
  geometry: 'Geometry',
  fractions_decimals: 'Fractions & Decimals',
  // Reading topics
  inference: 'Inference',
  author_craft: 'Author\'s Craft',
  main_idea: 'Main Idea',
  vocab_context: 'Vocabulary in Context',
  supporting_details: 'Supporting Details',
  structure_evidence: 'Text Structure & Evidence',
  compare_contrast: 'Compare & Contrast',
}

export default async function ExamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get available topics from the database
  const { data: items } = await supabase
    .from('items')
    .select('subject, topic')
    .eq('status', 'active')

  const mathTopics = [...new Set(items?.filter(i => i.subject === 'math').map(i => i.topic) || [])]
  const readingTopics = [...new Set(items?.filter(i => i.subject === 'reading').map(i => i.topic) || [])]

  async function startExam(formData: FormData) {
    'use server'
    const minutes = parseInt(formData.get('minutes') as string) as 10 | 20 | 30 | 60
    const subject = formData.get('subject') as 'all' | 'math' | 'reading' | null
    const topicsRaw = formData.get('topics') as string | null
    const topics = topicsRaw ? topicsRaw.split(',').filter(Boolean) : undefined

    const { session } = await createTimedExam(minutes, {
      subject: subject === 'all' ? undefined : subject || undefined,
      topics: topics?.length ? topics : undefined,
    })
    redirect(`/exam/${session.id}`)
  }

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Timed Practice Exam</h1>
        <p className="text-muted-foreground">
          Simulate real test conditions with a timed practice exam
        </p>
      </div>

      {/* Filter Section */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Exam Options
          </CardTitle>
          <CardDescription>
            Filter by subject or specific topics (optional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExamFilters
            mathTopics={mathTopics}
            readingTopics={readingTopics}
            topicLabels={topicLabels}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {examOptions.map((option) => (
          <Card key={option.minutes} className="hover:border-blue-300 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{option.minutes} Minutes</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    ~{option.questions}
                  </div>
                  <div className="text-sm text-muted-foreground">questions</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form action={startExam} id={`exam-form-${option.minutes}`}>
                <input type="hidden" name="minutes" value={option.minutes} />
                <input type="hidden" name="subject" id={`subject-${option.minutes}`} />
                <input type="hidden" name="topics" id={`topics-${option.minutes}`} />
                <Button type="submit" className="w-full exam-start-btn" data-minutes={option.minutes}>
                  Start {option.minutes}-Minute Exam
                </Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Exam Mode</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700">
                <li>Timer counts down continuously</li>
                <li>No immediate feedback until the end</li>
                <li>Results shown after completion</li>
                <li>Does not affect your daily practice scheduling</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
