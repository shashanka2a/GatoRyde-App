import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export function setAuthCookies(userId: string, eduVerified: boolean, response?: NextResponse) {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  }

  const cookiesToSet = [
    { name: 'uid', value: userId },
    { name: 'eduVerified', value: eduVerified ? '1' : '0' }
  ]

  if (response) {
    cookiesToSet.forEach(cookie => {
      response.cookies.set(cookie.name, cookie.value, cookieOptions)
    })
  } else {
    const cookieStore = cookies()
    cookiesToSet.forEach(cookie => {
      cookieStore.set(cookie.name, cookie.value, cookieOptions)
    })
  }
}

export function getAuthCookies(request?: NextRequest) {
  if (request) {
    return {
      uid: request.cookies.get('uid')?.value,
      eduVerified: request.cookies.get('eduVerified')?.value === '1'
    }
  }
  
  const cookieStore = cookies()
  return {
    uid: cookieStore.get('uid')?.value,
    eduVerified: cookieStore.get('eduVerified')?.value === '1'
  }
}

export function clearAuthCookies(response?: NextResponse) {
  const cookiesToClear = ['uid', 'eduVerified']
  
  if (response) {
    cookiesToClear.forEach(name => response.cookies.delete(name))
  } else {
    const cookieStore = cookies()
    cookiesToClear.forEach(name => cookieStore.delete(name))
  }
}
