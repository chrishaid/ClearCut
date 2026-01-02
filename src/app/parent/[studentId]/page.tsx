import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  TrendingUp,
  Target,
  Clock,
  Flame,
  Calendar,
  Calculator,
  BookOpen,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is a parent
  const { data: parentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (parentProfile?.role !== 'parent') {
    redirect('/dashboard')
  }

  // Fetch student profile (verify it's linked to this parent)
  const { data: student } = await supabase
    .from('profiles')
    .select(`
      id,
      display_name,
      email,
      study_start_date,
      daily_goal,
      created_at,
      streaks:streaks(current_streak, longest_streak, last_activity_date)
    `)
    .eq('id', studentId)
    .eq('parent_id', user.id)
    .single()

  if (!student) {
    notFound()
  }

  // Fetch topic stats
  const { data: topicStats } = await supabase
    .from('topic_stats')
    .select('*')
    .eq('user_id', studentId)
    .order('mastery_score', { ascending: true })

  // Fetch daily stats for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: dailyStats } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', studentId)
    .gte('stat_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('stat_date', { ascending: true })

  // Fetch recent sessions
  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', studentId)
    .eq('completed', true)
    .order('created_at', { ascending: false })
    .limit(10)

  // Calculate stats
  const totalStudied = dailyStats?.reduce((sum, s) => sum + s.items_studied, 0) || 0
  const totalCorrect = dailyStats?.reduce((sum, s) => sum + s.items_correct, 0) || 0
  const totalTime = dailyStats?.reduce((sum, s) => sum + s.total_seconds, 0) || 0
  const daysActive = dailyStats?.length || 0
  const overallAccuracy = totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0

  const streak = Array.isArray(student.streaks) && student.streaks[0]
    ? student.streaks[0]
    : { current_streak: 0, longest_streak: 0, last_activity_date: null }

  // Split topics by subject
  const mathTopics = topicStats?.filter(t => t.subject === 'math') || []
  const readingTopics = topicStats?.filter(t => t.subject === 'reading') || []

  // Calculate subject averages
  const mathAvg = mathTopics.length > 0
    ? Math.round(mathTopics.reduce((sum, t) => sum + (t.mastery_score || 0), 0) / mathTopics.length)
    : 0
  const readingAvg = readingTopics.length > 0
    ? Math.round(readingTopics.reduce((sum, t) => sum + (t.mastery_score || 0), 0) / readingTopics.length)
    : 0

  // Weak areas
  const weakAreas = topicStats
    ?.filter(t => t.total_attempts >= 5 && (t.mastery_score || 0) < 70)
    .slice(0, 5) || []

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/parent">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {student.display_name || student.email?.split('@')[0] || 'Student'}
          </h1>
          <p className="text-muted-foreground">{student.email}</p>
        </div>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <Flame className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">{streak.current_streak}</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold">{overallAccuracy}%</p>
            <p className="text-sm text-muted-foreground">Accuracy (30d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold">{totalStudied}</p>
            <p className="text-sm text-muted-foreground">Questions (30d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="text-2xl font-bold">{daysActive}</p>
            <p className="text-sm text-muted-foreground">Days Active (30d)</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-amber-600" />
            <p className="text-2xl font-bold">{formatTime(totalTime)}</p>
            <p className="text-sm text-muted-foreground">Study Time (30d)</p>
          </CardContent>
        </Card>
      </div>

      {/* Subject breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Math Progress
            </CardTitle>
            <CardDescription>Average mastery: {mathAvg}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mathTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No math topics studied yet
              </p>
            ) : (
              mathTopics.slice(0, 6).map((topic) => {
                const accuracy = topic.total_attempts > 0
                  ? Math.round((topic.total_correct / topic.total_attempts) * 100)
                  : 0
                return (
                  <div key={topic.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm capitalize">{topic.topic.replace(/_/g, ' ')}</span>
                      <span className="text-sm text-muted-foreground">{accuracy}%</span>
                    </div>
                    <Progress value={accuracy} className="h-2" />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-green-600" />
              Reading Progress
            </CardTitle>
            <CardDescription>Average mastery: {readingAvg}%</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {readingTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No reading topics studied yet
              </p>
            ) : (
              readingTopics.slice(0, 6).map((topic) => {
                const accuracy = topic.total_attempts > 0
                  ? Math.round((topic.total_correct / topic.total_attempts) * 100)
                  : 0
                return (
                  <div key={topic.id}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm capitalize">{topic.topic.replace(/_/g, ' ')}</span>
                      <span className="text-sm text-muted-foreground">{accuracy}%</span>
                    </div>
                    <Progress value={accuracy} className="h-2" />
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Areas needing attention */}
      {weakAreas.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertCircle className="h-5 w-5" />
              Areas Needing Attention
            </CardTitle>
            <CardDescription className="text-amber-700">
              Topics with mastery below 70% (minimum 5 attempts)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {weakAreas.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {topic.subject === 'math' ? (
                      <Calculator className="h-4 w-4 text-blue-600" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-green-600" />
                    )}
                    <span className="capitalize">{topic.topic.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="font-medium text-amber-700">
                    {Math.round(topic.mastery_score || 0)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity chart (simplified) */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity (Last 30 Days)</CardTitle>
          <CardDescription>Questions studied per day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-1 h-32">
            {/* Simple bar chart */}
            {Array.from({ length: 30 }).map((_, i) => {
              const date = new Date()
              date.setDate(date.getDate() - (29 - i))
              const dateStr = date.toISOString().split('T')[0]
              const dayStats = dailyStats?.find(s => s.stat_date === dateStr)
              const count = dayStats?.items_studied || 0
              const maxCount = Math.max(...(dailyStats?.map(s => s.items_studied) || [1]), 1)
              const height = count > 0 ? Math.max((count / maxCount) * 100, 5) : 0

              return (
                <div
                  key={i}
                  className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${height}%` }}
                  title={`${dateStr}: ${count} questions`}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </CardContent>
      </Card>

      {/* Recent sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>Last 10 completed practice sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {!recentSessions || recentSessions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No completed sessions yet
            </p>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((session) => {
                const total = session.correct_count + session.incorrect_count
                const accuracy = total > 0
                  ? Math.round((session.correct_count / total) * 100)
                  : 0

                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {accuracy >= 80 ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : accuracy >= 60 ? (
                        <Target className="h-5 w-5 text-blue-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-amber-500" />
                      )}
                      <div>
                        <p className="font-medium capitalize">{session.session_type} Session</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{accuracy}%</p>
                      <p className="text-xs text-muted-foreground">
                        {session.correct_count}/{total} correct
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
