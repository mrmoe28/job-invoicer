'use client'

import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/navigation/Sidebar'
import Header from '@/components/navigation/Header'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#1E1E1E]`}>
        <div className="flex h-screen bg-[#1E1E1E] text-gray-300">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
} 