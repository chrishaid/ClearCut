'use client'

import { useState, useEffect } from 'react'
import { getPendingLinkRequests, acceptLinkRequest, declineLinkRequest } from '@/actions/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Check, X, Loader2, Mail } from 'lucide-react'

interface LinkRequest {
  id: string
  parent_id: string
  student_email: string
  created_at: string
  expires_at: string
  parent: {
    email: string
    display_name: string | null
  }
}

export function PendingLinkRequests() {
  const [requests, setRequests] = useState<LinkRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    loadRequests()
  }, [])

  async function loadRequests() {
    setLoading(true)
    const { requests } = await getPendingLinkRequests()
    setRequests(requests as LinkRequest[])
    setLoading(false)
  }

  async function handleAccept(requestId: string) {
    setProcessingId(requestId)
    const result = await acceptLinkRequest(requestId)
    if (result.success) {
      setRequests(requests.filter(r => r.id !== requestId))
    }
    setProcessingId(null)
  }

  async function handleDecline(requestId: string) {
    setProcessingId(requestId)
    const result = await declineLinkRequest(requestId)
    if (result.success) {
      setRequests(requests.filter(r => r.id !== requestId))
    }
    setProcessingId(null)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return null // Don't show the card if there are no requests
  }

  return (
    <Card className="border-purple-200 bg-purple-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Users className="h-5 w-5" />
          Parent Link Requests
        </CardTitle>
        <CardDescription className="text-purple-700">
          A parent wants to link their account to track your progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div
            key={request.id}
            className="p-4 bg-white rounded-lg border border-purple-200 space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {request.parent.display_name || 'A parent'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {request.parent.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Requested {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAccept(request.id)}
                disabled={processingId === request.id}
                className="flex-1"
              >
                {processingId === request.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Accept
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDecline(request.id)}
                disabled={processingId === request.id}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-1" />
                Decline
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              If you accept, this parent will be able to view your study progress and statistics.
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
