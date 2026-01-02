import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { createDailySession } from '@/actions/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Play, CheckCircle, Clock, Target } from 'lucide-react'

export default async function PracticePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const today = new Date().toISOString().split('T')[0]

  // Check for existing session today
  const { data: existingSession } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('session_date', today)
    .eq('session_type', 'daily')
    .single()

  // Get due items count
  const { count: dueCount } = await supabase
    .from('user_item_state')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .lte('due', new Date().toISOString())

  const hasCompletedToday = existingSession?.completed

  if (hasCompletedToday) {
    return (
      <div className="py-8 max-w-2xl mx-auto">
        <Card className="bg-green-50 border-green-200">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              Today&apos;s Session Complete!
            </CardTitle>
            <CardDescription className="text-green-700">
              Great job! You completed {existingSession.correct_count + existingSession.incorrect_count} questions today.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {existingSession.correct_count}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-red-500">
                  {existingSession.incorrect_count}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="p-4 bg-white rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(
                    (existingSession.correct_count /
                      (existingSession.correct_count + existingSession.incorrect_count)) *
                      100
                  )}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <p className="text-muted-foreground">
                Come back tomorrow for your next session!
              </p>
              <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Create or get session
  let sessionId = existingSession?.id

  async function startSession() {
    'use server'
    const { session } = await createDailySession()
    redirect(`/practice/${session.id}`)
  }

  return (
    <div className="py-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Target className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Daily Practice</CardTitle>
          <CardDescription>
            Build your HSAT skills with today&apos;s personalized session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Session info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">25</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">~20</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
          </div>

          {dueCount && dueCount > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-amber-800">
                {dueCount} items due for review
              </span>
            </div>
          )}

          {/* Start button */}
          <form action={startSession}>
            <Button type="submit" size="lg" className="w-full h-14 text-lg gap-2">
              <Play className="h-5 w-5" />
              {existingSession ? 'Continue Session' : 'Start Session'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Your progress is saved automatically
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
