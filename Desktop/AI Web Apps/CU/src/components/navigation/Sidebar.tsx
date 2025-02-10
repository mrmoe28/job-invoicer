'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Settings, Shield, MessageSquare, PenSquare } from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()

  const defaultItems = [
    { icon: <Shield size={20} />, label: 'Certificates', href: '/certificates' },
    { icon: <MessageSquare size={20} />, label: 'Chat', href: '/chat' },
    { icon: <PenSquare size={20} />, label: 'Composer', href: '/composer' },
    { icon: <FileText size={20} />, label: 'Config', href: '/config' },
    { icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
  ]

  return (
    <aside className="w-64 bg-[#252526] text-gray-300">
      <div className="p-4">
        <div className="space-y-4">
          {defaultItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center space-x-3 p-3 rounded-lg hover:bg-[#37373D] ${
                pathname === item.href ? 'bg-[#37373D]' : ''
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
} 