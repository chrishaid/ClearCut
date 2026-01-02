import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import {
  Flame,
  Target,
  BookOpen,
  Calculator,
  TrendingUp,
  Clock,
  ChevronRight,
  Calendar
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch streak data
  const { data: streak } = await supabase
    .from('streaks')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch today's session if exists
  const today = new Date().toISOString().split('T')[0]
  const { data: todaySession } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('session_date', today)
    .eq('session_type', 'daily')
    .single()

  // Fetch due items count
  const { count: dueCount } = await supabase
    .from('user_item_state')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .lte('due', new Date().toISOString())

  // Get recent stats (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentStats } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', user.id)
    .gte('stat_date', sevenDaysAgo.toISOString().split('T')[0])
    .order('stat_date', { ascending: false })

  // Calculate recent accuracy
  const totalCorrect = recentStats?.reduce((sum, s) => sum + s.items_correct, 0) || 0
  const totalStudied = recentStats?.reduce((sum, s) => sum + s.items_studied, 0) || 0
  const recentAccuracy = totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0

  // Display name
  const displayName = profile?.display_name || user.email?.split('@')[0] || 'Student'

  // Check if session was completed today
  const sessionCompletedToday = todaySession?.completed

  return (
    <div className="py-8 space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {displayName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {sessionCompletedToday
            ? "Great job completing today's session!"
            : "Ready to sharpen your skills today?"}
        </p>
      </div>

      {/* Main Action Card */}
      <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-0">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-100">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Today&apos;s Practice</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">
                {sessionCompletedToday ? (
                  <>Session Complete!</>
                ) : dueCount && dueCount > 0 ? (
                  <>{dueCount} items waiting for review</>
                ) : (
                  <>Start your daily practice</>
                )}
              </h2>
              <p className="text-blue-100">
                {sessionCompletedToday
                  ? `You got ${todaySession?.correct_count || 0} out of ${(todaySession?.correct_count || 0) + (todaySession?.incorrect_count || 0)} correct`
                  : '25 questions • ~20 minutes'}
              </p>
            </div>
            <Link href="/practice">
              <Button
                size="lg"
                variant="secondary"
                className="w-full md:w-auto h-14 px-8 text-lg font-semibold"
              >
                {sessionCompletedToday ? 'Review Session' : 'Start Practice'}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Streak Card */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streak?.current_streak || 0}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accuracy Card */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recentAccuracy}%</p>
                <p className="text-sm text-muted-foreground">7-day Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Studied Card */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudied}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Best Streak Card */}
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{streak?.longest_streak || 0}</p>
                <p className="text-sm text-muted-foreground">Best Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Subject Focus */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Subject Focus</CardTitle>
            <CardDescription>Your recent performance by subject</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Math</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {recentStats?.reduce((sum, s) => sum + s.math_correct, 0) || 0}/
                  {recentStats?.reduce((sum, s) => sum + s.math_total, 0) || 0}
                </span>
              </div>
              <Progress
                value={
                  recentStats && recentStats.reduce((sum, s) => sum + s.math_total, 0) > 0
                    ? (recentStats.reduce((sum, s) => sum + s.math_correct, 0) /
                        recentStats.reduce((sum, s) => sum + s.math_total, 0)) * 100
                    : 0
                }
                className="h-2"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-green-600" />
                  <span className="font-medium">Reading</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {recentStats?.reduce((sum, s) => sum + s.reading_correct, 0) || 0}/
                  {recentStats?.reduce((sum, s) => sum + s.reading_total, 0) || 0}
                </span>
              </div>
              <Progress
                value={
                  recentStats && recentStats.reduce((sum, s) => sum + s.reading_total, 0) > 0
                    ? (recentStats.reduce((sum, s) => sum + s.reading_correct, 0) /
                        recentStats.reduce((sum, s) => sum + s.reading_total, 0)) * 100
                    : 0
                }
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Jump into practice</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/exam" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <Clock className="mr-3 h-5 w-5 text-orange-600" />
                Take a Timed Practice Exam
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
            <Link href="/progress" className="block">
              <Button variant="outline" className="w-full justify-start h-12">
                <TrendingUp className="mr-3 h-5 w-5 text-blue-600" />
                View Detailed Progress
                <ChevronRight className="ml-auto h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
