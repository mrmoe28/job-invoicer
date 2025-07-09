import type { Metadata } from 'next'
import '@/styles/globals.css'
import { Navbar } from '@/components/navbar'

export const metadata: Metadata = {
  title: 'Job Invoicer',
  description: 'Manage jobs and invoices efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
  )
}