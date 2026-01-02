import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  ChevronRight,
  UserPlus,
  Mail,
  Calendar,
} from 'lucide-react'

export default async function StudentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch linked students
  const { data: students } = await supabase
    .from('profiles')
    .select('id, display_name, email, study_start_date, created_at')
    .eq('parent_id', user.id)
    .eq('role', 'student')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Linked Students</h1>
          <p className="text-muted-foreground">
            Manage your linked student accounts
          </p>
        </div>
        <Button className="gap-2">
          <UserPlus className="h-4 w-4" />
          Link New Student
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Students</CardTitle>
          <CardDescription>
            Students linked to your parent account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!students || students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No students linked</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Link a student account to start tracking their progress
              </p>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Link a Student
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => (
                <Link
                  key={student.id}
                  href={`/parent/${student.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                      {(student.display_name || student.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-medium">
                        {student.display_name || student.email?.split('@')[0] || 'Student'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {student.email}
                        </span>
                        {student.study_start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Started {new Date(student.study_start_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">How to Link a Student</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-800">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Have your student create an account on Clearcut</li>
            <li>In their Settings page, they can add your email as their parent</li>
            <li>Once linked, you'll see their progress here</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  )
}
