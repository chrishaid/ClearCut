import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  Target,
  BookOpen,
  Calculator,
  Calendar,
  Award,
} from 'lucide-react'

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch topic stats
  const { data: topicStats } = await supabase
    .from('topic_stats')
    .select('*')
    .eq('user_id', user.id)
    .order('mastery_score', { ascending: true })

  // Fetch daily stats for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: dailyStats } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', user.id)
    .gte('stat_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('stat_date', { ascending: true })

  // Calculate overall stats
  const totalStudied = dailyStats?.reduce((sum, s) => sum + s.items_studied, 0) || 0
  const totalCorrect = dailyStats?.reduce((sum, s) => sum + s.items_correct, 0) || 0
  const totalTime = dailyStats?.reduce((sum, s) => sum + s.total_seconds, 0) || 0
  const overallAccuracy = totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0

  // Split topics by subject
  const mathTopics = topicStats?.filter(t => t.subject === 'math') || []
  const readingTopics = topicStats?.filter(t => t.subject === 'reading') || []

  // Format time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Progress</h1>
        <p className="text-muted-foreground">
          Track your HSAT preparation journey
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudied}</p>
                <p className="text-sm text-muted-foreground">Items Studied</p>
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
                <p className="text-2xl font-bold">{overallAccuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{dailyStats?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Days Active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatTime(totalTime)}</p>
                <p className="text-sm text-muted-foreground">Time Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topic Mastery */}
      <Tabs defaultValue="math" className="space-y-4">
        <TabsList>
          <TabsTrigger value="math" className="gap-2">
            <Calculator className="h-4 w-4" />
            Math Topics
          </TabsTrigger>
          <TabsTrigger value="reading" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Reading Topics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="math">
          <Card>
            <CardHeader>
              <CardTitle>Math Topic Mastery</CardTitle>
              <CardDescription>
                Your performance across different math topics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mathTopics.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Start practicing to see your topic progress!
                </p>
              ) : (
                mathTopics.map((topic) => {
                  const accuracy =
                    topic.total_attempts > 0
                      ? Math.round((topic.total_correct / topic.total_attempts) * 100)
                      : 0
                  return (
                    <div key={topic.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">
                          {topic.topic.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {topic.total_correct}/{topic.total_attempts} ({accuracy}%)
                        </span>
                      </div>
                      <Progress value={accuracy} className="h-2" />
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reading">
          <Card>
            <CardHeader>
              <CardTitle>Reading Topic Mastery</CardTitle>
              <CardDescription>
                Your performance across different reading topics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {readingTopics.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Start practicing to see your topic progress!
                </p>
              ) : (
                readingTopics.map((topic) => {
                  const accuracy =
                    topic.total_attempts > 0
                      ? Math.round((topic.total_correct / topic.total_attempts) * 100)
                      : 0
                  return (
                    <div key={topic.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">
                          {topic.topic.replace(/_/g, ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {topic.total_correct}/{topic.total_attempts} ({accuracy}%)
                        </span>
                      </div>
                      <Progress value={accuracy} className="h-2" />
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Weak Areas */}
      {topicStats && topicStats.length > 0 && (
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">Focus Areas</CardTitle>
            <CardDescription className="text-amber-700">
              Topics that need more practice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topicStats
                .filter(t => t.total_attempts >= 3 && (t.mastery_score || 0) < 70)
                .slice(0, 5)
                .map((topic) => (
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
                      <span className="capitalize">
                        {topic.topic.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-amber-700">
                      {Math.round(topic.mastery_score || 0)}%
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
