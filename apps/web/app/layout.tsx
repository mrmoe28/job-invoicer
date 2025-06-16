import './globals.css'
import { Inter } from 'next/font/google'
import { TrpcProvider } from '../providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PulseCRM - Crew Management Dashboard',
  description: 'Modern React-based CRM dashboard for crew management with intelligent interfaces and advanced collaboration tools',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TrpcProvider>{children}</TrpcProvider>
      </body>
    </html>
  )
}
