import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export interface AnonymousData {
  referral?: string
  preferences?: Record<string, any>
  searchHistory?: string[]
  favoriteRoutes?: string[]
  [key: string]: any
}

export class CookieManager {
  private static REFERRAL_COOKIE = "gr_ref"
  private static ANONYMOUS_DATA_COOKIE = "gr_anon"
  private static COOKIE_MAX_AGE = 30 * 24 * 60 * 60 // 30 days

  static setReferralCookie(response: NextResponse, referral: string): void {
    response.cookies.set(this.REFERRAL_COOKIE, referral, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: this.COOKIE_MAX_AGE,
      path: "/",
    })
  }

  static getReferralCookie(request: NextRequest): string | null {
    return request.cookies.get(this.REFERRAL_COOKIE)?.value || null
  }

  static setAnonymousData(response: NextResponse, data: AnonymousData): void {
    const encoded = Buffer.from(JSON.stringify(data)).toString("base64")
    response.cookies.set(this.ANONYMOUS_DATA_COOKIE, encoded, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: this.COOKIE_MAX_AGE,
      path: "/",
    })
  }

  static getAnonymousData(request: NextRequest): AnonymousData | null {
    try {
      const encoded = request.cookies.get(this.ANONYMOUS_DATA_COOKIE)?.value
      if (!encoded) return null

      const decoded = Buffer.from(encoded, "base64").toString("utf-8")
      return JSON.parse(decoded)
    } catch (error) {
      console.error("Failed to decode anonymous data:", error)
      return null
    }
  }

  static clearAnonymousData(response: NextResponse): void {
    response.cookies.delete(this.ANONYMOUS_DATA_COOKIE)
  }

  static clearReferralCookie(response: NextResponse): void {
    response.cookies.delete(this.REFERRAL_COOKIE)
  }

  // Server-side cookie helpers
  static getReferralFromServerCookies(): string | null {
    try {
      const cookieStore = cookies()
      return cookieStore.get(this.REFERRAL_COOKIE)?.value || null
    } catch {
      return null
    }
  }

  static getAnonymousDataFromServerCookies(): AnonymousData | null {
    try {
      const cookieStore = cookies()
      const encoded = cookieStore.get(this.ANONYMOUS_DATA_COOKIE)?.value
      if (!encoded) return null

      const decoded = Buffer.from(encoded, "base64").toString("utf-8")
      return JSON.parse(decoded)
    } catch (error) {
      console.error("Failed to decode anonymous data from server cookies:", error)
      return null
    }
  }

  // Merge anonymous data into user profile
  static async mergeAnonymousDataIntoUser(
    userId: string,
    anonymousData: AnonymousData
  ): Promise<void> {
    try {
      // Import here to avoid circular dependencies
      const { prisma } = await import("../db/client")
      
      // Extract referral information
      if (anonymousData.referral) {
        // Store referral information (you might want to create a separate referrals table)
        console.log(`User ${userId} was referred by: ${anonymousData.referral}`)
      }

      // You can extend this to merge other anonymous data like:
      // - Search preferences
      // - Favorite routes
      // - UI preferences
      // - etc.

      console.log(`Merged anonymous data for user ${userId}:`, anonymousData)
    } catch (error) {
      console.error("Failed to merge anonymous data:", error)
      // Don't throw - this shouldn't block the authentication flow
    }
  }
}