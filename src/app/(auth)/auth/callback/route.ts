import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const next = searchParams.get('next') ?? '/dashboard'

  // Determine the base URL for redirects
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const forwardedHost = request.headers.get('x-forwarded-host')
  const baseUrl = siteUrl || (forwardedHost ? `https://${forwardedHost}` : origin)

  // If there's an error from Supabase (e.g., expired link)
  if (error) {
    console.error('Auth callback error:', error, searchParams.get('error_description'))
    return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_error`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Code exchange error:', exchangeError)
      return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_error`)
    }

    // Check if user has completed onboarding (has a role set)
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Redirect to onboarding if no role is set
      const destination = profile?.role ? next : '/onboarding'
      return NextResponse.redirect(`${baseUrl}${destination}`)
    }
  }

  // No code provided - redirect to login with error
  return NextResponse.redirect(`${baseUrl}/login?error=auth_callback_error`)
}
