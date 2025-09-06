'use client'

import { useAuthGuard } from './AuthGuard'
import { Button } from '@/src/components/ui/button'
import { Car, MessageSquare, Mail, Phone } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface ProtectedActionButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'default' | 'outline' | 'secondary'
  className?: string
}

export function ProtectedActionButton({ 
  children, 
  href, 
  onClick, 
  variant = 'default',
  className 
}: ProtectedActionButtonProps) {
  const { isAuthenticated, isVerified } = useAuthGuard()

  const handleClick = () => {
    if (!isAuthenticated || !isVerified) {
      toast.error('Please sign in with your .edu email to continue')
      return
    }
    
    if (onClick) {
      onClick()
    }
  }

  if (href && isAuthenticated && isVerified) {
    return (
      <Link href={href}>
        <Button variant={variant} className={className}>
          {children}
        </Button>
      </Link>
    )
  }

  return (
    <Button 
      variant={variant} 
      className={className}
      onClick={href ? () => handleClick() : handleClick}
    >
      {children}
    </Button>
  )
}

// Pre-built action buttons
export function OfferRideButton({ className }: { className?: string }) {
  return (
    <ProtectedActionButton 
      href="/drive/create" 
      className={className}
    >
      <Car className="h-4 w-4 mr-2" />
      Offer a Ride
    </ProtectedActionButton>
  )
}

export function PostRequestButton({ className }: { className?: string }) {
  return (
    <ProtectedActionButton 
      href="/ride/request" 
      className={className}
      variant="outline"
    >
      <MessageSquare className="h-4 w-4 mr-2" />
      Post a Request
    </ProtectedActionButton>
  )
}

// Contact driver actions (these should work for everyone but show login prompt)
interface ContactDriverProps {
  driverEmail?: string
  driverPhone?: string
  rideId: string
  className?: string
}

export function ContactDriverActions({ 
  driverEmail, 
  driverPhone, 
  rideId, 
  className 
}: ContactDriverProps) {
  const { isAuthenticated, isVerified } = useAuthGuard()

  const handleContact = (type: 'email' | 'sms') => {
    if (!isAuthenticated || !isVerified) {
      toast.error('Please sign in with your .edu email to contact drivers')
      return
    }

    // Log contact attempt
    fetch('/api/contacts/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rideId, contactType: type })
    }).catch(console.error)

    if (type === 'email' && driverEmail) {
      window.location.href = `mailto:${driverEmail}?subject=Ride Request - Rydify`
    } else if (type === 'sms' && driverPhone) {
      window.location.href = `sms:${driverPhone}?body=Hi! I'm interested in your ride on Rydify.`
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {driverEmail && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleContact('email')}
        >
          <Mail className="h-4 w-4 mr-2" />
          Email Driver
        </Button>
      )}
      
      {driverPhone && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => handleContact('sms')}
        >
          <Phone className="h-4 w-4 mr-2" />
          Text Driver
        </Button>
      )}
    </div>
  )
}