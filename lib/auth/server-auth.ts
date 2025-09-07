import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAuthCookies } from './cookies'
import { prisma } from '@/lib/db/client'

export interface AuthenticatedUser {
  id: string
  email: string
  name?: string | null
  phone?: string | null
  eduVerified: boolean
  university?: string | null
  photoUrl?: string | null
}

/**
 * Require user to be authenticated and edu-verified
 * Throws redirect to login if not authenticated
 */
export async function requireEduVerified(): Promise<AuthenticatedUser> {
  const authCookies = getAuthCookies()
  
  if (!authCookies.uid || !authCookies.eduVerified) {
    redirect('/auth/login?error=authentication-required')
  }

  // Fetch user from database to ensure they still exist and are verified
  const user = await prisma.user.findUnique({
    where: { id: authCookies.uid }
  })

  if (!user || !user.eduVerified) {
    redirect('/auth/login?error=verification-required')
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    eduVerified: user.eduVerified,
    university: user.university,
    photoUrl: user.photoUrl,
  }
}

/**
 * Get current user if authenticated, otherwise return null
 * Does not redirect - useful for optional authentication
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  try {
    const authCookies = getAuthCookies()
    
    if (!authCookies.uid || !authCookies.eduVerified) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { id: authCookies.uid }
    })

    if (!user || !user.eduVerified) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      eduVerified: user.eduVerified,
      university: user.university,
      photoUrl: user.photoUrl,
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user is authenticated (has valid cookies)
 * Does not verify with database - fast check
 */
export function isAuthenticated(): boolean {
  const authCookies = getAuthCookies()
  return !!(authCookies.uid && authCookies.eduVerified)
}
