import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { User, Calendar, Target, Mail } from 'lucide-react'
import { PendingLinkRequests } from '@/components/settings/PendingLinkRequests'

export default async function SettingsPage() {
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

  async function updateProfile(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const displayName = formData.get('displayName') as string
    const studyStartDate = formData.get('studyStartDate') as string
    const dailyGoal = parseInt(formData.get('dailyGoal') as string) || 25

    await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        study_start_date: studyStartDate || null,
        daily_goal: dailyGoal,
      })
      .eq('id', user.id)

    redirect('/settings?saved=true')
  }

  return (
    <div className="py-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      {/* Pending Link Requests (only shown if there are any) */}
      {profile?.role === 'student' && <PendingLinkRequests />}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
          <CardDescription>
            Your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email}</span>
                <Badge variant="secondary" className="text-xs">Verified</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={profile?.display_name || ''}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="studyStartDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Study Start Date
              </Label>
              <Input
                id="studyStartDate"
                name="studyStartDate"
                type="date"
                defaultValue={profile?.study_start_date || ''}
              />
              <p className="text-xs text-muted-foreground">
                Used to calculate your week number and schedule topics appropriately
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dailyGoal" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Daily Goal (questions)
              </Label>
              <Input
                id="dailyGoal"
                name="dailyGoal"
                type="number"
                min={10}
                max={50}
                defaultValue={profile?.daily_goal || 25}
              />
              <p className="text-xs text-muted-foreground">
                Target number of questions per daily session (10-50)
              </p>
            </div>

            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Account information and actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Account Type</p>
              <p className="text-sm text-muted-foreground capitalize">
                {profile?.role || 'Student'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Member Since</p>
              <p className="text-sm text-muted-foreground">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Need to change your email or delete your account? Contact support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
