'use client'

import { Send, Smile, Paperclip } from 'lucide-react'
import Image from 'next/image'

interface Message {
  id: string
  content: string
  sender: string
  timestamp: Date
  isMe: boolean
}

export default function ChatPage() {
  const messages: Message[] = [
    {
      id: '1',
      content: 'Hey, how can I help with TLS certificates today?',
      sender: 'Support',
      timestamp: new Date(),
      isMe: false
    },
    {
      id: '2',
      content: 'I need help configuring mutual TLS authentication',
      sender: 'Me',
      timestamp: new Date(),
      isMe: true
    }
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.isMe
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              <p>{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300">
            <Paperclip size={20} />
          </button>
          <input
            type="text"
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
          />
          <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-300">
            <Smile size={20} />
          </button>
          <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
} 