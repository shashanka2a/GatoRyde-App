import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppNavigation } from '../src/components/layout/AppNavigation'
import { BottomNavigation } from '../src/components/layout/BottomNavigation'
import '../src/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rydify - Student Rideshare App',
  description: 'Safe, verified student ridesharing for university students. Connect with fellow students for affordable rides.',
  keywords: 'rideshare, students, university, carpooling, transportation, app, pwa',
  authors: [{ name: 'Rydify Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Rydify',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Rydify',
    title: 'Rydify - Student Rideshare App',
    description: 'Safe, verified student ridesharing for University of Florida',
  },
  twitter: {
    card: 'summary',
    title: 'Rydify - Student Rideshare App',
    description: 'Safe, verified student ridesharing for University of Florida',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0d9488" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rydify" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.mapbox.com" />
        <link rel="preconnect" href="//api.mapbox.com" />
      </head>
      <body className={inter.className}>
        <AppNavigation />
        <main className="pb-16 lg:pb-0 min-h-screen">{children}</main>
        <BottomNavigation />
      </body>
    </html>
  )
}