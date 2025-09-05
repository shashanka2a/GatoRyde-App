// Simplified auth config for MVP build
export const authOptions = {
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.phone = user.phone
        token.eduVerified = user.eduVerified
        token.photoUrl = user.photoUrl
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id
        session.user.email = token.email
        session.user.phone = token.phone
        session.user.eduVerified = token.eduVerified
        session.user.photoUrl = token.photoUrl
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
}