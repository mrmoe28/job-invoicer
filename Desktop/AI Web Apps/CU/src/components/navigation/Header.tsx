'use client'

import { MessageSquare, PenSquare } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Header() {
  const pathname = usePathname()
  
  const isActive = (path: string) => pathname === path
  
  return (
    <header className="h-16 border-b border-[#2D2D2D] bg-[#333333] flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-semibold text-white hover:text-gray-300">
          TLS Certificate Manager
        </Link>
        <nav className="ml-8 flex items-center space-x-4">
          <Link
            href="/chat"
            className={`p-2 rounded-lg ${
              isActive('/chat')
                ? 'bg-[#37373D] text-white'
                : 'text-gray-300 hover:bg-[#37373D]'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare size={20} />
              <span className="hidden md:inline">Chat</span>
            </span>
          </Link>
          <Link
            href="/composer"
            className={`p-2 rounded-lg ${
              isActive('/composer')
                ? 'bg-[#37373D] text-white'
                : 'text-gray-300 hover:bg-[#37373D]'
            }`}
          >
            <span className="flex items-center gap-2">
              <PenSquare size={20} />
              <span className="hidden md:inline">Composer</span>
            </span>
          </Link>
        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <Link
          href="/settings"
          className={`p-2 rounded-lg ${
            isActive('/settings')
              ? 'bg-[#37373D] text-white'
              : 'text-gray-300 hover:bg-[#37373D]'
          }`}
        >
          Settings
        </Link>
      </div>
    </header>
  )
} 