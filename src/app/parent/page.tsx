import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  TrendingUp,
  Clock,
  Target,
  Flame,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import { LinkStudentDialog } from '@/components/parent/LinkStudentDialog'

export default async function ParentDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch linked students
  const { data: students } = await supabase
    .from('profiles')
    .select(`
      id,
      display_name,
      email,
      study_start_date,
      created_at,
      streaks:streaks(current_streak, longest_streak)
    `)
    .eq('parent_id', user.id)
    .eq('role', 'student')

  // Fetch stats for each student (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const studentStats = await Promise.all(
    (students || []).map(async (student) => {
      const { data: dailyStats } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('user_id', student.id)
        .gte('stat_date', sevenDaysAgo.toISOString().split('T')[0])
        .order('stat_date', { ascending: false })

      const totalStudied = dailyStats?.reduce((sum, s) => sum + s.items_studied, 0) || 0
      const totalCorrect = dailyStats?.reduce((sum, s) => sum + s.items_correct, 0) || 0
      const totalTime = dailyStats?.reduce((sum, s) => sum + s.total_seconds, 0) || 0
      const daysActive = dailyStats?.length || 0

      return {
        ...student,
        weeklyStats: {
          totalStudied,
          accuracy: totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0,
          totalTime,
          daysActive,
        },
      }
    })
  )

  // Calculate overall stats
  const totalStudents = studentStats.length
  const avgAccuracy = totalStudents > 0
    ? Math.round(studentStats.reduce((sum, s) => sum + s.weeklyStats.accuracy, 0) / totalStudents)
    : 0
  const totalQuestions = studentStats.reduce((sum, s) => sum + s.weeklyStats.totalStudied, 0)

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Parent Dashboard</h1>
        <p className="text-muted-foreground">
          Track your students' HSAT preparation progress
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgAccuracy}%</p>
                <p className="text-sm text-muted-foreground">Avg Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalQuestions}</p>
                <p className="text-sm text-muted-foreground">Questions (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatTime(studentStats.reduce((sum, s) => sum + s.weeklyStats.totalTime, 0))}
                </p>
                <p className="text-sm text-muted-foreground">Total Time (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Students</CardTitle>
              <CardDescription>Click on a student to view detailed analytics</CardDescription>
            </div>
            <LinkStudentDialog />
          </div>
        </CardHeader>
        <CardContent>
          {studentStats.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No students linked yet</p>
              <LinkStudentDialog
                trigger={
                  <Button variant="outline" className="gap-2">
                    Link a Student
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {studentStats.map((student) => {
                const streak = Array.isArray(student.streaks) && student.streaks[0]
                  ? student.streaks[0]
                  : { current_streak: 0, longest_streak: 0 }

                return (
                  <Link
                    key={student.id}
                    href={`/parent/${student.id}`}
                    className="block p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                          {(student.display_name || student.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium">
                            {student.display_name || student.email?.split('@')[0] || 'Student'}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3 text-orange-500" />
                              {streak.current_streak} day streak
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {student.weeklyStats.daysActive}/7 days active
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-medium">{student.weeklyStats.totalStudied}</p>
                          <p className="text-xs text-muted-foreground">Questions (7d)</p>
                        </div>
                        <div className="text-right w-20">
                          <div className="flex items-center justify-end gap-2 mb-1">
                            <span className="font-medium">{student.weeklyStats.accuracy}%</span>
                          </div>
                          <Progress value={student.weeklyStats.accuracy} className="h-1.5" />
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips for parents */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Tips for Supporting Your Student</CardTitle>
        </CardHeader>
        <CardContent className="text-purple-800">
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Encourage daily practice, even if just 15-20 minutes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Celebrate streaks and consistency over perfection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Check progress weekly rather than daily to reduce pressure</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span>Focus on topics with lower accuracy for targeted improvement</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
