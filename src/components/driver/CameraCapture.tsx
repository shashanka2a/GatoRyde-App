'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Alert, AlertDescription } from '@/src/components/ui/alert'
import { 
  Camera, 
  RotateCcw, 
  Check, 
  X, 
  AlertTriangle,
  Smartphone,
  Shield,
  Eye
} from 'lucide-react'

interface CameraCaptureProps {
  documentType: 'license' | 'id'
  onCapture: (imageData: string) => void
  onCancel: () => void
  onSubmitSuccess?: (verificationData: any) => void
  userId?: string
  className?: string
}

export function CameraCapture({ 
  documentType, 
  onCapture, 
  onCancel,
  onSubmitSuccess,
  userId,
  className 
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  
  const [step, setStep] = useState<'setup' | 'camera' | 'preview' | 'submitting'>('setup')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const documentLabels = {
    license: {
      title: "Driver's License",
      icon: Shield,
      instructions: [
        "Hold your driver's license steady in good lighting",
        "Make sure all text is clearly readable",
        "Avoid glare and shadows on the card",
        "Keep the entire license within the frame"
      ]
    },
    id: {
      title: "Student ID",
      icon: Shield,
      instructions: [
        "Hold your student ID card steady in good lighting",
        "Make sure your photo and name are clearly visible",
        "Avoid glare and shadows on the card",
        "Keep the entire ID within the frame"
      ]
    }
  }

  const currentDoc = documentLabels[documentType]
  const Icon = currentDoc.icon

  useEffect(() => {
    return () => {
      // Cleanup camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  const startCamera = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setStep('camera')
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Unable to access camera. Please check permissions and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw the video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Convert to base64 image data
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)
    setStep('preview')

    // Stop camera stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }, [])

  const retakePhoto = () => {
    setCapturedImage(null)
    setStep('setup')
  }

  const confirmPhoto = async () => {
    if (!capturedImage) return

    // If userId is provided, submit to API for verification
    if (userId) {
      setIsSubmitting(true)
      setStep('submitting')
      
      try {
        const response = await fetch('/api/driver/verify-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            documentType,
            imageData: capturedImage,
            metadata: {
              timestamp: new Date().toISOString(),
              deviceInfo: navigator.userAgent
            }
          })
        })

        const data = await response.json()

        if (data.success) {
          onSubmitSuccess?.(data.data)
          onCapture(capturedImage)
        } else {
          setError(data.message || 'Failed to submit document')
          setStep('preview')
        }
      } catch (err) {
        console.error('Document submission error:', err)
        setError('Failed to submit document. Please try again.')
        setStep('preview')
      } finally {
        setIsSubmitting(false)
      }
    } else {
      // Just return the image data without API submission
      onCapture(capturedImage)
    }
  }

  const renderSetupStep = () => (
    <Card className={`shadow-xl border-0 bg-white overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Icon className="w-5 h-5" />
          Capture {currentDoc.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
            <Camera className="w-8 h-8 text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Ready to capture your {documentType === 'license' ? "driver's license" : 'student ID'}?
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We'll guide you through taking a clear photo of your document for verification.
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Photo Guidelines:
          </h4>
          <ul className="text-sm text-blue-800 space-y-2">
            {currentDoc.instructions.map((instruction, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                {instruction}
              </li>
            ))}
          </ul>
        </div>

        <Alert className="border-amber-200 bg-amber-50">
          <Smartphone className="w-4 h-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Camera Permission Required:</strong> We'll ask for camera access to take the photo. 
            Your image is processed securely and only used for verification.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={startCamera}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Starting Camera...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 mr-2" />
                Start Camera
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderCameraStep = () => (
    <Card className={`shadow-xl border-0 bg-white overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Camera className="w-5 h-5" />
          Position Your {currentDoc.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="relative">
          {/* Camera Preview */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            
            {/* Overlay Guide */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white border-dashed rounded-lg w-80 h-48 flex items-center justify-center">
                <div className="text-white text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2 opacity-75" />
                  <p className="text-sm opacity-75">Position {documentType} here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 text-center">
              <strong>Hold steady:</strong> Position your {documentType === 'license' ? "driver's license" : 'student ID'} 
              within the frame and ensure all text is clearly visible.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-gray-300"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={capturePhoto}
            className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
          >
            <Camera className="w-5 h-5 mr-2" />
            Capture Photo
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderPreviewStep = () => (
    <Card className={`shadow-xl border-0 bg-white overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Eye className="w-5 h-5" />
          Review Your Photo
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Does this photo look clear and readable?
          </h3>
          <p className="text-gray-600">
            Make sure all text on your {documentType === 'license' ? "driver's license" : 'student ID'} is clearly visible.
          </p>
        </div>

        {/* Photo Preview */}
        <div className="relative">
          <div className="bg-gray-100 rounded-lg overflow-hidden">
            {capturedImage && (
              <img
                src={capturedImage}
                alt={`Captured ${documentType}`}
                className="w-full h-64 object-contain"
              />
            )}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2">✓ Photo Quality Checklist:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• All text is clearly readable</li>
            <li>• No glare or shadows obscuring information</li>
            <li>• Entire document is visible in frame</li>
            <li>• Photo is not blurry or distorted</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={retakePhoto}
            variant="outline"
            className="border-gray-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Photo
          </Button>
          <Button
            onClick={confirmPhoto}
            className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
          >
            <Check className="w-5 h-5 mr-2" />
            Use This Photo
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderSubmittingStep = () => (
    <Card className={`shadow-xl border-0 bg-white overflow-hidden ${className}`}>
      <CardHeader className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="w-5 h-5" />
          Submitting for Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Processing Your {currentDoc.title}
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            We're securely uploading and processing your document. This may take a moment...
          </p>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">What happens next:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Document is securely uploaded and encrypted</li>
            <li>• Our team will review within 24 hours</li>
            <li>• You'll receive a notification when approved</li>
            <li>• Your trust score will be updated automatically</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )

  // Hidden canvas for image capture
  return (
    <>
      <canvas ref={canvasRef} className="hidden" />
      
      {step === 'setup' && renderSetupStep()}
      {step === 'camera' && renderCameraStep()}
      {step === 'preview' && renderPreviewStep()}
      {step === 'submitting' && renderSubmittingStep()}
    </>
  )
}