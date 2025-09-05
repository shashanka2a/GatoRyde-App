'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Textarea } from '@/src/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/src/components/ui/dialog'

interface Dispute {
  id: string
  bookingId: string
  openedById: string
  reason: string
  status: 'open' | 'resolved' | 'rejected'
  resolution?: string
  contactLogsSnapshot?: any[]
  createdAt: string
  updatedAt: string
  booking: {
    id: string
    seats: number
    ride: {
      originText: string
      destText: string
      departAt: string
      driver: {
        user: {
          name: string
          email: string
        }
      }
    }
    rider: {
      name: string
      email: string
    }
  }
  openedBy: {
    name: string
    email: string
  }
}

export function DisputeManager() {
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [resolution, setResolution] = useState('')
  const [resolving, setResolving] = useState(false)

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    try {
      const response = await fetch('/api/admin/disputes')
      if (response.ok) {
        const data = await response.json()
        setDisputes(data.disputes)
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error)
    } finally {
      setLoading(false)
    }
  }

  const resolveDispute = async (disputeId: string, status: 'resolved' | 'rejected') => {
    if (!resolution.trim()) {
      alert('Please provide a resolution message')
      return
    }

    setResolving(true)
    try {
      const response = await fetch(`/api/admin/disputes/${disputeId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          resolution: resolution.trim(),
        }),
      })

      if (response.ok) {
        await fetchDisputes()
        setSelectedDispute(null)
        setResolution('')
        alert(`Dispute ${status} successfully`)
      } else {
        const error = await response.json()
        alert(`Failed to resolve dispute: ${error.message}`)
      }
    } catch (error) {
      console.error('Failed to resolve dispute:', error)
      alert('Failed to resolve dispute')
    } finally {
      setResolving(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive">Open</Badge>
      case 'resolved':
        return <Badge variant="default">Resolved</Badge>
      case 'rejected':
        return <Badge variant="secondary">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading disputes...</div>
      </div>
    )
  }

  const openDisputes = disputes.filter(d => d.status === 'open')
  const resolvedDisputes = disputes.filter(d => d.status !== 'open')

  return (
    <div className="space-y-6">
      {/* Open Disputes */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Open Disputes ({openDisputes.length})
        </h2>
        {openDisputes.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No open disputes to review
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {openDisputes.map((dispute) => (
              <Card key={dispute.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {dispute.booking.ride.originText} → {dispute.booking.ride.destText}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Opened by: {dispute.openedBy.name} ({dispute.openedBy.email})
                      </p>
                      <p className="text-sm text-gray-600">
                        Created: {formatDate(dispute.createdAt)}
                      </p>
                    </div>
                    {getStatusBadge(dispute.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Dispute Reason:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded">
                        {dispute.reason}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium">Ride Details:</h4>
                        <p>Date: {formatDate(dispute.booking.ride.departAt)}</p>
                        <p>Seats: {dispute.booking.seats}</p>
                        <p>Driver: {dispute.booking.ride.driver.user.name}</p>
                        <p>Rider: {dispute.booking.rider.name}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Contact Information:</h4>
                        <p>Driver: {dispute.booking.ride.driver.user.email}</p>
                        <p>Rider: {dispute.booking.rider.email}</p>
                      </div>
                    </div>

                    {dispute.contactLogsSnapshot && dispute.contactLogsSnapshot.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Contact History:</h4>
                        <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                          {dispute.contactLogsSnapshot.map((log: any, index: number) => (
                            <div key={index} className="text-sm mb-1">
                              {formatDate(log.createdAt)}: {log.method} contact
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            onClick={() => setSelectedDispute(dispute)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Resolve
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resolve Dispute</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Dispute:</h4>
                              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                {dispute.reason}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Resolution Message:
                              </label>
                              <Textarea
                                value={resolution}
                                onChange={(e) => setResolution(e.target.value)}
                                placeholder="Explain how this dispute was resolved and any actions taken..."
                                rows={4}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => resolveDispute(dispute.id, 'resolved')}
                                disabled={resolving}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {resolving ? 'Resolving...' : 'Mark Resolved'}
                              </Button>
                              <Button
                                onClick={() => resolveDispute(dispute.id, 'rejected')}
                                disabled={resolving}
                                variant="destructive"
                              >
                                {resolving ? 'Rejecting...' : 'Reject Dispute'}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Disputes */}
      {resolvedDisputes.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">
            Resolved Disputes ({resolvedDisputes.length})
          </h2>
          <div className="grid gap-4">
            {resolvedDisputes.map((dispute) => (
              <Card key={dispute.id} className="opacity-75">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {dispute.booking.ride.originText} → {dispute.booking.ride.destText}
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Resolved: {formatDate(dispute.updatedAt)}
                      </p>
                    </div>
                    {getStatusBadge(dispute.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-medium text-sm">Original Dispute:</h4>
                      <p className="text-sm text-gray-600">{dispute.reason}</p>
                    </div>
                    {dispute.resolution && (
                      <div>
                        <h4 className="font-medium text-sm">Resolution:</h4>
                        <p className="text-sm text-gray-600">{dispute.resolution}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}