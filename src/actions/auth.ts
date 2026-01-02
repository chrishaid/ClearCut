'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signInWithMagicLink(formData: FormData) {
  const email = formData.get('email') as string

  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) {
    console.error('Auth error:', error)
    return { error: 'Failed to send magic link. Please try again.' }
  }

  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
}

export async function setUserRole(role: 'student' | 'parent') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      role,
      study_start_date: role === 'student' ? new Date().toISOString().split('T')[0] : null,
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error setting role:', error)
    return { error: 'Failed to set role. Please try again.' }
  }

  return { success: true }
}

/**
 * Send a link request to a student's email.
 * The student will receive an email with a link to confirm the connection.
 */
export async function sendLinkRequest(studentEmail: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify current user is a parent
  const { data: parentProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (parentProfile?.role !== 'parent') {
    return { error: 'Only parents can send link requests' }
  }

  // Check if student exists
  const { data: studentProfile } = await supabase
    .from('profiles')
    .select('id, role, parent_id, email')
    .eq('email', studentEmail)
    .single()

  if (!studentProfile) {
    return { error: 'No student found with this email. They need to sign up first.' }
  }

  if (studentProfile.role !== 'student') {
    return { error: 'This email belongs to a parent account, not a student.' }
  }

  if (studentProfile.parent_id) {
    return { error: 'This student is already linked to a parent account.' }
  }

  // Create a pending link request
  const { error: insertError } = await supabase
    .from('parent_link_requests')
    .upsert({
      parent_id: user.id,
      student_id: studentProfile.id,
      student_email: studentEmail,
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }, {
      onConflict: 'parent_id,student_id',
    })

  if (insertError) {
    console.error('Error creating link request:', insertError)
    return { error: 'Failed to send link request. Please try again.' }
  }

  // In production, this would send an email to the student
  // For now, the student can see pending requests in their settings

  return {
    success: true,
    message: `Link request sent to ${studentEmail}. They will see it in their settings.`
  }
}

/**
 * Accept a link request from a parent
 */
export async function acceptLinkRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Get the link request
  const { data: request } = await supabase
    .from('parent_link_requests')
    .select('*')
    .eq('id', requestId)
    .eq('student_id', user.id)
    .eq('status', 'pending')
    .single()

  if (!request) {
    return { error: 'Link request not found or already processed' }
  }

  // Check if not expired
  if (new Date(request.expires_at) < new Date()) {
    return { error: 'This link request has expired' }
  }

  // Update the student's parent_id
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ parent_id: request.parent_id })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error linking accounts:', updateError)
    return { error: 'Failed to link accounts. Please try again.' }
  }

  // Mark request as accepted
  await supabase
    .from('parent_link_requests')
    .update({ status: 'accepted' })
    .eq('id', requestId)

  return { success: true }
}

/**
 * Decline a link request from a parent
 */
export async function declineLinkRequest(requestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('parent_link_requests')
    .update({ status: 'declined' })
    .eq('id', requestId)
    .eq('student_id', user.id)

  if (error) {
    return { error: 'Failed to decline request' }
  }

  return { success: true }
}

/**
 * Get pending link requests for current student
 */
export async function getPendingLinkRequests() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { requests: [] }
  }

  const { data: requests } = await supabase
    .from('parent_link_requests')
    .select(`
      *,
      parent:profiles!parent_link_requests_parent_id_fkey(email, display_name)
    `)
    .eq('student_id', user.id)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())

  return { requests: requests || [] }
}
