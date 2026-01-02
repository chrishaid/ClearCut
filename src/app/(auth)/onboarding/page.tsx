'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { setUserRole } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, Users, Loader2, ArrowRight } from 'lucide-react'

type Role = 'student' | 'parent'

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    if (!selectedRole) return

    setIsSubmitting(true)
    setError(null)

    const result = await setUserRole(selectedRole)

    if (result.error) {
      setError(result.error)
      setIsSubmitting(false)
    } else {
      // Redirect based on role
      router.push(selectedRole === 'parent' ? '/parent' : '/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Clearcut!</CardTitle>
          <CardDescription className="text-base">
            Tell us who you are so we can personalize your experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            {/* Student option */}
            <button
              onClick={() => setSelectedRole('student')}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                selectedRole === 'student'
                  ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  selectedRole === 'student' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600'
                }`}>
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">I'm a Student</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    I'm preparing for the HSAT and want to practice math and reading
                  </p>
                </div>
              </div>
            </button>

            {/* Parent option */}
            <button
              onClick={() => setSelectedRole('parent')}
              className={`p-6 rounded-xl border-2 text-left transition-all ${
                selectedRole === 'parent'
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  selectedRole === 'parent' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600'
                }`}>
                  <Users className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">I'm a Parent</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    I want to track my child's progress and support their HSAT prep
                  </p>
                </div>
              </div>
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedRole || isSubmitting}
            className="w-full h-12 text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            {selectedRole === 'parent'
              ? "You'll be able to link your student's account on the next screen"
              : "You can link a parent account later from settings"
            }
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
