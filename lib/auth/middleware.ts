import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest } from './jwt'

export async function requireAuth(request: NextRequest) {
  const user = await getTokenFromRequest(request)
  
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required' },
      { status: 401 }
    )
  }

  return { user }
}

export async function optionalAuth(request: NextRequest) {
  const user = await getTokenFromRequest(request)
  return { user }
}