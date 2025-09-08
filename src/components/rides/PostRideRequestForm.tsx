'use client'

import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import { Calendar } from '@/src/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { CalendarIcon, MapPin, Clock, Users, DollarSign, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/src/lib/utils'
import { toast } from 'sonner'

interface PostRideRequestFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function PostRideRequestForm({ onSuccess, onCancel }: PostRideRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    departAt: '',
    seatsNeeded: 1,
    maxCostCents: 0,
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // For now, we'll use mock coordinates - in a real app, you'd use a map service
      const mockOrigin = {
        text: formData.origin,
        placeName: formData.origin,
        lat: 29.6436 + (Math.random() - 0.5) * 0.01, // Mock coordinates around UF
        lng: -82.3549 + (Math.random() - 0.5) * 0.01
      }

      const mockDestination = {
        text: formData.destination,
        placeName: formData.destination,
        lat: 29.6516 + (Math.random() - 0.5) * 0.01, // Mock coordinates around Gainesville
        lng: -82.3248 + (Math.random() - 0.5) * 0.01
      }

      const response = await fetch('/api/ride-requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          origin: mockOrigin,
          destination: mockDestination,
          departAt: new Date(formData.departAt).toISOString(),
          seatsNeeded: formData.seatsNeeded,
          maxCostCents: formData.maxCostCents * 100, // Convert dollars to cents
          notes: formData.notes
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success('Ride request posted successfully!')
        onSuccess?.()
      } else {
        toast.error(result.error || 'Failed to post ride request')
      }
    } catch (error) {
      console.error('Error posting ride request:', error)
      toast.error('Failed to post ride request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          Post a Ride Request
        </CardTitle>
        <CardDescription>
          Need a ride? Post your request and let drivers know where you need to go.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Origin and Destination */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origin" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                From
              </Label>
              <Input
                id="origin"
                placeholder="e.g., UF Campus, Gainesville"
                value={formData.origin}
                onChange={(e) => handleInputChange('origin', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination" className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                To
              </Label>
              <Input
                id="destination"
                placeholder="e.g., Butler Plaza, Gainesville"
                value={formData.destination}
                onChange={(e) => handleInputChange('destination', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Departure Date and Time */}
          <div className="space-y-2">
            <Label htmlFor="departAt" className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              When do you need to leave?
            </Label>
            <Input
              id="departAt"
              type="datetime-local"
              value={formData.departAt}
              onChange={(e) => handleInputChange('departAt', e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          {/* Seats and Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="seatsNeeded" className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Seats Needed
              </Label>
              <Input
                id="seatsNeeded"
                type="number"
                min="1"
                max="4"
                value={formData.seatsNeeded}
                onChange={(e) => handleInputChange('seatsNeeded', parseInt(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxCost" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Max Cost (per person)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="maxCost"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.maxCostCents / 100}
                  onChange={(e) => handleInputChange('maxCostCents', parseFloat(e.target.value) * 100)}
                  className="pl-8"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requirements, pickup details, or other information..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Posting Request...' : 'Post Ride Request'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
