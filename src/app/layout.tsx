import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import SessionProviderWrapper from "../components/SessionProviderWrapper"
import { metadata as siteMetadata } from './metadata'
import { organizationSchema, websiteSchema } from '../lib/schemas'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import ErrorBoundary from '@/components/ErrorBoundary'
import { setupErrorTracking } from '@/lib/errorTracking'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = siteMetadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <SessionProviderWrapper>
            {children}
          </SessionProviderWrapper>
        </ErrorBoundary>
        <Toaster />
        <Analytics />
        <SpeedInsights />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                ${setupErrorTracking.toString()}();
              }
            `
          }}
        />
      </body>
    </html>
  )
}
