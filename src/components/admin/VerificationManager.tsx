'use client'

import { useState, useEffect } from 'react'
import { 
  getPendingVerifications, 
  reviewKYCVerification,
  type VerificationWithUser 
} from '@/lib/kyc/actions'
import { 
  getVerificationDisplayName, 
  getStatusColor, 
  maskLicenseNumber 
} from '@/lib/kyc/types'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Textarea } from '@/src/components/ui/textarea'
import { Label } from '@/src/components/ui/label'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs'
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  FileText,
  Car,
  GraduationCap,
  Shield
} from 'lucide-react'

interface ReviewDialogProps {
  verification: VerificationWithUser
  onReview: (id: string, status: 'approved' | 'rejected', notes?: string) => Promise<void>
}

function ReviewDialog({ verification, onReview }: ReviewDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReview = async (status: 'approved' | 'rejected') => {
    setIsSubmitting(true)
    try {
      await onReview(verification.id, status, notes)
      setIsOpen(false)
      setNotes('')
    } catch (error) {
      console.error('Review error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderVerificationData = () => {
    const data = verification.data as any
    
    switch (verification.type) {
      case 'license':
        return (
          <div className="space-y-2">
            <p><strong>License Number:</strong> {maskLicenseNumber(data.licenseNumber)}</p>
            <p><strong>State:</strong> {data.licenseState}</p>
            <p><strong>Expiration:</strong> {new Date(data.expirationDate).toLocaleDateString()}</p>
          </div>
        )
      case 'vehicle':
        return (
          <div className="space-y-2">
            <p><strong>Make/Model:</strong> {data.make} {data.model}</p>
            <p><strong>Year:</strong> {data.year}</p>
            <p><strong>Color:</strong> {data.color}</p>
            <p><strong>License Plate:</strong> {data.licensePlate}</p>
            <p><strong>VIN:</strong> {data.vin}</p>
            <p><strong>Seats:</strong> {data.seats}</p>
          </div>
        )
      case 'student':
        return (
          <div className="space-y-2">
            <p><strong>Student ID:</strong> {data.studentId}</p>
            <p><strong>University:</strong> {data.university}</p>
            <p><strong>Major:</strong> {data.major}</p>
            <p><strong>Graduation Year:</strong> {data.graduationYear}</p>
          </div>
        )
      default:
        return <p>No data available</p>
    }
  }

  const renderFiles = () => {
    const files = verification.files as Record<string, any>
    if (!files || Object.keys(files).length === 0) {
      return <p>No files uploaded</p>
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(files).map(([fieldName, fileData]) => (
          <div key={fieldName} className="space-y-2">
            <Label className="capitalize">{fieldName.replace(/([A-Z])/g, ' $1').trim()}</Label>
            <div className="border rounded-lg p-2">
              {fileData.type?.startsWith('image/') ? (
                <img
                  src={fileData.url}
                  alt={fieldName}
                  className="w-full h-48 object-contain rounded"
                />
              ) : (
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded">
                  <FileText className="w-8 h-8 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-600">PDF Document</span>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Size: {(fileData.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const getIcon = () => {
    switch (verification.type) {
      case 'license': return <Shield className="w-4 h-4" />
      case 'vehicle': return <Car className="w-4 h-4" />
      case 'student': return <GraduationCap className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="w-4 h-4 mr-2" />
          Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getIcon()}
            {getVerificationDisplayName(verification.type)} Verification
          </DialogTitle>
          <DialogDescription>
            Review and approve or reject this verification request
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="user">User Info</TabsTrigger>
            <TabsTrigger value="data">Verification Data</TabsTrigger>
            <TabsTrigger value="files">Uploaded Files</TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span>{verification.user.name || 'No name provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span>{verification.user.email}</span>
                </div>
                {verification.user.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{verification.user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Submitted: {verification.createdAt.toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Verification Details</CardTitle>
              </CardHeader>
              <CardContent>
                {renderVerificationData()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Documents</CardTitle>
              </CardHeader>
              <CardContent>
                {renderFiles()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="notes">Review Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this verification..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleReview('rejected')}
              disabled={isSubmitting}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleReview('approved')}
              disabled={isSubmitting}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function VerificationManager() {
  const [verifications, setVerifications] = useState<VerificationWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadVerifications()
  }, [])

  const loadVerifications = async () => {
    try {
      const data = await getPendingVerifications()
      setVerifications(data)
    } catch (error) {
      console.error('Error loading verifications:', error)
      setMessage('Failed to load verifications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReview = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      const result = await reviewKYCVerification(id, status, notes)
      if (result.success) {
        setMessage(result.message)
        await loadVerifications() // Reload the list
      } else {
        setMessage(result.message)
      }
    } catch (error) {
      console.error('Review error:', error)
      setMessage('Failed to review verification')
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'license': return <Shield className="w-4 h-4" />
      case 'vehicle': return <Car className="w-4 h-4" />
      case 'student': return <GraduationCap className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-2"></div>
            <p>Loading verifications...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">KYC Verification Management</h1>
          <p className="text-gray-600">Review and approve pending verification requests</p>
        </div>
        <Badge variant="secondary">
          {verifications.length} Pending
        </Badge>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {verifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-gray-600">No pending verifications to review.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {verifications.map((verification) => (
            <Card key={verification.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(verification.type)}
                      <div>
                        <h3 className="font-semibold">
                          {getVerificationDisplayName(verification.type)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {verification.user.name || verification.user.email}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={`bg-${getStatusColor(verification.status)}-100 text-${getStatusColor(verification.status)}-800`}
                    >
                      {verification.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {verification.createdAt.toLocaleDateString()}
                    </span>
                    <ReviewDialog 
                      verification={verification} 
                      onReview={handleReview}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}