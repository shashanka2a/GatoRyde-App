'use client'

import { useState, useEffect } from 'react'

interface QueueStats {
  pending: number
  processing: number
  deadLetter: number
}

interface ProcessorStatus {
  isRunning: boolean
  isProcessing: boolean
}

interface DeadLetterItem {
  id: string
  type: string
  channel: string
  recipientId: string
  status: string
  attempts: number
  errorMessage?: string
  createdAt: string
}

export default function NotificationsAdminPage() {
  const [stats, setStats] = useState<QueueStats | null>(null)
  const [status, setStatus] = useState<ProcessorStatus | null>(null)
  const [deadLetters, setDeadLetters] = useState<DeadLetterItem[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/notifications/process')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.queue)
        setStatus(data.processor)
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }

  const fetchDeadLetters = async () => {
    try {
      const response = await fetch('/api/notifications/dead-letter')
      const data = await response.json()
      
      if (data.success) {
        setDeadLetters(data.deadLetters)
      }
    } catch (error) {
      console.error('Failed to fetch dead letters:', error)
    }
  }

  const processNow = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/notifications/process', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        setMessage('Notifications processed successfully')
        setStats(data.stats)
        await fetchStatus()
      } else {
        setMessage('Failed to process notifications')
      }
    } catch (error) {
      setMessage('Error processing notifications')
    } finally {
      setLoading(false)
    }
  }

  const runMaintenance = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/notifications/maintenance', {
        method: 'POST'
      })
      const data = await response.json()
      
      if (data.success) {
        setMessage('Maintenance completed successfully')
        await fetchStatus()
      } else {
        setMessage('Failed to run maintenance')
      }
    } catch (error) {
      setMessage('Error running maintenance')
    } finally {
      setLoading(false)
    }
  }

  const testBookingNotification = async (type: string) => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/webhooks/booking-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingId: 'test-booking-id',
          oldStatus: 'pending',
          newStatus: type,
          reason: type === 'cancelled' ? 'Test cancellation' : undefined,
          disputeReason: type === 'disputed' ? 'Test dispute reason' : undefined
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMessage(`Test ${type} notification queued`)
        await fetchStatus()
      } else {
        setMessage(`Failed to queue ${type} notification`)
      }
    } catch (error) {
      setMessage(`Error testing ${type} notification`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notifications Admin</h1>
        <p className="text-gray-600 mt-2">
          Monitor and manage the notification system
        </p>
      </div>

      {message && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">{message}</p>
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Processor Status</h3>
          {status ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Running:</span>
                <span className={`text-sm font-medium ${status.isRunning ? 'text-green-600' : 'text-red-600'}`}>
                  {status.isRunning ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Processing:</span>
                <span className={`text-sm font-medium ${status.isProcessing ? 'text-yellow-600' : 'text-gray-600'}`}>
                  {status.isProcessing ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading...</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Queue Stats</h3>
          {stats ? (
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending:</span>
                <span className="text-sm font-medium text-blue-600">{stats.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Processing:</span>
                <span className="text-sm font-medium text-yellow-600">{stats.processing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Dead Letter:</span>
                <span className="text-sm font-medium text-red-600">{stats.deadLetter}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Loading...</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="font-medium text-gray-900 mb-4">Actions</h3>
          <div className="space-y-2">
            <button
              onClick={processNow}
              disabled={loading}
              className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Process Now
            </button>
            <button
              onClick={runMaintenance}
              disabled={loading}
              className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Run Maintenance
            </button>
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="w-full px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50"
            >
              Refresh Status
            </button>
          </div>
        </div>
      </div>

      {/* Test Notifications */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Test Notifications</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <button
            onClick={() => testBookingNotification('authorized')}
            disabled={loading}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Authorized
          </button>
          <button
            onClick={() => testBookingNotification('in_progress')}
            disabled={loading}
            className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 disabled:opacity-50"
          >
            In Progress
          </button>
          <button
            onClick={() => testBookingNotification('completed')}
            disabled={loading}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Completed
          </button>
          <button
            onClick={() => testBookingNotification('cancelled')}
            disabled={loading}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            Cancelled
          </button>
          <button
            onClick={() => testBookingNotification('disputed')}
            disabled={loading}
            className="px-3 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            Disputed
          </button>
        </div>
      </div>

      {/* Dead Letter Queue */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-900">Dead Letter Queue</h3>
          <button
            onClick={fetchDeadLetters}
            disabled={loading}
            className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 disabled:opacity-50"
          >
            Load Dead Letters
          </button>
        </div>
        
        {deadLetters.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Attempts
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Error
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deadLetters.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {item.id.substring(0, 12)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.channel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.attempts}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 max-w-xs truncate">
                      {item.errorMessage || 'Unknown error'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No dead letter items found</p>
        )}
      </div>
    </div>
  )
}