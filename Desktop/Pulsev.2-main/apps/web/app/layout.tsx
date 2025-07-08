import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode, Suspense } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { AppProviders } from '@/components/providers/AppProviders'
import { ErrorBoundary } from '@/components/core/ErrorBoundary'
import { LoadingSpinner } from '@/components/core/LoadingSpinner'
import { NotificationContainer } from '@/components/core/NotificationContainer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  title: {
    default: 'Pulse CRM - Solar Contractor Management Platform',
    template: '%s | Pulse CRM'
  },
  description: 'Production-ready CRM platform built specifically for solar contractors. Manage customers, contracts, documents, and e-signatures with enterprise-grade features.',
  keywords: [
    'solar CRM', 
    'contractor management', 
    'solar business software', 
    'e-signature platform',
    'document management',
    'customer management',
    'solar industry',
    'construction CRM'
  ],
  authors: [{ name: 'Pulse CRM Team' }],
  creator: 'Pulse CRM',
  publisher: 'Pulse CRM',
  robots: {
    index: process.env.NODE_ENV === 'production',
    follow: process.env.NODE_ENV === 'production',
  },
  openGraph: {
    type: 'website',
    siteName: 'Pulse CRM',
    title: 'Pulse CRM - Solar Contractor Management Platform',
    description: 'Production-ready CRM platform built specifically for solar contractors',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pulse CRM Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulse CRM - Solar Contractor Management Platform',
    description: 'Production-ready CRM platform built specifically for solar contractors',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f97316' },
    { media: '(prefers-color-scheme: dark)', color: '#ea580c' },
  ],
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen bg-gray-50 dark:bg-gray-900`}>
        <ErrorBoundary>
          <AppProviders>
            <Suspense 
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <LoadingSpinner size="lg" text="Loading Pulse CRM..." />
                </div>
              }
            >
              {children}
            </Suspense>
            <NotificationContainer />
          </AppProviders>
        </ErrorBoundary>
        
        {/* Performance and Analytics */}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  )
}