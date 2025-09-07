// Simplified auth session for MVP
export async function getSession() {
  // Mock session for MVP
  return {
    user: {
      id: 'mock-user-id',
      email: 'user@example.com',
      name: 'Mock User',
      eduVerified: true
    }
  }
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return { user }
}

export async function requireVerifiedUser() {
  const session = await requireAuth()
  if (!session.user.eduVerified) {
    throw new Error("Email verification required")
  }
  return session
}